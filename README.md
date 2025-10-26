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
- **Validação**: Zod
- **Testes**: Vitest + Supertest
- **Mocking**: vitest-mock-extended + nock

## Funcionalidades

- Autenticação de usuários (registro/login)
- Gerenciamento de perfil do usuário
- Busca de filmes via API do TMDB
- Lista de filmes favoritos por usuário
- Listas compartilháveis
- Autorização baseada em JWT
- Migrações de banco de dados com Prisma
- Validação de dados com Zod
- Suíte completa de testes (unitários e integração)
- Arquitetura modular e escalável

## Arquitetura do Projeto

O projeto segue uma arquitetura modular baseada em features, organizando o código por domínio de negócio:

```
src/
├── config/           # Configurações (env, prisma, logger)
├── modules/          # Módulos de domínio (feature-based)
│   ├── auth/         # Autenticação
│   ├── user/         # Gerenciamento de usuários
│   ├── favoriteList/ # Lista de favoritos
│   └── tmdb/         # Integração com TMDB
├── middlewares/      # Middlewares globais
├── utils/           # Utilitários compartilhados
├── types/           # Definições de tipos TypeScript
├── app.ts           # Configuração do Express
└── server.ts        # Ponto de entrada da aplicação
```

### Separação de Responsabilidades

- **Controllers**: Lidam com `req` e `res` do Express
- **Services**: Contêm a lógica de negócio e chamadas ao Prisma
- **Schemas**: Validação de dados com Zod
- **Routes**: Definem endpoints e aplicam middlewares
- **Types**: Definições TypeScript para cada módulo

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
DATABASE_URL="postgresql://postgres:password@localhost:5432/movie_list_app?schema=public"

# API TMDB
TMDB_API_KEY=sua_chave_api_tmdb_aqui
TMDB_BASE_URL=https://api.themoviedb.org/3

# CORS
CORS_ORIGIN=http://localhost:5173

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

## Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Executar em modo desenvolvimento com hot reload
npm run build            # Compilar TypeScript para JavaScript
npm start                # Executar aplicação compilada

# Banco de Dados
npm run prisma:generate  # Gerar cliente Prisma
npm run prisma:migrate   # Executar migrações (produção)
npm run prisma:migrate:dev # Criar e aplicar migrações (desenvolvimento)
npm run prisma:studio    # Abrir interface gráfica do Prisma

# Testes
npm run test:run         # Executar todos os testes
npm run test:watch       # Executar testes em modo watch
npm run test:coverage    # Executar testes com relatório de cobertura
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

## Testes

O projeto possui uma suíte completa de testes implementada seguindo as melhores práticas:

### Executar Testes

```bash
# Executar todos os testes
npm run test:run

# Executar testes em modo watch
npm run test:watch

# Executar testes com coverage
npm run test:coverage
```

### Estrutura dos Testes

```
tests/
├── unit/                    # Testes unitários
│   ├── utils/              # Testes de utilitários
│   │   ├── jwt.test.ts     # Testes JWT
│   │   └── hash.test.ts    # Testes de hash
│   ├── modules/            # Testes de serviços
│   │   ├── auth.service.test.ts
│   │   ├── user.service.test.ts
│   │   └── favoriteList.service.test.ts
│   └── middlewares/         # Testes de middlewares
│       └── authMiddleware.test.ts
└── integration/            # Testes de integração
    └── api.test.ts         # Testes da API REST
```

### Tecnologias de Teste

- **Vitest**: Framework de testes moderno e rápido
- **Supertest**: Testes de integração da API REST
- **vitest-mock-extended**: Mocks avançados para Prisma
- **nock**: Mock de chamadas HTTP para TMDB API

### Cobertura de Testes

- ✅ **58 testes** passando
- ✅ **Cobertura completa** de serviços e middlewares
- ✅ **Mocks isolados** para dependências externas
- ✅ **Testes determinísticos** sem dependências externas

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
  "message": "User registered successfully",
  "data": {
    "message": "User registered successfully",
    "user": {
      "id": 1,
      "name": "João Silva",
      "email": "joao@exemplo.com"
    },
    "token": "jwt_token_aqui"
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
  "message": "Login successful",
  "data": {
    "message": "Login successful",
    "user": {
      "id": 1,
      "name": "João Silva",
      "email": "joao@exemplo.com"
    },
    "token": "jwt_token_aqui"
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
  "message": "Profile retrieved successfully",
  "data": {
    "id": 1,
    "name": "João Silva",
    "email": "joao@exemplo.com",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
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
  "message": "Movies found successfully",
  "data": {
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
  "message": "Movie details retrieved successfully",
  "data": {
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
{
  "message": "Favorites retrieved successfully",
  "data": {
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
    "total_pages": 1,
    "total_results": 1,
    "page": 1
  }
}
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
  "tmdbMovieId": 24428
}
```

**Resposta de sucesso:**
```json
{
  "message": "Movie added to favorites"
}
```

#### DELETE /api/favorites/:tmdbMovieId
Remover filme dos favoritos

**Headers:**
```
Authorization: Bearer <seu_jwt_token>
```

**Resposta de sucesso:**
```json
{
  "message": "Movie removed from favorites"
}
```

#### GET /api/favorites/check/:tmdbMovieId
Verificar se filme está nos favoritos

**Headers:**
```
Authorization: Bearer <seu_jwt_token>
```

**Resposta:**
```json
{
  "message": "Favorite status checked",
  "data": {
    "isFavorite": true
  }
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
  "message": "Share token generated successfully",
  "data": {
    "shareToken": "abc123def456"
  }
}
```

#### GET /api/favorites/share/:shareToken
Obter lista compartilhada (público)

**Resposta:**
```json
{
  "message": "Shared list retrieved successfully",
  "data": {
    "owner": "João Silva",
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
    "page": 1,
    "total_pages": 1,
    "total_results": 1
  }
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

