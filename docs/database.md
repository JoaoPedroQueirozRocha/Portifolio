# Modelagem do Banco de Dados

## Entidades

| Tabela | Descrição | Relações |
|--------|-----------|---------|
| `users` | Usuário admin (apenas 1) | — |
| `media_items` | Livros, filmes, séries e animes | `genres` (N:N), `tags` (N:N) |
| `genres` | Gêneros de mídia | `media_items` (N:N) |
| `posts` | Posts do blog | `tags` (N:N), `post_series` (N:1) |
| `tags` | Tags compartilhadas entre posts | `posts` (N:N) |
| `post_series` | Agrupamento de posts em séries | `posts` (1:N) |
| `projects` | Projetos do portfolio | `project_tags` (N:N) |

## Schema: `media_items`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID PK | Identificador único |
| `title` | VARCHAR(255) | Título da obra |
| `type` | ENUM | `book` \| `movie` \| `series` \| `anime` |
| `status` | ENUM | `completed` \| `watching` \| `want` |
| `rating` | DECIMAL(3,1) | Nota de 1.0 a 10.0 |
| `comment` | TEXT | Comentário pessoal |
| `cover_url` | TEXT | URL da capa |
| `external_id` | VARCHAR(100) | ID na API externa (TMDB, etc) |
| `year` | INTEGER | Ano de lançamento |
| `synopsis` | TEXT | Sinopse da obra |
| `is_current` | BOOLEAN | Exibir no widget "Atualmente" |
| `started_at` | TIMESTAMP | Data de início |
| `finished_at` | TIMESTAMP | Data de conclusão |
| `created_at` | TIMESTAMP | Data de criação do registro |
| `updated_at` | TIMESTAMP | Data de atualização do registro |

## Schema: `posts`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID PK | Identificador único |
| `title` | VARCHAR(255) | Título do post |
| `slug` | VARCHAR(255) UNIQUE | URL amigável (auto-gerado) |
| `content` | TEXT | Conteúdo em Markdown |
| `excerpt` | TEXT | Resumo curto para listagem |
| `status` | ENUM | `draft` \| `published` |
| `reading_time` | INTEGER | Tempo de leitura em minutos |
| `series_id` | UUID FK | Série de posts (opcional) |
| `series_order` | INTEGER | Ordem dentro da série |
| `published_at` | TIMESTAMP | Data de publicação |
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Data de atualização |

## Índices Recomendados

```sql
-- media_items
CREATE INDEX idx_media_type ON media_items(type);
CREATE INDEX idx_media_status ON media_items(status);
CREATE INDEX idx_media_rating ON media_items(rating);
CREATE INDEX idx_media_is_current ON media_items(is_current);

-- posts
CREATE UNIQUE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_published_at ON posts(published_at);
```
