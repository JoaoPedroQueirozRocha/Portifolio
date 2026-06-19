# Color Guide

Paleta do design com dois temas: `dark` (padrão) e `light`. Todos os tokens são variáveis CSS
definidas em `app/globals.css` e mapeados para classes Tailwind via `@theme inline`.

---

## Tokens de texto

| Token | Classe Tailwind | Dark | Light | Uso |
|---|---|---|---|---|
| `--text` | `text-text` | `oklch(0.91)` | `oklch(0.27)` | Corpo principal, títulos de card, qualquer texto que precisa ser lido primeiro |
| `--muted` | `text-muted` | `oklch(0.74)` | `oklch(0.42)` | Descrições e parágrafos de suporte — mínimo 15px; abaixo disso use `--text` |
| `--faint` | `text-faint` | `oklch(0.56)` | `oklch(0.55)` | Metadados decorativos: datas, períodos, localização, labels de status inativos |
| `--accent-bright` | `text-accent-bright` | `oklch(0.86)` | `oklch(0.50)` | Nomes próprios em destaque (empresa, escola), labels e estados ativos |

### Regra de tamanho mínimo

- `text-muted` com menos de 15px → subir para `text-text` (contraste insuficiente sobre `--surface`)
- `text-faint` nunca deve ser usado em texto corrido, apenas em labels auxiliares e metadados

---

## Tokens de fundo

| Token | Classe Tailwind | Dark | Light | Uso |
|---|---|---|---|---|
| `--bg` | `bg-bg` | `oklch(0.165)` | `oklch(0.935)` | Fundo da página |
| `--bg-2` | `bg-bg-2` | `oklch(0.205)` | `oklch(0.905)` | Fundo alternado em grids ou listagens |
| `--surface` | `bg-surface` | `oklch(0.215)` | `oklch(0.965)` | Fundo de cards e painéis |
| `--surface-2` | `bg-surface-2` | `oklch(0.255)` | `oklch(0.895)` | Fundo de elementos interativos dentro de cards (hover, tags) |

---

## Tokens de borda

| Token | Classe Tailwind | Uso |
|---|---|---|
| `--line` | `border-line` | Borda padrão de cards e separadores visíveis |
| `--line-soft` | `border-line-soft` | Borda sutil, estado padrão (hover eleva para `--line`) |

---

## Cores de destaque (accent)

| Token | Classe Tailwind | Uso |
|---|---|---|
| `--accent` | `text-accent` / `border-accent` | Ornamentos, bordas ativas, ícones decorativos |
| `--accent-bright` | `text-accent-bright` | Texto de destaque e estados ativos (ver tabela acima) |
| `--accent-soft` | `bg-accent-soft` | Fundo de hover sutil (`linear-gradient` com transparent) |
| `--on-accent` | `text-on-accent` | Texto sobre fundos de cor `--accent` (botões preenchidos) |

---

## Cores de tom (gold / rubric / celest)

Exclusivas para **badges, bordas de categoria e ícones de estado**. Nunca use em texto corrido —
o contraste sobre `--surface` não é suficiente em tamanho de corpo.

| Token | Uso correto |
|---|---|
| `--gold` | Notas, ratings, selos neutros |
| `--rubric` | Distinções, marcações de atenção (vermelho manuscrito) |
| `--celest` | Certificações técnicas, estados "em andamento" (índigo) |

---

## Padrões por contexto

### Card com fundo `bg-surface`
```
título principal    → text-text        (nunca muted sobre surface)
nome/issuer         → text-accent-bright italic
código / label mono → text-accent-bright  (font-mono, tracking)
descrição           → text-muted, mínimo 15px
metadados (data)    → text-faint, font-mono
badge de tipo       → cor do tom via CSS var, border do mesmo tom
```

### Timeline / lista
```
cargo / role        → text-text, font-display
empresa             → text-accent-bright italic, font-alt
período             → text-faint, font-mono
descrição expandida → text-muted, 16px
bullets             → text-text, 15.5px
tags de stack       → text-muted, border-line-soft (classe .mono-tag)
```

### Labels e eyebrows
```
label de seção      → text-muted uppercase tracking, font-caps
numeral de seção    → text-faint, font-mono
eyebrow ativo       → text-accent-bright uppercase, font-mono (.eyebrow)
hint / dica         → text-faint italic, font-alt
```
