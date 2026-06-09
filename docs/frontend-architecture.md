# Arquitetura do Frontend

Guia de organização do projeto `portfolio-frontend` em Next.js 14 com App Router.

---

## Estrutura de Pastas

```
portfolio-frontend/
├── app/                        # App Router — rotas e layouts
│   ├── (public)/               # Route group: páginas públicas
│   │   ├── layout.tsx          # Layout público (header, footer)
│   │   ├── page.tsx            # /  →  Home
│   │   ├── shelf/
│   │   │   └── page.tsx        # /shelf  →  Media Tracker
│   │   ├── blog/
│   │   │   ├── page.tsx        # /blog  →  Lista de posts
│   │   │   └── [slug]/
│   │   │       └── page.tsx    # /blog/[slug]  →  Post individual
│   │   ├── stats/
│   │   │   └── page.tsx        # /stats  →  Dashboard de estatísticas
│   │   └── contato/
│   │       └── page.tsx        # /contato  →  Formulário de contato
│   ├── admin/                  # Área privada (CSR, protegida por JWT)
│   │   ├── layout.tsx          # Layout admin (sidebar, auth guard)
│   │   ├── page.tsx            # /admin  →  Dashboard
│   │   ├── login/
│   │   │   └── page.tsx        # /admin/login
│   │   ├── media/
│   │   │   ├── page.tsx        # /admin/media  →  Lista de mídias
│   │   │   ├── new/
│   │   │   │   └── page.tsx    # /admin/media/new
│   │   │   └── [id]/
│   │   │       └── edit/
│   │   │           └── page.tsx # /admin/media/[id]/edit
│   │   └── posts/
│   │       ├── page.tsx        # /admin/posts  →  Lista de posts
│   │       ├── new/
│   │       │   └── page.tsx    # /admin/posts/new
│   │       └── [id]/
│   │           └── edit/
│   │               └── page.tsx # /admin/posts/[id]/edit
│   ├── layout.tsx              # Root layout (providers, fonts, metadata base)
│   ├── globals.css             # Estilos globais + variáveis CSS shadcn
│   └── not-found.tsx           # Página 404 personalizada
│
├── components/                 # Componentes React reutilizáveis
│   ├── ui/                     # Componentes base gerados pelo shadcn/ui
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── ...                 # Nunca editar manualmente
│   ├── layout/                 # Estrutura global da página
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Sidebar.tsx         # Sidebar do admin
│   │   └── MobileNav.tsx
│   ├── portfolio/              # Seções da Home
│   │   ├── Hero.tsx
│   │   ├── SkillsSection.tsx
│   │   ├── ProjectsSection.tsx
│   │   ├── ProjectCard.tsx
│   │   ├── CurrentlyWidget.tsx
│   │   └── BlogPreview.tsx
│   ├── media/                  # Media Tracker público e admin
│   │   ├── MediaGrid.tsx
│   │   ├── MediaCard.tsx
│   │   ├── MediaFilters.tsx
│   │   ├── MediaModal.tsx
│   │   ├── MediaSearch.tsx
│   │   └── StatusBadge.tsx
│   ├── blog/                   # Blog público e admin
│   │   ├── PostCard.tsx
│   │   ├── PostList.tsx
│   │   ├── TagFilter.tsx
│   │   ├── TableOfContents.tsx
│   │   ├── MarkdownEditor.tsx  # Editor com preview (admin)
│   │   └── MdxContent.tsx      # Renderizador MDX
│   ├── stats/                  # Dashboard de estatísticas
│   │   ├── StatsGrid.tsx
│   │   ├── BarChart.tsx
│   │   ├── PieChart.tsx
│   │   ├── LineChart.tsx
│   │   ├── ActivityHeatmap.tsx
│   │   └── TopFiveCard.tsx
│   └── shared/                 # Componentes genéricos de uso geral
│       ├── PageHeader.tsx
│       ├── EmptyState.tsx
│       ├── ErrorBoundary.tsx
│       ├── LoadingSkeleton.tsx
│       ├── Pagination.tsx
│       └── ThemeToggle.tsx
│
├── hooks/                      # Custom hooks React
│   ├── useAuth.ts              # Lê/valida JWT do localStorage
│   ├── useDebounce.ts          # Debounce para busca em tempo real
│   ├── useMediaFilters.ts      # Estado dos filtros da /shelf
│   └── useLocalStorage.ts      # Wrapper type-safe para localStorage
│
├── lib/                        # Utilitários e configurações
│   ├── api.ts                  # Cliente HTTP (fetch wrapper com baseURL e auth)
│   ├── auth.ts                 # Helpers de JWT (salvar, ler, limpar token)
│   ├── utils.ts                # cn(), formatDate(), calcReadingTime(), slugify()
│   ├── constants.ts            # MEDIA_TYPES, STATUS_LABELS, ROUTES, etc.
│   └── validations.ts          # Schemas Zod para formulários do frontend
│
├── types/                      # Tipos TypeScript globais
│   ├── media.ts                # MediaItem, MediaType, MediaStatus
│   ├── post.ts                 # Post, PostStatus, Tag
│   ├── api.ts                  # ApiResponse<T>, PaginatedResponse<T>, ApiError
│   └── index.ts                # Re-exports de todos os tipos
│
├── public/                     # Arquivos estáticos
│   ├── images/
│   │   ├── avatar.jpg
│   │   └── og-default.png      # Imagem OG padrão
│   ├── icons/
│   └── cv.pdf                  # Currículo para download
│
├── .env.local                  # Variáveis de ambiente locais (não commitado)
├── .env.example                # Exemplo de variáveis (commitado)
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── components.json             # Config do shadcn/ui
```

