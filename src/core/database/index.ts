/**
 * DATABASE CORE MODULE
 * Central exports for database layer
 */

// Database client
export { db } from './client';

// All schemas
export * from './schema';

// Migration utilities
// Note: migrate function is internal, use drizzle-kit for migrations
