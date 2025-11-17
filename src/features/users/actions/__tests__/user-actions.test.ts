import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createUser, updateUser, deleteUser } from '../user-actions'
import { mockDb } from '@/lib/testing/mocks/db'
import { createMockUser } from '@/lib/testing/fixtures/user'

// Mock permissions
vi.mock('@/core/permissions/unified-permission-checker', () => ({
  checkPermission: vi.fn(() => Promise.resolve(true)),
}))

// Mock current user
vi.mock('@/features/auth', () => ({
  currentUser: vi.fn(() =>
    Promise.resolve({
      id: 'test-user-id',
      email: 'test@example.com',
    })
  ),
}))

describe('User Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createUser', () => {
    it('should create user with valid data', async () => {
      const mockUser = createMockUser()
      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockUser]),
        }),
      })

      const result = await createUser({
        email: 'new@example.com',
        name: 'New User',
        password: 'Password123!',
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toBeDefined()
      }
    })

    it('should reject invalid email', async () => {
      const result = await createUser({
        email: 'invalid-email',
        name: 'Test',
        password: 'Pass123!',
      })

      expect(result.success).toBe(false)
    })

    it('should reject weak password', async () => {
      const result = await createUser({
        email: 'test@example.com',
        name: 'Test',
        password: '123', // Too weak
      })

      expect(result.success).toBe(false)
    })
  })

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const mockUser = createMockUser({ name: 'Updated Name' })
      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([mockUser]),
        }),
      })

      const result = await updateUser('user-id', {
        name: 'Updated Name',
      })

      expect(result.success).toBe(true)
    })
  })

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      mockDb.delete.mockReturnValue({
        where: vi.fn().mockResolvedValue({ rowCount: 1 }),
      })

      const result = await deleteUser('user-id')

      expect(result.success).toBe(true)
    })
  })
})
