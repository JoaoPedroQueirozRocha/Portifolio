# Frontend — Análise de Qualidade e Sugestões de Melhoria

> Análise feita sobre o estado atual do projeto em **junho de 2026**.  
> Organizada por categoria, da mais crítica para a mais incremental.

---

## 1. Acessibilidade (A11y)

### 1.1 Botões sem semântica adequada na Home (`page.tsx`)
Os CTAs "Ver projetos" e "Entrar em contato" são `<button>` soltos sem `onClick`, sem `href`, sem `aria-label` descritivo. CTAs de navegação devem ser `<Link>` (âncoras), não `<button>`.

```tsx
// ❌ Atual
<button>Ver projetos</button>

// ✅ Correto
<Link href={`/${lang}/projects`} className="...">
  Ver projetos
</Link>
```

### 1.2 Logo sem `aria-label`
`Logo.tsx` renderiza um `<Link>` com conteúdo visual (sigil + texto "João Pedro"). Se o texto já está visível, está correto — mas se o texto for escondido em mobile, o link precisa de `aria-label`.

### 1.3 Botão de tema: ícone sem texto alternativo real
O `aria-label={themeLabel}` está correto, mas o ícone Lucide não tem `aria-hidden`. Ícones dentro de botões com `aria-label` devem ter `aria-hidden="true"` para não poluir a árvore de acessibilidade.

```tsx
// ✅
<Sun size={16} aria-hidden="true" />
```

### 1.4 Foco de teclado
Nenhum estilo de `:focus-visible` personalizado foi definido. O `outline-ring/50` global no CSS é um bom começo, mas verifique se o anel de foco aparece corretamente sobre o fundo escuro âmbar.

---

## 2. Estrutura de Componentes

### 2.1 Lógica de negócio embutida em `page.tsx`
A paleta de cores (o array de `{ label, bg }`) é conteúdo de demonstração que não pertence a uma página de produção. Crie uma rota separada `/styleguide` ou remova antes do deploy.

### 2.2 `isValidLocale` duplicado
`isValidLocale` é importado de dois lugares diferentes:
- `[lang]/layout.tsx` importa de `@/lib/i18n`
- `[lang]/page.tsx` importa de `./dictionaries`

`dictionaries.ts` re-exporta `isValidLocale` de `lib/i18n`, criando uma camada desnecessária. Padronize: importe sempre de `@/lib/i18n`.

```ts
// dictionaries.ts — remova o re-export
export { isValidLocale } from '@/lib/i18n' // ← desnecessário, remover
```

### 2.3 Ausência de barrel exports (`index.ts`)
Com o crescimento do projeto, importar componente a componente fica verboso. Considere adicionar barrels por domínio:

```
components/layout/index.ts  →  export { Header, Logo, Providers }
components/ui/index.ts      →  export { Button, Card, ... }
```

### 2.4 Separação UI / lógica no `Header`
O `Header` hoje mistura três responsabilidades: estrutura visual, estado de tema e lógica de active-link. Quando o scroll behavior e o mobile nav forem adicionados, ele vai crescer demais. Considere extrair:

```
Header.tsx           ← casca: layout e composição
ThemeToggle.tsx      ← botão de tema isolado (mounted, useTheme)
NavLinks.tsx         ← lista de links com lógica de active
MobileNav.tsx        ← hamburger + drawer (a implementar)
```

---

## 3. Performance

### 3.1 Sem `generateMetadata` nas páginas filhas
`app/layout.tsx` define metadata genérico, mas `[lang]/page.tsx` não exporta `generateMetadata`. O Google vai indexar todas as páginas com o mesmo `<title>`. Cada page deve ter seu próprio:

```tsx
export async function generateMetadata({ params }: PageProps<'/[lang]'>) {
  const { lang } = await params
  return {
    title: lang === 'pt-BR' ? 'Início' : 'Home',
    // description, openGraph, twitter...
  }
}
```

### 3.2 Fontes: sem `preload` explícito das fontes críticas
O `display: "swap"` já está correto. Mas `IM_Fell_English` (a fonte do hero h1) é a mais visível — considere adicionar `preload: true` nela para evitar FOUT no h1.

