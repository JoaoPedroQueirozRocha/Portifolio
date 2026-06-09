# Stack Tecnológica

## Decisões por Camada

| Camada | Tecnologia | Justificativa |
|--------|-----------|---------------|
| Frontend | Next.js 14 + TypeScript | SSR/SSG, SEO otimizado, App Router |
| Estilo | Tailwind CSS + shadcn/ui | Rápido de desenvolver, dark mode nativo |
| Backend | Node.js + Fastify | Domínio existente, mais leve que Express |
| ORM | Prisma | Curva mínima, type-safe, migrations automáticas |
| Banco | PostgreSQL | Robusto, suporte a JSON, queries complexas |
| Auth | JWT + bcrypt | Simples, apenas um usuário admin |
| MCP | SDK oficial `@anthropic/mcp` | Protocolo padrão, integração direta com Claude |
| Deploy Frontend | Vercel | Grátis, CI/CD automático |
| Deploy Backend | Railway | Grátis, PostgreSQL incluso |

## Bibliotecas Notáveis

### Frontend
- `next-themes` — dark/light mode com persistência
- `shadcn/ui` — componentes base acessíveis
- `Framer Motion` — animações suaves
- `Recharts` — gráficos no dashboard de stats
- `MDX` — posts do blog em Markdown com componentes React

### Backend
- `Zod` — validação de input em todos os endpoints
- `bcrypt` (salt rounds: 12) — hash de senhas
- `@anthropic/mcp` — MCP Server

### APIs Externas Integradas
- **TMDB** — filmes e séries
- **Google Books API** — livros
- **Jikan API** — animes
