# Plano de Implementação — Frontend

Baseado no design file `Portfolio & Media Tracker.html`.

---

## Visão Geral do Design

**Estética:** Minimalista e clean, inspirada em manuscritos e tipografia clássica.  
**Páginas prototipadas:** Home (`/`) e Estante de Mídia (`/shelf`).

### Fontes
| Variável | Fonte | Uso |
|----------|-------|-----|
| `--font-display` | Cormorant Garamond (Google Fonts) | Títulos, nomes, destaques |
| `--font-body` | Outfit (Google Fonts) | Corpo de texto, UI geral |
| `--font-mono` | JetBrains Mono (Google Fonts) | Labels, tags, metadados |

### Tokens de Cor (CSS Variables)
```css
/* Accent — índigo por padrão, hue controlado via --accent-h */
--accent-h: 248;
--accent:        oklch(0.62 0.13 var(--accent-h));
--accent-bright: oklch(0.72 0.14 var(--accent-h));
--accent-soft:   oklch(0.62 0.13 var(--accent-h) / 0.12);
--gold:          oklch(0.78 0.10 85);   /* notas/ratings */

/* Dark mode */
--bg:          oklch(0.165 0.012 264);
--bg-2:        oklch(0.195 0.014 264);
--surface:     oklch(0.215 0.016 264);
--surface-2:   oklch(0.25 0.018 264);
--text:        oklch(0.93 0.008 264);
--muted:       oklch(0.7 0.014 264);
--faint:       oklch(0.55 0.014 264);
--line:        oklch(0.32 0.016 264);
--line-soft:   oklch(0.27 0.014 264);
--on-accent:   oklch(0.16 0.012 264);

/* Light mode */
--bg:          oklch(0.975 0.006 90);
--bg-2:        oklch(0.955 0.008 90);
--surface:     oklch(1 0 0);
--surface-2:   oklch(0.965 0.006 90);
--text:        oklch(0.24 0.02 264);
--muted:       oklch(0.46 0.018 264);
--faint:       oklch(0.62 0.014 264);
--line:        oklch(0.86 0.01 90);
--line-soft:   oklch(0.91 0.008 90);
--accent:      oklch(0.52 0.14 var(--accent-h));   /* mais escuro no light */
--accent-bright: oklch(0.48 0.15 var(--accent-h));
--on-accent:   oklch(0.99 0 0);
```

### Layout
- `max-width: 1080px`, centralizado com `margin: 0 auto`
- Padding lateral: `32px`
- Background com gradiente radial fixo: `radial-gradient(circle at 50% -8%, var(--bg-2), var(--bg) 55%)`

---

## Passo 1 — Componentes shadcn

Instalar e configurar todos os componentes shadcn que serão usados.

### Componentes a instalar
```bash
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add badge
npx shadcn@latest add card
npx shadcn@latest add dialog
npx shadcn@latest add sheet
npx shadcn@latest add select
npx shadcn@latest add tabs
npx shadcn@latest add separator
npx shadcn@latest add skeleton
npx shadcn@latest add toast
npx shadcn@latest add tooltip
npx shadcn@latest add dropdown-menu
npx shadcn@latest add avatar
npx shadcn@latest add textarea
```

### Customizações necessárias por componente

#### `Button`
O design usa 2 variantes principais:
- **Primary** (`btn-primary`): `background: var(--accent)`, texto `var(--on-accent)`, hover eleva `translateY(-1px)`
- **Ghost** (`btn-ghost`): borda `var(--line)`, hover muda borda para `var(--accent)` e texto para `var(--accent-bright)`
- Radius: `rounded-sm` (4px), não `rounded-md`
- Font: `font-body`, `font-size: 13.5px`, `letter-spacing: .02em`

#### `Badge` / Tag
O design tem 3 tipos de tag:
- **mono-tag**: fundo transparente, borda `var(--line-soft)`, fonte mono, `11px`
- **Status badge** (concluído/em andamento/quero ver): ponto colorido + texto mono uppercase
  - Concluído: `oklch(0.7 0.13 155)` (verde)
  - Em andamento: `var(--gold)` (dourado)
  - Quero ver: `oklch(0.65 0.13 25)` (laranja)
- **Tab ativa** na shelf: borda `var(--accent)`, bg `var(--accent-soft)`, texto `var(--accent-bright)`

