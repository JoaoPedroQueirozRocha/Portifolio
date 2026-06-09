# Telas e Fluxos de Navegação

## Páginas Públicas

### `/` — Home
- **Hero:** nome, título, bio curta, botões CTA (Ver projetos / Contato)
- **Widget "Atualmente":** item com `is_current = true` no Media Tracker
- **Skills:** cards agrupados por categoria
- **Projetos em destaque:** grid 3–4 cards com stack e links
- **Blog preview:** últimos 3 posts publicados
- **Rodapé:** links sociais + e-mail

### `/shelf` — Estante de Mídia
- Header com título e contador total de itens
- Tabs de tipo: Todos / Livros / Filmes / Séries / Animes
- Filtros: Status (concluído, em andamento, quero ver) + Ordenação
- Campo de busca por título
- Grid de cards: capa, título, nota em estrelas, status badge
- Modal/drawer ao clicar no card: detalhes completos + comentário

### `/blog` — Lista de Posts
- Header com título e campo de busca
- Filtro de tags (chips clicáveis)
- Lista de posts: título, data, tempo de leitura, preview e tags
- Paginação

### `/blog/[slug]` — Post Individual
- Título, data, autor, tempo de leitura
- Tags do post
- Conteúdo Markdown renderizado com syntax highlight
- Sidebar (desktop): sumário de navegação (headings)
- Navegação anterior/próximo post
- Posts relacionados (mesma tag)

### `/stats` — Dashboard de Estatísticas
- Cards de totais: livros, filmes, séries, animes
- Gráfico de barras: itens por mês
- Gráfico de pizza: distribuição por gênero
- Gráfico de linha: notas médias ao longo do tempo
- Activity heatmap estilo GitHub
- Top 5 por categoria

### `/contato` — Formulário de Contato
- Campos: nome, e-mail, assunto, mensagem
- Feedback visual de envio (loading / sucesso / erro)

---

## Páginas Privadas (`/admin`)

### `/admin/login`
- Formulário de e-mail e senha
- Redirect automático se já autenticado

### `/admin` — Dashboard
- Cards de resumo: total de mídias, posts publicados, rascunhos
- Últimas mídias adicionadas
- Acesso rápido para adicionar mídia ou novo post

### `/admin/media` — Lista de Mídias
- Tabela com título, tipo, status, nota e ações (editar/excluir)
- Filtros e busca
- Botão "Adicionar mídia"

### `/admin/media/new` e `/admin/media/[id]/edit`
- Campo de busca nas APIs externas para pré-preencher dados
- Formulário completo: título, tipo, status, nota (1–10), comentário
- Upload opcional de capa personalizada
- Preview da capa

### `/admin/posts` — Lista de Posts
- Tabela com título, status, data e ações
- Filtro por status (rascunho/publicado)

### `/admin/posts/new` e `/admin/posts/[id]/edit`
- Campo de título e slug (auto-gerado)
- Editor Markdown com preview ao lado
- Gerenciador de tags
- Botões: Salvar rascunho / Publicar
