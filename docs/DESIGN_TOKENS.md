# Design Tokens - Guia de Referência

Documentação completa das cores, fontes e estilos disponíveis no projeto.

---

## 🎨 Cores (Classes Tailwind)

### Cores Principais

| Classe Tailwind | Variável CSS | Uso | Dark Mode | Light Mode |
|----------------|--------------|-----|-----------|------------|
| `bg-bg` | `--bg` | Background principal | `oklch(0.165 0.018 58)` | `oklch(0.935 0.028 86)` |
| `bg-bg-2` | `--bg-2` | Background alternativo | `oklch(0.205 0.022 54)` | `oklch(0.905 0.032 82)` |
| `bg-surface` | `--surface` | Cards/superfícies | `oklch(0.215 0.022 54)` | `oklch(0.965 0.022 86)` |
| `bg-surface-2` | `--surface-2` | Superfícies alternativas | `oklch(0.255 0.024 52)` | `oklch(0.895 0.03 84)` |

### Cores de Texto

| Classe Tailwind | Variável CSS | Uso | Dark Mode | Light Mode |
|----------------|--------------|-----|-----------|------------|
| `text-text` | `--text` | Texto principal | `oklch(0.91 0.030 82)` | `oklch(0.27 0.03 50)` |
| `text-muted` | `--muted` | Texto secundário | `oklch(0.74 0.030 76)` | `oklch(0.42 0.034 54)` |
| `text-faint` | `--faint` | Texto terciário/sutil | `oklch(0.56 0.028 70)` | `oklch(0.55 0.03 60)` |

### Cores de Destaque (Accent)

| Classe Tailwind | Variável CSS | Uso | Dark Mode | Light Mode |
|----------------|--------------|-----|-----------|------------|
| `bg-accent` | `--accent` | Cor de destaque | `oklch(0.78 0.10 84)` | `oklch(0.58 0.10 72)` |
| `bg-accent-bright` | `--accent-bright` | Destaque brilhante | `oklch(0.86 0.11 86)` | `oklch(0.50 0.11 64)` |
| `bg-accent-soft` | `--accent-soft` | Destaque suave/hover | `oklch(0.78 0.10 84 / 0.14)` | `oklch(0.58 0.10 72 / 0.12)` |
| `text-on-accent` | `--on-accent` | Texto sobre accent | `oklch(0.17 0.02 58)` | `oklch(0.98 0.01 86)` |

### Cores Temáticas Fixas

| Classe Tailwind | Variável CSS | Uso | Cor |
|----------------|--------------|-----|-----|
| `bg-gold` / `text-gold` | `--gold` | Notas/ratings | `oklch(0.80 0.10 85)` (dark) / `oklch(0.60 0.10 72)` (light) |
| `bg-rubric` / `text-rubric` | `--rubric` | Status "Quero ver" | `oklch(0.58 0.16 32)` |
| `bg-celest` / `text-celest` | `--celest` | Status "Em andamento" | `oklch(0.66 0.10 258)` |

### Bordas e Linhas

| Classe Tailwind | Variável CSS | Uso | Dark Mode | Light Mode |
|----------------|--------------|-----|-----------|------------|
| `border-line` | `--line` | Bordas principais | `oklch(0.80 0.06 82 / 0.20)` | `oklch(0.40 0.05 60 / 0.28)` |
| `border-line-soft` | `--line-soft` | Bordas sutis | `oklch(0.80 0.06 82 / 0.11)` | `oklch(0.40 0.05 60 / 0.16)` |

---

## 🔤 Tipografia (Fontes)

### Variáveis de Fonte

| Variável CSS | Classe Tailwind | Família | Pesos | Uso |
|-------------|----------------|---------|-------|-----|
| `--font-display` | `font-[family:var(--font-display)]` | IM Fell English | 400 | Títulos grandes, drop caps |
| `--font-alt` | `font-[family:var(--font-alt)]` | Cormorant Garamond | 400, 500, 600 | Texto alternativo, itálico |
| `--font-body` | `font-[family:var(--font-body)]` | EB Garamond | 400, 500 | Texto do corpo (padrão) |
| `--font-caps` | `font-[family:var(--font-caps)]` | Cinzel | 400, 500 | Maiúsculas decorativas |
| `--font-mono` | `font-[family:var(--font-mono)]` | JetBrains Mono | 400, 500 | Código, eyebrow labels |

### Exemplos de Uso

```tsx
// Fonte Display (títulos grandes)
<h1 style={{ fontFamily: "var(--font-display)" }}>Título</h1>
<h1 className="font-[family:var(--font-display)]">Título</h1>

// Fonte Alternativa (itálico, subtítulos)
<p style={{ fontFamily: "var(--font-alt)", fontStyle: "italic" }}>Texto</p>

// Fonte do Corpo (padrão do body)
<p style={{ fontFamily: "var(--font-body)" }}>Texto normal</p>

// Fonte Caps (maiúsculas decorativas)
<span style={{ fontFamily: "var(--font-caps)" }}>TEXTO</span>

// Fonte Mono (código, labels)
<code style={{ fontFamily: "var(--font-mono)" }}>code</code>
```

---

## 📏 Tamanhos de Fonte (Tailwind)