```ts
const imFell = IM_Fell_English({
  // ...
  preload: true, // adicionar
})
```

### 3.3 `body::before` com 6 gradientes empilhados
O pseudo-elemento de fundo usa 6 camadas de `radial-gradient` + `repeating-linear-gradient`. Em dispositivos com GPU limitada isso pode causar repaint. Se notar jank, mova as faíscas para um elemento `<canvas>` estático ou uma imagem SVG.

### 3.4 Assets padrão do Next.js não removidos
`public/` ainda contém `file.svg`, `globe.svg`, `vercel.svg`, `window.svg` gerados pelo scaffolding. Limpe antes do deploy para não poluir o bundle de assets.

---

## 4. Type Safety

### 4.1 `LayoutProps` e `PageProps` não importados explicitamente
`[lang]/layout.tsx` e `[lang]/page.tsx` usam `LayoutProps<'/[lang]'>` e `PageProps<'/[lang]'>` sem nenhum `import`. Esses types vêm do `.next/types/` gerado em tempo de build — correto para Next.js 16, mas adicione um comentário explicando a origem para outros devs não ficarem confusos:

```tsx
// PageProps e LayoutProps são tipos globais gerados pelo Next.js 16
// em .next/types/. Não precisam de import.
```

### 4.2 `lang: string` no `Header` deveria ser `Locale`
O `HeaderProps` declara `lang: string` quando poderia ser `lang: Locale` do `@/lib/i18n`. Isso adiciona type safety sem custo:

```tsx
import type { Locale } from '@/lib/i18n'

interface HeaderProps {
  lang: Locale   // ← era string
  nav: Dictionary['nav']
  themeLabel: string
}
```

### 4.3 `NAV_ROUTES` key não validada contra `Dictionary["nav"]`
O `key as keyof typeof nav` no Header faz um cast que pode falhar silenciosamente se as chaves do dicionário e do `NAV_ROUTES` divergirem. Derive as chaves do tipo do dicionário:

```tsx
type NavKey = keyof Dictionary['nav']  // 'home' | 'shelf' | 'blog' | 'stats'

const NAV_ROUTES: Array<{ key: NavKey; path: string }> = [...]
```

---

## 5. Internacionalização

### 5.1 Textos hardcoded em português na `page.tsx`
`"Paleta de Cores"` na seção de demonstração está hardcoded em PT. Mesmo sendo conteúdo temporário, sirva de alerta: qualquer string visível precisa passar pelo dicionário.

### 5.2 O proxy não seta o cookie de locale
O `proxy.ts` redireciona corretamente, mas não persiste a escolha do usuário. Se o usuário acessar `/en` e depois navegar para `/`, será redirecionado de volta para `pt-BR` baseado no `Accept-Language`. Considere persistir em cookie:

```ts
// Em proxy.ts, após detectar o locale
const response = NextResponse.redirect(...)
response.cookies.set('NEXT_LOCALE', locale, { path: '/', maxAge: 60 * 60 * 24 * 365 })
return response
```

E leia o cookie antes do `Accept-Language`:

```ts
const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value
if (cookieLocale && isValidLocale(cookieLocale)) return cookieLocale
```

### 5.3 Switcher de idioma ainda não implementado
O Header não tem o botão de troca de idioma. Quando implementar, o switcher deve manter o `pathname` atual e apenas trocar o segmento de locale:

```tsx
// /pt-BR/shelf → /en/shelf
const newPath = pathname.replace(`/${lang}`, `/${newLang}`)
router.push(newPath)
```

---

## 6. CSS e Tokens

### 6.1 `--maxw` e `--max-w-content` duplicados
`globals.css` define `--maxw: 1080px` no `:root` e `--max-w-content: 1080px` no `@theme inline`. São a mesma coisa com nomes diferentes. Unifique:

```css
/* Mantenha apenas --maxw no :root */
/* No @theme inline mapeie: */
--max-w-content: var(--maxw);
```

### 6.2 Estilo de hover no `Header` via `onMouseEnter/Leave` inline
O hover do botão de tema usa event handlers JS para trocar `style.*` diretamente — isso funciona mas é frágil e contorna o Tailwind. Use classes CSS com `group` ou defina a variação no próprio CSS:

