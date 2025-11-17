import { Ratelimit } from '@upstash/ratelimit'
import { redis } from '@/lib/cache/redis'

// Rate limiters for different use cases
export const rateLimits = {
  // API endpoints - 10 requests per 10 seconds
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '10 s'),
    analytics: true,
    prefix: 'ratelimit:api',
  }),

  // Authentication - 5 attempts per minute
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1 m'),
    analytics: true,
    prefix: 'ratelimit:auth',
  }),

  // File uploads - 3 uploads per minute
  upload: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, '1 m'),
    analytics: true,
    prefix: 'ratelimit:upload',
  }),

  // Expensive operations - 1 per 10 seconds
  expensive: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(1, '10 s'),
    analytics: true,
    prefix: 'ratelimit:expensive',
  }),
}

// Rate limit checker
export async function checkRateLimit(
  identifier: string,
  type: keyof typeof rateLimits = 'api'
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  const { success, limit, remaining, reset } = await rateLimits[type].limit(identifier)

  return {
    success,
    limit,
    remaining,
    reset,
  }
}

// Rate limit middleware for Server Actions
export async function withRateLimit<T>(
  identifier: string,
  type: keyof typeof rateLimits,
  action: () => Promise<T>
): Promise<T> {
  const { success } = await checkRateLimit(identifier, type)

  if (!success) {
    throw new Error('Rate limit exceeded. Please try again later.')
  }

  return await action()
}
