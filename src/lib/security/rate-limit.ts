import { RateLimiterRedis } from 'rate-limiter-flexible'
import { redis } from '@/lib/cache/redis'

// Create rate limiters using standard Redis
// @ts-ignore - ioredis types are compatible with rate-limiter-flexible
const apiLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'ratelimit:api',
  points: 10, // Number of requests
  duration: 10, // Per 10 seconds
})

// @ts-ignore
const authLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'ratelimit:auth',
  points: 5,
  duration: 60, // Per minute
})

// @ts-ignore
const uploadLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'ratelimit:upload',
  points: 3,
  duration: 60,
})

// @ts-ignore
const expensiveLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'ratelimit:expensive',
  points: 1,
  duration: 10,
})

export const rateLimiters = {
  api: apiLimiter,
  auth: authLimiter,
  upload: uploadLimiter,
  expensive: expensiveLimiter,
}

// Rate limit checker
export async function checkRateLimit(
  identifier: string,
  type: keyof typeof rateLimiters = 'api'
): Promise<{ success: boolean; remaining: number; reset: Date }> {
  try {
    const result = await rateLimiters[type].consume(identifier)
    return {
      success: true,
      remaining: result.remainingPoints,
      reset: new Date(Date.now() + result.msBeforeNext),
    }
  } catch (error: any) {
    if (error.remainingPoints !== undefined) {
      return {
        success: false,
        remaining: error.remainingPoints,
        reset: new Date(Date.now() + error.msBeforeNext),
      }
    }
    throw error
  }
}

// Rate limit middleware for Server Actions
export async function withRateLimit<T>(
  identifier: string,
  type: keyof typeof rateLimiters,
  action: () => Promise<T>
): Promise<T> {
  const { success } = await checkRateLimit(identifier, type)

  if (!success) {
    throw new Error('Rate limit exceeded. Please try again later.')
  }

  return await action()
}