#### `Input` / Search
- Padding: `11px 13px 11px 38px` (ícone à esquerda)
- Border: `var(--line)`, bg: `var(--surface)`
- Focus: `border-color: var(--accent)`, `box-shadow: 0 0 0 3px var(--accent-soft)`
- Placeholder: `var(--faint)`
- Border-radius: `3px`

#### `Select`
- Fonte: `var(--font-mono)`, `12px`
- Mesmos tokens de borda/bg do Input

#### `Sheet` (usado como detail panel da /shelf)
- Slide da direita, largura `min(460px, 100%)`
- Borda esquerda: `var(--line)`
- Overlay com blur: `backdrop-filter: blur(4px)`

#### `Tabs` (filtro de tipo na /shelf)
- Fonte: `var(--font-mono)`, `12px`, `letter-spacing: .04em`
- Tab normal: borda transparente, texto `var(--muted)`
- Tab ativa: borda `var(--accent)`, bg `var(--accent-soft)`, texto `var(--accent-bright)`
- Border-radius: `3px`

#### `Skeleton`
- Cor: `var(--surface-2)` com shimmer sutil

---

## Passo 2 — Configuração Global de Estilo

### 2.1 Fontes no `layout.tsx`
```tsx
import { Outfit, Cormorant_Garamond, JetBrains_Mono } from 'next/font/google'

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['300', '400', '500'],
})
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
})
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500'],
})
```

### 2.2 `globals.css` — tokens completos
Definir as CSS variables do design em `:root` (dark mode como padrão via `[data-theme="dark"]`), com fallback para `[data-theme="light"]`. Configurar o body com:
- `font-family: var(--font-body)`
- `font-weight: 300`
- `background-image: radial-gradient(circle at 50% -8%, var(--bg-2), var(--bg) 55%)`
- `background-attachment: fixed`
- `-webkit-font-smoothing: antialiased`
- Transição suave de tema: `transition: background .4s ease, color .4s ease`

### 2.3 `tailwind.config.ts` — mapear tokens para classes
```ts
theme: {
  extend: {
    colors: {
      bg: 'var(--bg)',
      'bg-2': 'var(--bg-2)',
      surface: 'var(--surface)',
      'surface-2': 'var(--surface-2)',
      text: 'var(--text)',
      muted: 'var(--muted)',
      faint: 'var(--faint)',
      line: 'var(--line)',
      'line-soft': 'var(--line-soft)',
      accent: 'var(--accent)',
      'accent-bright': 'var(--accent-bright)',
      'accent-soft': 'var(--accent-soft)',
      gold: 'var(--gold)',
      'on-accent': 'var(--on-accent)',
    },
    fontFamily: {
      display: 'var(--font-display)',
      body: 'var(--font-body)',
      mono: 'var(--font-mono)',
    },
    maxWidth: {
      content: '1080px',
    },
    borderRadius: {
      DEFAULT: '4px',
      sm: '3px',
    },
    boxShadow: {
      card: 'var(--shadow)',
      'card-lg': 'var(--shadow-lg)',
    },
  },
}
```

### 2.4 `next-themes` — dark mode
- `defaultTheme="dark"` 
- `attribute="data-theme"` (o design usa `html[data-theme="dark"]`)
- Envolver o root layout com `<ThemeProvider>`

### 2.5 `components.json` — confirmar configurações shadcn
```json
{
  "style": "nova",
  "tailwind": {
    "cssVariables": true,
    "baseColor": "neutral"
  }
}
```

---

## Passo 3 — Layout Global e Header

Criar `components/layout/Header.tsx` com:
- Logo: marca com lozenge (losango 45° rotacionado), iniciais em `font-display`, nome completo
- Nav: links com estado ativo (underline `var(--accent)` + cor `var(--accent-bright)`)
- Botão de tema (sol/lua)
- Sticky com blur ao rolar: `backdrop-filter: blur(16px)` + borda `var(--line-soft)` ao detectar scroll
- Mobile: colapsar nav em menu hambúrguer

Criar `components/layout/Footer.tsx` com:
- Separador ornamental (lozenge centralizado com linhas)
- Nome + metadado mono
- Links sociais (GitHub, LinkedIn) + link para CV

---

## Passo 4 — Página Home (`/`)

