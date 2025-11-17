import { Redis } from '@upstash/redis'

// Redis client for caching
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Cache key generator
export const cacheKeys = {
  user: (id: string) => `user:${id}`,
  users: () => 'users:all',
  role: (id: string) => `role:${id}`,
  roles: () => 'roles:all',
  permissions: (userId: string) => `permissions:${userId}`,
  menu: (userId: string) => `menu:${userId}`,
}

// Cache TTL (in seconds)
export const cacheTTL = {
  short: 60, // 1 minute
  medium: 300, // 5 minutes
  long: 3600, // 1 hour
  day: 86400, // 24 hours
}

// Cache helpers
export const cache = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redis.get(key)
      return data as T | null
    } catch (error) {
      console.error('Cache get error:', error)
      return null
    }
  },

  async set<T>(key: string, value: T, ttl: number = cacheTTL.medium): Promise<void> {
    try {
      await redis.setex(key, ttl, JSON.stringify(value))
    } catch (error) {
      console.error('Cache set error:', error)
    }
  },

  async del(key: string | string[]): Promise<void> {
    try {
      if (Array.isArray(key)) {
        await redis.del(...key)
      } else {
        await redis.del(key)
      }
    } catch (error) {
      console.error('Cache del error:', error)
    }
  },

  async clear(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(pattern)
      if (keys.length > 0) {
        await redis.del(...keys)
      }
    } catch (error) {
      console.error('Cache clear error:', error)
    }
  },
}
