import { beforeAll, afterAll, afterEach, beforeEach, vi } from 'vitest';
import nock from 'nock';

// Mock de variáveis de ambiente
process.env.JWT_SECRET = 'test-secret-key';
process.env.JWT_EXPIRES_IN = '1h';
process.env.TMDB_API_KEY = 'test-api-key';
process.env.TMDB_BASE_URL = 'https://api.themoviedb.org/3';
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.CORS_ORIGIN = 'http://localhost:5173';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';

// Mock do Prisma Client usando o padrão recomendado pela Prisma
vi.mock('../src/config/prisma', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
    favoriteList: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
    favoriteListMovie: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
      count: vi.fn(),
    },
    $transaction: vi.fn(),
    $disconnect: vi.fn(),
  },
}));

// Configurar nock para interceptar chamadas HTTP
beforeAll(() => {
  // Permitir conexões locais
  nock.disableNetConnect();
  nock.enableNetConnect('127.0.0.1');
});

afterEach(() => {
  // Limpar todos os mocks após cada teste
  nock.cleanAll();
});

afterAll(() => {
  // Restaurar conexões de rede
  nock.enableNetConnect();
});