---

## Convenções de Nomenclatura

### Arquivos e Pastas

| O quê | Convenção | Exemplo |
|-------|-----------|---------|
| Componentes React | PascalCase | `MediaCard.tsx` |
| Hooks | camelCase com prefixo `use` | `useMediaFilters.ts` |
| Utilitários / lib | camelCase | `api.ts`, `utils.ts` |
| Pastas de rotas | kebab-case (obrigatório Next.js) | `blog/[slug]/` |
| Pastas de componentes | kebab-case | `media/`, `shared/` |
| Tipos | PascalCase para interfaces/types | `MediaItem`, `ApiResponse` |
| Constantes | UPPER_SNAKE_CASE | `MEDIA_TYPES`, `ROUTES` |
| Variáveis e funções | camelCase | `fetchMedia`, `isLoading` |

> Todo o código (variáveis, funções, comentários técnicos) deve ser escrito em **inglês**.

### Componentes

- Um componente por arquivo
- Nome do arquivo = nome do componente exportado
- Sempre usar **named export** (não default export) para componentes — exceto `page.tsx` e `layout.tsx`, que o Next.js exige como default

```tsx
// ✅ correto
export function MediaCard({ item }: MediaCardProps) { ... }

// ❌ evitar
export default function MediaCard() { ... }
```

---

## Padrões de Componentes

### Props com interface explícita

```tsx
interface MediaCardProps {
  item: MediaItem
  onSelect?: (id: string) => void
  className?: string
}

export function MediaCard({ item, onSelect, className }: MediaCardProps) {
  ...
}
```

### Composição com `cn()` para classes condicionais

```tsx
import { cn } from "@/lib/utils"

<div className={cn("base-class", isActive && "active-class", className)}>
```

### Server Components vs Client Components

- Por padrão, todo componente no App Router é **Server Component**
- Usar `"use client"` **apenas** quando necessário: estado, eventos, hooks, animações
- Nunca colocar `"use client"` em `layout.tsx` ou `page.tsx` sem necessidade — preferir extrair a parte interativa para um componente filho

```
page.tsx (Server)
  └── MediaGrid.tsx (Server — lista estática)
       └── MediaFilters.tsx (Client — estado dos filtros)
```

---

## Estratégia de Renderização

| Rota | Estratégia | Como implementar |
|------|-----------|-----------------|
| `/` | SSG + ISR | `revalidate = 3600` no fetch |
| `/shelf` | SSG + ISR | `revalidate = 3600` no fetch |
| `/blog` | SSG + ISR | `revalidate = 1800` no fetch |
| `/blog/[slug]` | SSG + ISR | `generateStaticParams` + `revalidate` |
| `/stats` | SSR | `cache: "no-store"` no fetch |
| `/admin/*` | CSR | `"use client"` + fetch no cliente |

