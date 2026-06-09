# MCP Server

Servidor MCP para integração do portfolio/media tracker com Claude.

## Autenticação

Toda requisição deve incluir o header:

```
X-MCP-Key: <api-key>
```

A chave é configurada via variável de ambiente `MCP_API_KEY` no backend.

## Tools Disponíveis

### `list_media`
Lista mídias do acervo com filtros opcionais.

**Params:**
- `type?` — `book` | `movie` | `series` | `anime`
- `status?` — `completed` | `watching` | `want`
- `min_rating?` — número de 1 a 10

---

### `get_media`
Busca detalhes de um item específico.

**Params:**
- `id?` — UUID do item
- `title?` — título exato ou parcial

---

### `search_media`
Pesquisa por título parcial em todo o acervo.

**Params:**
- `query` — string de busca

---

### `add_media`
Adiciona novo item ao acervo.

**Params:**
- `title` — título da obra
- `type` — `book` | `movie` | `series` | `anime`
- `status` — `completed` | `watching` | `want`
- `rating?` — nota de 1 a 10
- `comment?` — comentário pessoal
- `cover_url?` — URL da capa
- `year?` — ano de lançamento
- `synopsis?` — sinopse

---

### `update_media`
Atualiza status, nota ou comentário de um item existente.

**Params:**
- `id` — UUID do item
- `status?` — novo status
- `rating?` — nova nota
- `comment?` — novo comentário
- `is_current?` — marcar como "assistindo/lendo agora"

---

### `delete_media`
Remove um item do acervo.

**Params:**
- `id` — UUID do item

---

### `get_stats`
Retorna estatísticas gerais do acervo.

**Retorna:** total por tipo, média de notas por categoria, contagem por status.

---

### `list_posts`
Lista posts do blog.

**Params:**
- `status?` — `draft` | `published` | (omitir para todos)

---

### `create_draft`
Cria um rascunho de post.

**Params:**
- `title` — título do post
- `content` — conteúdo em Markdown
- `tags?` — array de tags

---

### `publish_post`
Publica um rascunho existente.

**Params:**
- `id` — UUID do post

## Configuração no Claude Desktop

```json
{
  "mcpServers": {
    "portfolio": {
      "url": "https://api.<dominio>/mcp",
      "headers": {
        "X-MCP-Key": "<sua-api-key>"
      }
    }
  }
}
```
