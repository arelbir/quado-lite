import { User } from '@/core/database/schema'

export const mockUser: Partial<User> = {
  id: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
  emailVerified: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
}

export const mockAdminUser: Partial<User> = {
  id: 'admin-user-id',
  email: 'admin@example.com',
  name: 'Admin User',
  emailVerified: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
}

export function createMockUser(overrides?: Partial<User>): Partial<User> {
  return {
    ...mockUser,
    ...overrides,
  }
}