```ts
// ISR — revalida a cada 1 hora
const data = await fetch(`${API_URL}/media`, {
  next: { revalidate: 3600 },
})

// SSR — sempre busca dados frescos
const data = await fetch(`${API_URL}/media/stats`, {
  cache: "no-store",
})
```

---

## Cliente HTTP (`lib/api.ts`)

Wrapper sobre `fetch` que centraliza baseURL, headers e tratamento de erros.

```ts
// Uso em Server Components (sem token)
const media = await api.get<MediaItem[]>("/media")

// Uso em Client Components (com token do localStorage)
const media = await api.get<MediaItem[]>("/media", { auth: true })

// POST
const created = await api.post<MediaItem>("/media", body, { auth: true })
```

Nunca fazer `fetch` diretamente nas páginas — sempre usar `api.ts`.

---

## Gerenciamento de Estado

Não usar Redux ou Zustand. Estado simples e local:

| Caso | Solução |
|------|---------|
| Estado de UI (modal aberto, filtros) | `useState` local ou hook customizado |
| Estado compartilhado entre rotas | `useContext` + Provider mínimo |
| Cache de dados do servidor | fetch nativo do Next.js (deduplicação automática) |
| Autenticação | `useAuth` hook lendo `localStorage` |
| Tema (dark/light) | `next-themes` |

---

## Variáveis de Ambiente

```bash
# .env.example

# URL base da API backend
NEXT_PUBLIC_API_URL=http://localhost:3001

# URL pública do frontend (para OG tags e sitemap)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

- Prefixo `NEXT_PUBLIC_` expõe a variável no browser
- Variáveis sem o prefixo são usadas apenas em Server Components / Route Handlers
- Nunca commitar `.env.local`

---

## Paths Absolutos (aliases)

Configurado no `tsconfig.json`. Usar sempre `@/` em vez de caminhos relativos longos.

```ts
// ✅
import { MediaCard } from "@/components/media/MediaCard"
import { api } from "@/lib/api"
import type { MediaItem } from "@/types"

// ❌
import { MediaCard } from "../../../components/media/MediaCard"
```

---

## SEO — Padrão de Metadata

Cada `page.tsx` exporta uma função `generateMetadata` ou um objeto `metadata` estático.

```tsx
// Estático
export const metadata: Metadata = {
  title: "Blog | João Pedro",
  description: "Posts técnicos sobre desenvolvimento web.",
}

// Dinâmico (posts individuais)
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await fetchPost(params.slug)
  return {
    title: `${post.title} | João Pedro`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt,
    },
  }
}
```

---

## Estilo — Padrões Tailwind

- Nunca escrever CSS puro fora de `globals.css`
- Usar variáveis CSS do shadcn para cores (não hardcodar cores como `text-blue-500`)
- Classes condicionais sempre via `cn()` — nunca concatenação de strings
- Responsividade mobile-first: escrever o estilo base para mobile, depois `md:` e `lg:`

```tsx
// ✅ mobile-first
<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">

// ✅ cores via variáveis semânticas do shadcn
<p className="text-muted-foreground">

// ❌ cores hardcoded
<p className="text-gray-500">
```

---

## Organização de um Componente Complexo

Quando um componente cresce, extrair sub-componentes no mesmo diretório:

```
components/media/
├── MediaGrid.tsx           # Componente principal (exportado)
├── MediaCard.tsx           # Card individual
├── MediaFilters.tsx        # Barra de filtros
├── MediaModal.tsx          # Modal de detalhes
├── MediaSearch.tsx         # Campo de busca
├── StatusBadge.tsx         # Badge de status
└── index.ts                # Re-exports públicos do módulo
```

O `index.ts` expõe apenas o que outros módulos precisam importar:

```ts
// components/media/index.ts
export { MediaGrid } from "./MediaGrid"
export { MediaCard } from "./MediaCard"
export type { MediaCardProps } from "./MediaCard"
```
