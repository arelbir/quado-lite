import { unstable_cache } from 'next/cache'
import { cache, cacheKeys, cacheTTL } from './redis'

/**
 * Cached database queries
 * Combines Next.js cache with Redis for optimal performance
 */

// Cache user query
export const getCachedUser = unstable_cache(
  async (userId: string, getUser: () => Promise<any>) => {
    // Try Redis first
    const cached = await cache.get(cacheKeys.user(userId))
    if (cached) return cached

    // Fetch from DB
    const user = await getUser()
    
    // Cache in Redis
    if (user) {
      await cache.set(cacheKeys.user(userId), user, cacheTTL.medium)
    }
    
    return user
  },
  ['user'],
  { revalidate: cacheTTL.medium }
)

// Cache users list
export const getCachedUsers = unstable_cache(
  async (getUsers: () => Promise<any>) => {
    const cached = await cache.get(cacheKeys.users())
    if (cached) return cached

    const users = await getUsers()
    await cache.set(cacheKeys.users(), users, cacheTTL.short)
    
    return users
  },
  ['users'],
  { revalidate: cacheTTL.short }
)

// Cache permissions
export const getCachedPermissions = unstable_cache(
  async (userId: string, getPermissions: () => Promise<any>) => {
    const cached = await cache.get(cacheKeys.permissions(userId))
    if (cached) return cached

    const permissions = await getPermissions()
    await cache.set(cacheKeys.permissions(userId), permissions, cacheTTL.long)
    
    return permissions
  },
  ['permissions'],
  { revalidate: cacheTTL.long }
)

// Invalidate user cache
export async function invalidateUserCache(userId: string) {
  await cache.del([
    cacheKeys.user(userId),
    cacheKeys.users(),
    cacheKeys.permissions(userId),
    cacheKeys.menu(userId),
  ])
}

// Invalidate all users cache
export async function invalidateUsersCache() {
  await cache.clear('user:*')
  await cache.clear('users:*')
}
