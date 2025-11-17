import { describe, it, expect } from 'vitest'
import { action } from '../safe-action'
import { z } from 'zod'

describe('Safe Action', () => {
  it('should validate input and execute action', async () => {
    const schema = z.object({
      name: z.string().min(1),
    })

    const testAction = action(schema, async (data) => {
      return { success: true, data: { name: data.name } }
    })

    const result = await testAction({ name: 'Test' })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.name).toBe('Test')
    }
  })

  it('should reject invalid input', async () => {
    const schema = z.object({
      email: z.string().email(),
    })

    const testAction = action(schema, async (data) => {
      return { success: true, data }
    })

    const result = await testAction({ email: 'invalid' })

    expect(result.success).toBe(false)
  })

  it('should handle action errors', async () => {
    const schema = z.object({
      name: z.string(),
    })

    const testAction = action(schema, async () => {
      throw new Error('Test error')
    })

    const result = await testAction({ name: 'Test' })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('Test error')
    }
  })
})