```css
/* globals.css */
.theme-toggle:hover {
  color: var(--accent-bright);
  border-color: var(--accent);
}
```

```tsx
<button className="theme-toggle ...">
```

### 6.3 Valores mágicos de pixel espalhados
Vários componentes usam valores literais como `text-[78px]`, `px-[15px]`, `py-[10px]`, `-top-[7px]`. Considere criar escala de espaçamento customizada no `@theme`:

```css
@theme inline {
  --spacing-hero-title: 78px;
  --spacing-nav-px: 15px;
}
```

Ou ao menos documentar que esses valores são deliberados (vindos do design system).

---

## 7. Developer Experience

### 7.1 Sem script de type-check no `package.json`
O `package.json` tem `lint` mas não tem `typecheck`. Adicione:

```json
"scripts": {
  "typecheck": "tsc --noEmit",
  "lint": "eslint",
  "lint:fix": "eslint --fix"
}
```

### 7.2 Sem `.editorconfig`
Adicionar um `.editorconfig` garante consistência de indentação/encoding entre editores diferentes sem depender das configurações individuais de cada dev.

```ini
root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true
```

### 7.3 `package-lock.json` e `pnpm-lock.yaml` coexistindo
O projeto usa `pnpm` como gerenciador mas tem um `package-lock.json` (gerado por um `npm install` anterior). Remova o `package-lock.json` e adicione ao `.gitignore`:

```
package-lock.json
```

### 7.4 Sem testes
Para um portfólio vitrine isso é aceitável no início, mas considere ao menos:
- **Testes de smoke** com Playwright para verificar que as rotas principais carregam (PT e EN)
- **Testes de snapshot** para os componentes de design system (Logo, Header)

---

## 8. Prioridade de Implementação

| Prioridade | Item |
|---|---|
| 🔴 Alta | 1.1 CTAs como `<Link>` (semântica + SEO) |
| 🔴 Alta | 3.1 `generateMetadata` por página |
| 🔴 Alta | 5.2 Cookie de locale no proxy |
| 🟡 Média | 1.3 `aria-hidden` nos ícones |
| 🟡 Média | 2.2 Remover re-export de `isValidLocale` |
| 🟡 Média | 4.2 `lang: Locale` no Header |
| 🟡 Média | 4.3 Derivar `NavKey` do tipo do dicionário |
| 🟡 Média | 6.1 Unificar `--maxw` / `--max-w-content` |
| 🟡 Média | 7.3 Remover `package-lock.json` |
| 🟢 Baixa | 3.2 `preload: true` na fonte display |
| 🟢 Baixa | 6.2 Substituir hover JS por CSS |
| 🟢 Baixa | 7.1 Script `typecheck` no package.json |
| 🟢 Baixa | 7.2 Adicionar `.editorconfig` |
| 🟢 Baixa | 3.4 Remover assets padrão do Next.js |

---

## 9. Hero / Bio — Pendências de Lógica

> Ajustes visuais aplicados. Os itens abaixo envolvem comportamento e ficam para implementação futura.

### 9.1 CTAs como `<Link>` com rotas reais
Os botões "Ver projetos" e "Entrar em contato" são `<button>` sem `onClick`. Precisam se tornar `<Link href={...}>` apontando para `/${lang}/projects` e `/${lang}/contact` (ou âncora `#contact`).

### 9.2 Scroll-reveal na seção hero
O design original tem a bio entrando com uma animação sutil de fade+translate ao carregar. Implementar com `framer-motion` ou CSS `@keyframes` + `animation-fill-mode: both`.

### 9.3 Badge "disponível para projetos" dinâmico
O `portrait.available` está hardcoded no dicionário. No futuro esse status deve vir de uma variável de ambiente ou CMS para poder ser alterado sem redeploy.

### 9.4 Nome hardcoded no `Bio`
`"João Pedro"` está literal no JSX. Mover para o dicionário ou para uma constante de configuração do site (`lib/config.ts`), assim o componente é 100% data-driven.
