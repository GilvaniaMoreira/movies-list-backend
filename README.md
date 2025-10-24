# API Backend - Lista de Filmes

API REST desenvolvida em TypeScript para o sistema de lista de filmes com autenticação de usuários e gerenciamento de filmes favoritos.

## Tecnologias

- **Runtime**: Node.js 20+
- **Linguagem**: TypeScript
- **Framework**: Express.js
- **ORM**: Prisma
- **Banco de Dados**: PostgreSQL
- **Autenticação**: JWT (JSON Web Tokens)
- **Hash de Senhas**: bcryptjs

## Funcionalidades

- Autenticação de usuários (registro/login)
- Gerenciamento de perfil do usuário
- Busca de filmes via API do TMDB
- Lista de filmes favoritos por usuário
- Listas compartilháveis
- Autorização baseada em JWT
- Migrações de banco de dados com Prisma

## Pré-requisitos

- Node.js 20 ou superior
- Banco de dados PostgreSQL
- Chave da API do TMDB (obtenha em https://www.themoviedb.org/settings/api)

## Variáveis de Ambiente

Crie um arquivo `.env` no diretório backend com as seguintes variáveis:

```env
NODE_ENV=development
PORT=3001

# Banco de Dados
DB_HOST=localhost
DB_PORT=5432
DB_NAME=movie_list_app
DB_USER=postgres
DB_PASSWORD=password
DATABASE_URL="postgresql://postgres:password@localhost:5432/movie_list_app?schema=public"

# API TMDB
TMDB_API_KEY=sua_chave_api_tmdb_aqui
TMDB_BASE_URL=https://api.themoviedb.org/3

# CORS
CORS_ORIGIN=http://localhost:3000

# JWT
JWT_SECRET=sua-chave-secreta-jwt-mude-em-producao
JWT_EXPIRES_IN=7d
```

## Instalação

```bash
# Instalar dependências
npm install

# Gerar cliente Prisma
npm run prisma:generate

# Executar migrações do banco de dados
npm run prisma:migrate:dev
```

## Como Executar

### Modo Desenvolvimento

```bash
npm run dev
```

### Modo Produção

```bash
# Compilar código TypeScript
npm run build

# Executar aplicação compilada
npm start
```

## Endpoints da API

### Autenticação

#### POST /api/auth/register
Registrar novo usuário

**Corpo da requisição:**
```json
{
  "name": "João Silva",
  "email": "joao@exemplo.com",
  "password": "senhaSegura123"
}
```

**Resposta de sucesso:**
```json
{
  "token": "jwt_token_aqui",
  "user": {
    "id": 1,
    "name": "João Silva",
    "email": "joao@exemplo.com"
  }
}
```

#### POST /api/auth/login
Fazer login do usuário

**Corpo da requisição:**
```json
{
  "email": "joao@exemplo.com",
  "password": "senhaSegura123"
}
```

**Resposta de sucesso:**
```json
{
  "token": "jwt_token_aqui",
  "user": {
    "id": 1,
    "name": "João Silva",
    "email": "joao@exemplo.com"
  }
}
```

#### GET /api/auth/profile
Obter perfil do usuário atual (requer autenticação)

**Headers:**
```
Authorization: Bearer <seu_jwt_token>
```

**Resposta de sucesso:**
```json
{
  "id": 1,
  "name": "João Silva",
  "email": "joao@exemplo.com",
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

### Busca de Filmes (TMDB)

#### GET /api/movies/search
Buscar filmes

**Parâmetros de query:**
- `query` (obrigatório): Termo de busca
- `page` (opcional): Número da página (padrão: 1)

**Exemplo:**
```
GET /api/movies/search?query=avengers&page=1
```

**Resposta:**
```json
{
  "results": [
    {
      "id": 24428,
      "title": "Os Vingadores",
      "poster_path": "/path/to/poster.jpg",
      "overview": "Descrição do filme...",
      "release_date": "2012-04-25",
      "vote_average": 7.7,
      "vote_count": 25000
    }
  ],
  "total_pages": 10,
  "total_results": 200
}
```

#### GET /api/movies/popular
Obter filmes populares

**Parâmetros de query:**
- `page` (opcional): Número da página (padrão: 1)

#### GET /api/movies/:id
Obter detalhes de um filme específico

**Resposta:**
```json
{
  "id": 24428,
  "title": "Os Vingadores",
  "overview": "Descrição completa do filme...",
  "poster_path": "/path/to/poster.jpg",
  "backdrop_path": "/path/to/backdrop.jpg",
  "release_date": "2012-04-25",
  "vote_average": 7.7,
  "vote_count": 25000,
  "genres": [
    {"id": 28, "name": "Ação"},
    {"id": 12, "name": "Aventura"}
  ]
}
```

### Favoritos (Todos requerem autenticação)

#### GET /api/favorites
Obter filmes favoritos do usuário

**Headers:**
```
Authorization: Bearer <seu_jwt_token>
```

**Resposta:**
```json
[
  {
    "id": 1,
    "tmdb_id": 24428,
    "title": "Os Vingadores",
    "poster_path": "/path/to/poster.jpg",
    "overview": "Descrição do filme...",
    "rating": 8.5,
    "release_date": "2012-04-25",
    "vote_average": 7.7,
    "vote_count": 25000,
    "created_at": "2024-01-01T00:00:00.000Z"
  }
]
```

#### POST /api/favorites
Adicionar filme aos favoritos

**Headers:**
```
Authorization: Bearer <seu_jwt_token>
```

**Corpo da requisição:**
```json
{
  "tmdb_id": 24428,
  "title": "Os Vingadores",
  "poster_path": "/path/to/poster.jpg",
  "overview": "Descrição do filme...",
  "rating": 8.5,
  "release_date": "2012-04-25",
  "vote_average": 7.7,
  "vote_count": 25000
}
```

**Resposta de sucesso:**
```json
{
  "id": 1,
  "tmdb_id": 24428,
  "title": "Os Vingadores",
  "user_id": 1,
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

#### DELETE /api/favorites/:id
Remover filme dos favoritos

**Headers:**
```
Authorization: Bearer <seu_jwt_token>
```

**Resposta de sucesso:**
```json
{
  "message": "Filme removido dos favoritos com sucesso"
}
```

#### GET /api/favorites/check/:tmdb_id
Verificar se filme está nos favoritos

**Headers:**
```
Authorization: Bearer <seu_jwt_token>
```

**Resposta:**
```json
{
  "isFavorite": true,
  "favoriteId": 1
}
```

#### POST /api/favorites/share
Criar lista compartilhável

**Headers:**
```
Authorization: Bearer <seu_jwt_token>
```

**Resposta:**
```json
{
  "shareUrl": "https://api.exemplo.com/api/favorites/share/abc123-def456",
  "uuid": "abc123-def456"
}
```

#### GET /api/favorites/share/:uuid
Obter lista compartilhada (público)

**Resposta:**
```json
{
  "userName": "João Silva",
  "movies": [
    {
      "title": "Os Vingadores",
      "poster_path": "/path/to/poster.jpg",
      "overview": "Descrição do filme...",
      "rating": 8.5,
      "release_date": "2012-04-25"
    }
  ],
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

### Health Check

#### GET /health
Verificar status da API

**Resposta:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600
}
```

## Autenticação

A API utiliza JWT para autenticação. Após login ou registro, inclua o token no header Authorization:

```
Authorization: Bearer <seu_jwt_token>
```

## Códigos de Status HTTP

- `200` - Sucesso
- `201` - Criado com sucesso
- `400` - Dados inválidos
- `401` - Não autorizado
- `404` - Não encontrado
- `409` - Conflito (ex: filme já está nos favoritos)
- `500` - Erro interno do servidor

## Docker

A aplicação inclui um Dockerfile multi-estágio para deploy em produção:

```bash
# Construir imagem Docker
docker build -t movie-list-backend .

# Executar container
docker run -p 3001:3001 --env-file .env movie-list-backend
```

