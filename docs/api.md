# Contrato da API REST

Base URL: `https://api.<dominio>/api`

Rotas protegidas requerem header `Authorization: Bearer <jwt>`.

---

## Auth

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/auth/login` | Login com e-mail e senha, retorna JWT | Não |
| POST | `/auth/refresh` | Renovar token JWT | Sim |
| GET | `/auth/me` | Validar token e retornar dados do usuário | Sim |

### POST /auth/login

```json
// Request
{ "email": "admin@example.com", "password": "..." }

// Response 200
{ "token": "<jwt>", "expiresIn": 86400 }
```

---

## Media (Público)

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/media` | Listar mídias com filtros e paginação | Não |
| GET | `/media/:id` | Buscar mídia por ID | Não |
| GET | `/media/current` | Buscar item "Atualmente" | Não |
| GET | `/media/stats` | Estatísticas do acervo | Não |
| POST | `/media` | Criar nova mídia | Sim |
| PUT | `/media/:id` | Atualizar mídia | Sim |
| DELETE | `/media/:id` | Excluir mídia | Sim |
| GET | `/external/search` | Buscar nas APIs externas | Sim |

### GET /media — Query params

| Param | Tipo | Descrição |
|-------|------|-----------|
| `type` | string | `book` \| `movie` \| `series` \| `anime` |
| `status` | string | `completed` \| `watching` \| `want` |
| `q` | string | Busca por título |
| `sort` | string | `rating` \| `created_at` \| `title` |
| `order` | string | `asc` \| `desc` |
| `page` | number | Página (default: 1) |
| `limit` | number | Itens por página (default: 20, max: 20) |

---

## Blog (Público)

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/posts` | Listar posts publicados | Não |
| GET | `/posts/:slug` | Buscar post por slug | Não |
| GET | `/posts/rss` | Feed RSS em XML | Não |

## Blog (Admin)

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/admin/posts` | Listar todos os posts (incl. rascunhos) | Sim |
| POST | `/admin/posts` | Criar post | Sim |
| PUT | `/admin/posts/:id` | Atualizar post | Sim |
| DELETE | `/admin/posts/:id` | Excluir post | Sim |
| PATCH | `/admin/posts/:id/publish` | Publicar rascunho | Sim |

---

## Respostas de Erro Padrão

```json
// 400 Bad Request
{ "error": "VALIDATION_ERROR", "details": [...] }

// 401 Unauthorized
{ "error": "UNAUTHORIZED" }

// 404 Not Found
{ "error": "NOT_FOUND" }

// 429 Too Many Requests
{ "error": "RATE_LIMIT_EXCEEDED", "retryAfter": 60 }
```
