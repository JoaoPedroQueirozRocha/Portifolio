# Requisitos Não Funcionais

## Performance

| ID | Requisito | Métrica |
|----|-----------|---------|
| RNF-PE01 | Páginas públicas com SSG/ISR para carregamento rápido | LCP < 2.5s |
| RNF-PE02 | Imagens otimizadas com `next/image` | Formato WebP automático |
| RNF-PE03 | Cache de respostas das APIs externas (TMDB, Jikan) | TTL de 24h |
| RNF-PE04 | Paginação no backend para listas grandes | Max 20 itens/página |
| RNF-PE05 | Queries Prisma otimizadas com índices adequados | Queries < 100ms |

## Segurança

| ID | Requisito | Detalhe |
|----|-----------|---------|
| RNF-SE01 | Rotas admin protegidas por JWT com expiração | Token de 24h |
| RNF-SE02 | Senhas armazenadas com bcrypt | Salt rounds: 12 |
| RNF-SE03 | MCP Server autenticado com API Key própria | Header `X-MCP-Key` |
| RNF-SE04 | Rate limiting nas rotas públicas da API | Max 60 req/min por IP |
| RNF-SE05 | Variáveis de ambiente nunca commitadas | Uso de `.env` + `.gitignore` |
| RNF-SE06 | CORS configurado para aceitar apenas domínios próprios | Whitelist de origens |
| RNF-SE07 | Input validation com Zod em todos os endpoints | Rejeitar payloads inválidos |

## Usabilidade

| ID | Requisito | Detalhe |
|----|-----------|---------|
| RNF-US01 | Dark mode e light mode com persistência de preferência | `next-themes` |
| RNF-US02 | Design responsivo para mobile, tablet e desktop | Breakpoints Tailwind |
| RNF-US03 | Acessibilidade básica (WCAG AA) | Alt texts, contraste, ARIA |
| RNF-US04 | Loading states e skeletons para conteúdo assíncrono | UX sem flicker |
| RNF-US05 | Mensagens de erro claras e amigáveis ao usuário | Toast notifications |
| RNF-US06 | Animações suaves e não intrusivas | Framer Motion leve |

## SEO e Descobribilidade

| ID | Requisito | Detalhe |
|----|-----------|---------|
| RNF-SEO01 | Meta tags dinâmicas por página (título, descrição) | Next.js Metadata API |
| RNF-SEO02 | Open Graph tags para preview em redes sociais | Imagens OG dinâmicas |
| RNF-SEO03 | Sitemap.xml gerado automaticamente | `next-sitemap` |
| RNF-SEO04 | Schema.org structured data nas páginas de post | Article schema |
| RNF-SEO05 | URLs amigáveis e canônicas | Slugs nos posts |

## Manutenção e Qualidade de Código

| ID | Requisito | Detalhe |
|----|-----------|---------|
| RNF-MQ01 | TypeScript em toda a codebase (frontend e backend) | Strict mode ativado |
| RNF-MQ02 | ESLint + Prettier configurados | Lint on save + pre-commit |
| RNF-MQ03 | Commits seguindo Conventional Commits | `feat:`, `fix:`, `chore:`, etc |
| RNF-MQ04 | Variáveis e funções nomeadas em inglês | Padrão de mercado |
| RNF-MQ05 | Documentação do MCP Server (README com exemplos) | Para uso próprio |
| RNF-MQ06 | Scripts npm padronizados (`dev`, `build`, `lint`, `test`) | DX consistente |
