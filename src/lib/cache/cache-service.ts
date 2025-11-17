/**
 * CACHE SERVICE
 * In-memory caching with TTL support
 * Can be upgraded to Redis later
 */

interface CacheEntry<T> {
  value: T;
  expires: number;
}

class CacheService {
  private cache: Map<string, CacheEntry<any>>;
  private defaultTTL: number;

  constructor(defaultTTL: number = 300000) { // 5 minutes default
    this.cache = new Map();
    this.defaultTTL = defaultTTL;
    
    // Cleanup expired entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  /**
   * Get value from cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    // Check if expired
    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.value as T;
  }

  /**
   * Set value in cache
   */
  set<T>(key: string, value: T, ttl?: number): void {
    const expires = Date.now() + (ttl || this.defaultTTL);
    this.cache.set(key, { value, expires });
  }

  /**
   * Delete from cache
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Delete by pattern (prefix)
   */
  deletePattern(pattern: string): void {
    const keys = Array.from(this.cache.keys());
    for (const key of keys) {
      if (key.startsWith(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());
    
    for (const [key, entry] of entries) {
      if (now > entry.expires) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache stats
   */
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  /**
   * Get or set (with callback)
   */
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = this.get<T>(key);
    
    if (cached !== null) {
      return cached;
    }
    
    const value = await fetcher();
    this.set(key, value, ttl);
    return value;
  }
}

// Export singleton instance
export const cache = new CacheService();

// Helper functions for common cache patterns
export const CacheKeys = {
  user: (id: string) => `user:${id}`,
  team: (id: string) => `team:${id}`,
  group: (id: string) => `group:${id}`,
  teamMembers: (teamId: string) => `team:${teamId}:members`,
  groupMembers: (groupId: string) => `group:${groupId}:members`,
  userTeams: (userId: string) => `user:${userId}:teams`,
  userGroups: (userId: string) => `user:${userId}:groups`,
  notifications: (userId: string) => `user:${userId}:notifications`,
  unreadCount: (userId: string) => `user:${userId}:unread-count`,
  workflow: (id: string) => `workflow:${id}`,
  workflowList: (module: string) => `workflows:${module}`,
};

// Cache invalidation helpers
export const invalidateCache = {
  user: (id: string) => {
    cache.delete(CacheKeys.user(id));
    cache.deletePattern(`user:${id}:`);
  },
  team: (id: string) => {
    cache.delete(CacheKeys.team(id));
    cache.delete(CacheKeys.teamMembers(id));
  },
  group: (id: string) => {
    cache.delete(CacheKeys.group(id));
    cache.delete(CacheKeys.groupMembers(id));
  },
  workflow: (id: string) => {
    cache.delete(CacheKeys.workflow(id));
  },
  all: () => cache.clear(),
};
