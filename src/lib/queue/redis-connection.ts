/**
 * REDIS CONNECTION
 * Shared Redis connection for BullMQ queues
 */

import { Redis } from 'ioredis';
import { log } from '@/lib/monitoring/logger';

// Redis connection configuration from environment
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null, // Required for BullMQ
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
};

// Create Redis connections for BullMQ
// BullMQ requires separate connections for different purposes
export const createRedisConnection = () => new Redis(redisConfig);

// Default connection (for simple operations)
export const redis = createRedisConnection();

// Log connection status
redis.on('connect', () => {
  log.info('Redis connected successfully');
});

redis.on('error', (err) => {
  log.error('Redis connection error', err);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  await redis.quit();
});