### Seções a construir (em ordem):

#### 4.1 Hero
- Grid 2 colunas: `300px` (retrato) + `1fr` (texto)
- Retrato: placeholder com grid hatched + cantos decorativos em `var(--accent)` + badge "disponível"
- Texto: eyebrow mono, nome em `font-display 72px`, bio `17px var(--muted)`, tagline itálica, CTAs, facts row
- Facts row: borda superior, dados separados por borda vertical (ex: "Stack", "Localização", "Status")

#### 4.2 Stack (Skills)
- Grid 4 colunas com `gap: 1px` e `background: var(--line-soft)` (cria linhas divisórias entre células)
- Cada célula: `background: var(--bg)`, group label em mono uppercase `var(--accent-bright)`
- Lista com lozenge como marcador

#### 4.3 Projetos
- Lista vertical com `gap: 1px` + `background: var(--line-soft)` (mesma técnica da Stack)
- Cada item: número itálico `font-display` à esquerda, título + tagline, links (GitHub/Demo), descrição, stack em mono-tags
- Hover: `background: var(--surface)`

#### 4.4 Widget "Atualmente" (Now)
- Card horizontal: capa `width: 92px` + info
- Título em `font-display 28px`, nota itálica, seta animada no hover

#### 4.5 Blog Preview
- Lista de posts com borda superior/inferior
- Cada row: tag mono à esquerda, título `font-display`, metadados, seta
- Hover: slide para direita + gradiente `var(--accent-soft)` à esquerda

---

## Passo 5 — Página Shelf (`/shelf`)

#### 5.1 Header da página
- Eyebrow mono, título `font-display 52px`, subtítulo com contagem em destaque

#### 5.2 Filters (sticky)
- `position: sticky; top: 71px` (abaixo do header do site)
- Tabs de tipo: Todos / Livros / Filmes / Séries / Animes
- Linha de filtros: search input + selects (status, ordenação)

#### 5.3 Grid de cards
- `grid-template-columns: repeat(5, 1fr); gap: 22px`
- Card: capa `aspect-ratio: 2/3` com badge de status, título `font-display`, rating em mono + `var(--gold)`, tipo
- Hover: `translateY(-5px)` + sombra aumenta

#### 5.4 Detail Panel (Sheet)
- Slide da direita ao clicar num card
- Topo: capa em `aspect-ratio: 1/1` com gradiente sobreposto
- Body: metadados mono, título `36px font-display`, stat bar (rating + status), sinopse, nota pessoal com borda esquerda `var(--accent)`

---

## Passo 6 — Componentes Utilitários Compartilhados

| Componente | Descrição |
|-----------|-----------|
| `Lozenge` | Losango decorativo rotacionado 45° (usado em múltiplos lugares) |
| `RatingDisplay` | Número em `var(--gold)` + `/10` em `var(--faint)` |
| `StatusDot` | Ponto colorido + label mono uppercase |
| `MonoTag` | Tag com borda `var(--line-soft)` e fonte mono |
| `SectionHeader` | Numeral itálico + título `font-display` + linha decorativa |
| `CoverCard` | Capa `aspect-ratio: 2/3` com grain, frame interno, tipo e título sobrepostos |

---

## Passo 7 — Páginas Restantes

Seguindo os mesmos tokens e padrões visuais estabelecidos:

- `/blog` — lista de posts (mesma estrutura de rows da home)
- `/blog/[slug]` — post com MDX, sidebar de TOC, navegação prev/next
- `/stats` — dashboard com Recharts usando `var(--accent)` e `var(--gold)` como cores dos gráficos
- `/contato` — formulário simples usando os componentes de input já estilizados
- `/admin/*` — painel privado com sidebar, mesmos tokens mas layout diferente

---

## Ordem de Execução

```
Passo 1 → instalar shadcn components
Passo 2 → globals.css + tailwind.config + next-themes
Passo 3 → Header + Footer
Passo 4 → Home
Passo 5 → Shelf
Passo 6 → componentes utilitários (extrair durante os passos 4 e 5)
Passo 7 → demais páginas
```

> Os passos 1 e 2 são pré-requisitos para tudo. Os passos 4 e 5 podem gerar componentes que vão para o passo 6 conforme forem identificados durante o desenvolvimento.
