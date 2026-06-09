# Roadmap — Track de Tarefas por Fase

## Fase 1 — Fundação (Semana 1–2)

| # | Tarefa | Camada |
|---|--------|--------|
| 1.1 | Criar repositórios (frontend, backend) | Ambos |
| 1.2 | Configurar Next.js 14 + TypeScript + Tailwind + shadcn/ui | Frontend |
| 1.3 | Configurar Fastify + TypeScript + Prisma | Backend |
| 1.4 | Provisionar PostgreSQL no Railway | Banco |
| 1.5 | Definir schema Prisma completo e rodar migrations | Banco |
| 1.6 | Configurar dark mode com next-themes | Frontend |
| 1.7 | Implementar auth: login, JWT, middleware de proteção | Backend |
| 1.8 | Configurar ESLint, Prettier e Conventional Commits | Ambos |

## Fase 2 — Portfolio + Blog (Semana 3–4)

| # | Tarefa | Camada |
|---|--------|--------|
| 2.1 | Implementar página Home com todas as seções | Frontend |
| 2.2 | CRUD de posts no backend + endpoints REST | Backend |
| 2.3 | Página de listagem de posts com filtro por tags | Frontend |
| 2.4 | Renderização de post individual com syntax highlight | Frontend |
| 2.5 | Admin: editor Markdown com preview | Frontend |
| 2.6 | Gerar RSS feed automaticamente | Backend |
| 2.7 | Configurar OG tags e SEO | Frontend |

## Fase 3 — Media Tracker (Semana 5–6)

| # | Tarefa | Camada |
|---|--------|--------|
| 3.1 | CRUD de mídias no backend | Backend |
| 3.2 | Integrar TMDB API (filmes e séries) | Backend |
| 3.3 | Integrar Google Books API | Backend |
| 3.4 | Integrar Jikan API (animes) | Backend |
| 3.5 | Página pública `/shelf` com filtros e busca | Frontend |
| 3.6 | Admin: gerenciar mídias com busca em APIs externas | Frontend |
| 3.7 | Widget "Atualmente" na Home | Frontend |

## Fase 4 — Stats + MCP (Semana 7–8)

| # | Tarefa | Camada |
|---|--------|--------|
| 4.1 | Endpoint de estatísticas no backend | Backend |
| 4.2 | Página `/stats` com gráficos (Recharts) | Frontend |
| 4.3 | Implementar MCP Server com todas as tools | Backend |
| 4.4 | Autenticação do MCP via API Key | Backend |
| 4.5 | Documentar o MCP (README com exemplos de uso) | Backend |
| 4.6 | Testar MCP integrado ao Claude | Backend |

## Fase 5 — Polimento e Deploy (Semana 9–10)

| # | Tarefa | Camada |
|---|--------|--------|
| 5.1 | Responsividade mobile em todas as páginas | Frontend |
| 5.2 | Loading states, skeletons e tratamento de erros | Frontend |
| 5.3 | Testes de acessibilidade (WCAG AA básico) | Frontend |
| 5.4 | Deploy frontend na Vercel + configurar domínio | Frontend |
| 5.5 | Deploy backend + banco no Railway | Backend |
| 5.6 | Configurar variáveis de ambiente em produção | Ambos |
| 5.7 | Seed inicial de dados (projetos, skills, primeiras mídias) | Banco |
| 5.8 | Revisão final de SEO e performance (Lighthouse) | Frontend |
