# Requisitos Funcionais

## RF-P — Módulo Portfolio

| ID | Requisito | Prioridade |
|----|-----------|-----------|
| RF-P01 | Exibir hero com nome, título, bio e links (GitHub, LinkedIn) | Alta |
| RF-P02 | Listar skills organizadas por categoria (Frontend, Backend, DevOps, etc) | Alta |
| RF-P03 | Exibir projetos em destaque com título, descrição, stack, link GitHub e demo | Alta |
| RF-P04 | Widget "Atualmente" mostrando o que está sendo lido/assistido no momento | Média |
| RF-P05 | Formulário de contato funcional com envio de e-mail | Média |
| RF-P06 | Links para redes sociais e currículo para download | Alta |
| RF-P07 | Seção de timeline / história profissional | Baixa |

## RF-M — Módulo Media Tracker (Público)

| ID | Requisito | Prioridade |
|----|-----------|-----------|
| RF-M01 | Listar mídias com filtro por tipo (livro, filme, série, anime) | Alta |
| RF-M02 | Filtrar por status: Concluído / Em andamento / Quero ver | Alta |
| RF-M03 | Busca por título em tempo real | Alta |
| RF-M04 | Ordenar por nota, data de adição e título | Média |
| RF-M05 | Exibir nota pessoal (1–10) e comentário curto por item | Alta |
| RF-M06 | Integrar com TMDB para buscar dados de filmes e séries | Alta |
| RF-M07 | Integrar com Google Books API para buscar dados de livros | Alta |
| RF-M08 | Integrar com Jikan API para buscar dados de animes | Alta |
| RF-M09 | Exibir capa, título, ano, gênero e sinopse de cada item | Alta |
| RF-M10 | Paginação ou scroll infinito na listagem | Média |

## RF-B — Módulo Blog

| ID | Requisito | Prioridade |
|----|-----------|-----------|
| RF-B01 | Listar posts com título, data, tempo de leitura estimado e tags | Alta |
| RF-B02 | Exibir post completo com syntax highlight de código | Alta |
| RF-B03 | Filtrar posts por tags | Média |
| RF-B04 | Busca por texto nos posts | Média |
| RF-B05 | Suporte a posts em formato Markdown com MDX | Alta |
| RF-B06 | Séries de posts (ex: "construindo X - parte 1, 2, 3") | Baixa |
| RF-B07 | RSS feed automático dos posts publicados | Média |
| RF-B08 | Estimativa de tempo de leitura calculada automaticamente | Média |
| RF-B09 | Posts com status: Rascunho ou Publicado | Alta |

## RF-S — Módulo Stats (Dashboard Público)

| ID | Requisito | Prioridade |
|----|-----------|-----------|
| RF-S01 | Total de itens por tipo (livros, filmes, séries, animes) | Alta |
| RF-S02 | Gráfico de itens consumidos por mês/ano | Alta |
| RF-S03 | Distribuição por gênero favorito | Média |
| RF-S04 | Média de notas por categoria | Média |
| RF-S05 | Gráfico estilo "GitHub contributions" de atividade ao longo do tempo | Baixa |
| RF-S06 | Top 5 mais bem avaliados por categoria | Média |

## RF-A — Módulo Admin Panel (Privado)

| ID | Requisito | Prioridade |
|----|-----------|-----------|
| RF-A01 | Login com e-mail e senha (JWT) | Alta |
| RF-A02 | Dashboard com resumo do conteúdo (contadores) | Alta |
| RF-A03 | CRUD completo de mídias (criar, editar, excluir) | Alta |
| RF-A04 | Buscar mídia por título via APIs externas e pré-preencher formulário | Alta |
| RF-A05 | CRUD completo de posts do blog | Alta |
| RF-A06 | Editor Markdown com preview em tempo real | Alta |
| RF-A07 | Gerenciar status de posts (rascunho / publicado) | Alta |
| RF-A08 | Gerenciar projetos do portfolio | Média |
| RF-A09 | Gerenciar skills e categorias | Baixa |
| RF-A10 | Upload de imagens (capas personalizadas) | Média |

## RF-MCP — Módulo MCP Server

| ID | Tool MCP | Descrição |
|----|----------|-----------|
| RF-MCP01 | `list_media` | Listar mídias com filtros opcionais (tipo, status, nota mínima) |
| RF-MCP02 | `get_media` | Buscar detalhes de um item específico por ID ou título |
| RF-MCP03 | `search_media` | Pesquisar por título parcial em todo o acervo |
| RF-MCP04 | `add_media` | Adicionar novo item ao acervo com todos os campos |
| RF-MCP05 | `update_media` | Atualizar status, nota ou comentário de um item |
| RF-MCP06 | `delete_media` | Remover item do acervo pelo ID |
| RF-MCP07 | `get_stats` | Retornar estatísticas gerais do acervo |
| RF-MCP08 | `list_posts` | Listar posts do blog (todos ou por status) |
| RF-MCP09 | `create_draft` | Criar rascunho de post com título e conteúdo Markdown |
| RF-MCP10 | `publish_post` | Publicar um rascunho existente pelo ID |
