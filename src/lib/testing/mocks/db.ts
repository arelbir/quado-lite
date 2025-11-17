import { vi } from 'vitest'

// Mock database for testing
export const mockDb = {
  query: {
    users: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
    roles: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
  },
  insert: vi.fn(() => ({
    values: vi.fn(() => ({
      returning: vi.fn(),
    })),
  })),
  update: vi.fn(() => ({
    set: vi.fn(() => ({
      where: vi.fn(),
    })),
  })),
  delete: vi.fn(() => ({
    where: vi.fn(),
  })),
}

// Mock Drizzle ORM
vi.mock('@/core/database/client', () => ({
  db: mockDb,
}))