| Classe | Tamanho | Uso no projeto |
|--------|---------|----------------|
| `text-xs` | 12px | — |
| `text-sm` | 14px | — |
| `text-base` | 16px | — |
| `text-lg` | 18px | Bio do hero, parágrafos |
| `text-xl` | 20px | Tagline itálica |
| `text-2xl` | 24px | — |
| `text-3xl` | 30px | — |
| `text-4xl` | 36px | — |
| `text-5xl` | 48px | — |
| `text-6xl` | 60px | — |
| `text-7xl` | 72px | — |
| `text-8xl` | 96px | — |

### Tamanhos Personalizados (inline)

```tsx
// Título Hero (78px)
<h1 style={{ fontSize: "78px" }}>João Pedro</h1>

// Bio (18px)
<p style={{ fontSize: "18px" }}>Texto</p>

// Eyebrow mono (11px)
<span style={{ fontSize: "11px" }}>LABEL</span>
```

---

## 💪 Pesos de Fonte (Font Weight)

| Classe Tailwind | Valor | Uso |
|----------------|-------|-----|
| `font-normal` | 400 | Texto normal |
| `font-medium` | 500 | Ênfase média, botões |
| `font-semibold` | 600 | Ênfase forte |
| `font-bold` | 700 | Títulos, destaques |

---

## 📐 Border Radius

| Variável CSS | Valor | Classe Tailwind |
|-------------|-------|----------------|
| `--radius-sm` | 3px | `rounded-[3px]` |
| `--radius` / `--radius-md` | 4px | `rounded-[4px]` ou `rounded` |
| `--radius-lg` | 5px | `rounded-[5px]` |
| `--radius-xl` | 8px | `rounded-[8px]` |

---

## 🌓 Sombras

| Variável CSS | Classe Tailwind | Uso |
|-------------|----------------|-----|
| `--shadow-card` | `shadow-[var(--shadow-card)]` | Cards normais |
| `--shadow-card-lg` | `shadow-[var(--shadow-card-lg)]` | Cards grandes/modais |

### Valores

**Dark Mode:**
```css
--shadow-card: 0 2px 8px oklch(0 0 0 / 0.34), 0 16px 50px oklch(0 0 0 / 0.44);
--shadow-card-lg: 0 30px 90px oklch(0 0 0 / 0.62);
```

**Light Mode:**
```css
--shadow-card: 0 2px 6px oklch(0.3 0.04 60 / 0.07), 0 14px 40px oklch(0.3 0.04 60 / 0.10);
--shadow-card-lg: 0 24px 70px oklch(0.3 0.04 60 / 0.20);
```

---

## 🎭 Classes Utilitárias Customizadas

### Container de Conteúdo

```tsx
<div className="content-container">
  {/* Max-width 1080px, padding-inline 1rem */}
</div>
```

### Losango Decorativo

```tsx
<span className="lozenge" />
{/* Losango dourado 6x6px rotacionado 45° */}
```

### Sigilo (Ornamento Circular)

```tsx
<span className="sigil">
  <span className="sigil-core" />
</span>
{/* Círculo com cruz e losango central */}
```

### Eyebrow (Label Mono)

```tsx
<span className="eyebrow">
  <span className="lozenge" />
  Label Text
</span>
{/* Label mono uppercase com losango */}
```

### Linha Decorativa de Seção

```tsx
<div className="sec-rule" />
{/* Linha horizontal com gradiente */}
```

### Drop Cap da Bio

```tsx
<p className="hero-bio">
  Primeira letra grande decorativa...
</p>
{/* Primeira letra 62px com fonte display */}
```

### Grid com Divisores

```tsx
<div className="divider-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
  <div>Item 1</div>
  <div>Item 2</div>
</div>
{/* Grid com linhas divisórias de 1px */}
```

---

## 📱 Responsividade

Tailwind usa breakpoints padrão:
- `sm:` → 640px
- `md:` → 768px
- `lg:` → 1024px
- `xl:` → 1280px
- `2xl:` → 1536px

---

## 🌙 Dark Mode

O projeto usa `[data-theme="dark"]` em vez da classe `.dark` do Tailwind.

Para aplicar estilos apenas no dark mode:

```tsx
// Funciona automaticamente com as classes bg-*, text-*, etc.
<div className="bg-bg text-text">
  {/* Cores mudam automaticamente */}
</div>

// CSS inline
<div style={{ color: "var(--text)" }}>
  {/* Usa a variável que muda com o tema */}
</div>
```

---

## 💡 Exemplos Práticos

### Botão Primary

```tsx
<button
  style={{
    fontFamily: "var(--font-body)",
    fontSize: "15px",
    fontWeight: 500,
    padding: "10px 18px",
    borderRadius: "4px",
    background: "var(--accent)",
    color: "var(--on-accent)",
  }}
>
  Botão
</button>
```

### Botão Secondary

```tsx
<button
  style={{
    fontFamily: "var(--font-body)",
    fontSize: "15px",
    fontWeight: 500,
    padding: "10px 18px",
    borderRadius: "4px",
    border: "1px solid var(--line)",
    color: "var(--text)",
  }}
>
  Botão
</button>
```

### Card

```tsx
<div
  className="bg-surface rounded-[4px] p-6"
  style={{ boxShadow: "var(--shadow-card)" }}
>
  Conteúdo do card
</div>
```

### Título de Seção

```tsx
<h2
  style={{
    fontFamily: "var(--font-display)",
    fontSize: "48px",
    color: "var(--text)",
  }}
>
  Título
</h2>
```
