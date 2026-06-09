# Arquitetura

## Diagrama de Alto Nível

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENTE                              │
│                                                             │
│   Browser  ──────────►  Next.js 14 (Vercel)                 │
│                          └─ SSG/ISR páginas públicas        │
│                          └─ CSR admin panel                 │
│                                                             │
│   Claude  ────────────►  MCP Server (Railway)               │
└─────────────────────────────────────────────────────────────┘
                                │
                    REST API / MCP Tools
                                │
                    ┌───────────▼──────────┐
                    │  Fastify (Railway)    │
                    │  ├─ routes/          │
                    │  ├─ services/        │
                    │  └─ middlewares/     │
                    └───────────┬──────────┘
                                │ Prisma ORM
                    ┌───────────▼──────────┐
                    │  PostgreSQL (Railway) │
                    └──────────────────────┘
                                │
              ┌─────────────────┼─────────────────┐
              ▼                 ▼                 ▼
           TMDB API      Google Books API     Jikan API
```

## Estratégia de Renderização (Frontend)

| Rota | Estratégia | Motivo |
|------|-----------|--------|
| `/` | SSG + ISR | Conteúdo muda pouco, SEO crítico |
| `/shelf` | SSG + ISR | Lista de mídias, SEO relevante |
| `/blog` | SSG + ISR | Lista de posts, SEO crítico |
| `/blog/[slug]` | SSG + ISR | Post individual, SEO crítico |
| `/stats` | SSR ou CSR | Dados dinâmicos, SEO não crítico |
| `/admin/*` | CSR | Privado, sem necessidade de SSR |

## Autenticação

- **Usuário único**: apenas um admin
- **Fluxo**: `POST /api/auth/login` → JWT (24h) → armazenado no cliente
- **Proteção**: middleware Fastify valida JWT em todas as rotas `/api/admin/*`
- **MCP**: autenticado separadamente via header `X-MCP-Key`

## Cache de APIs Externas

Respostas do TMDB, Google Books e Jikan são cacheadas no backend com TTL de 24h para evitar rate limiting e reduzir latência.

## Estrutura de Pastas

### Frontend (`portfolio-frontend/`)

```
app/
├── (public)/
│   ├── page.tsx                  # Home
│   ├── shelf/page.tsx            # Media Tracker
│   ├── blog/page.tsx             # Lista de posts
│   ├── blog/[slug]/page.tsx      # Post individual
│   ├── stats/page.tsx            # Dashboard stats
│   └── contato/page.tsx          # Formulário
└── admin/
    ├── layout.tsx                # Layout protegido
    ├── page.tsx                  # Dashboard admin
    ├── media/                    # CRUD de mídia
    └── posts/                    # CRUD de posts

components/
├── ui/                           # shadcn/ui base
├── media/                        # Cards, filtros, modal
├── blog/                         # PostCard, Editor
├── portfolio/                    # Hero, Skills, Projects
└── stats/                        # Gráficos, heatmap

lib/
├── api.ts                        # Cliente HTTP
└── utils.ts                      # Helpers

types/                            # Tipos TypeScript globais
```

### Backend (`portfolio-backend/`)

```
src/
├── routes/
│   ├── media.ts
│   ├── posts.ts
│   ├── auth.ts
│   └── external.ts
├── services/
│   ├── mediaService.ts
│   ├── postService.ts
│   ├── tmdbService.ts
│   ├── jikanService.ts
│   └── googleBooksService.ts
├── middlewares/
│   ├── auth.ts                   # Verificação JWT
│   └── rateLimit.ts
├── schemas/                      # Validação Zod
└── prisma/
    └── schema.prisma             # Schema do banco

mcp-server/
├── index.ts                      # Entry point MCP
├── tools/
│   ├── media.ts                  # Tools de mídia
│   └── posts.ts                  # Tools de blog
└── README.md                     # Documentação de uso
```
