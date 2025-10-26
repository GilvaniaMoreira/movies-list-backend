import { vi } from 'vitest';

const mockPrisma = {
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
};

// Reset all mocks before each test
beforeEach(() => {
  Object.values(mockPrisma).forEach((model) => {
    if (typeof model === 'object' && model !== null) {
      Object.values(model).forEach((method) => {
        if (typeof method === 'object' && 'mockReset' in method) {
          method.mockReset();
        }
      });
    }
  });
});

export default mockPrisma;
