/**
 * STRUCTURED LOGGING WITH PINO
 * Production-ready logging system
 * 
 * Features:
 * - Fast JSON logging (Pino)
 * - Pretty printing in development
 * - Context-aware child loggers
 * - Error stack traces
 * - Metadata support
 */

import pino from 'pino'

// Create logger instance
export const logger = pino({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'development' ? 'debug' : 'info'),
  transport:
    process.env.NODE_ENV === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
})

// Enhanced log helpers with better DX
export const log = {
  /**
   * Info level - General information
   */
  info: (msg: string, data?: object) => logger.info(data, msg),
  
  /**
   * Warn level - Warning messages
   */
  warn: (msg: string, data?: object) => logger.warn(data, msg),
  
  /**
   * Error level - Error messages with stack trace
   */
  error: (msg: string, error?: Error | object) => {
    if (error instanceof Error) {
      logger.error({ err: error, stack: error.stack }, msg)
    } else {
      logger.error(error, msg)
    }
  },
  
  /**
   * Debug level - Debug information (dev only)
   */
  debug: (msg: string, data?: object) => logger.debug(data, msg),
  
  /**
   * Trace level - Very detailed logging
   */
  trace: (msg: string, data?: object) => logger.trace(data, msg),

  /**
   * HTTP requests logging
   */
  http: (msg: string, data?: { method?: string; url?: string; status?: number; duration?: number }) => {
    logger.info(data, msg)
  },

  /**
   * Database operations logging
   */
  db: (msg: string, data?: { query?: string; duration?: number; rows?: number }) => {
    logger.debug(data, `[DB] ${msg}`)
  },

  /**
   * Queue operations logging
   */
  queue: (msg: string, data?: { queue?: string; jobId?: string; status?: string }) => {
    logger.info(data, `[Queue] ${msg}`)
  },

  /**
   * Auth operations logging
   */
  auth: (msg: string, data?: { userId?: string; action?: string }) => {
    logger.info(data, `[Auth] ${msg}`)
  },
}

// Create child logger for specific context
export function createLogger(context: string) {
  return logger.child({ context })
}

// Specialized loggers for different modules
export const loggers = {
  api: createLogger('API'),
  db: createLogger('Database'),
  queue: createLogger('Queue'),
  auth: createLogger('Auth'),
  storage: createLogger('Storage'),
  notification: createLogger('Notification'),
  workflow: createLogger('Workflow'),
  hrSync: createLogger('HR-Sync'),
}

// Console replacement (to help migration)
export const console = {
  log: (msg: string, ...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      logger.info({ args }, msg)
    }
  },
  error: (msg: string, ...args: any[]) => {
    logger.error({ args }, msg)
  },
  warn: (msg: string, ...args: any[]) => {
    logger.warn({ args }, msg)
  },
  info: (msg: string, ...args: any[]) => {
    logger.info({ args }, msg)
  },
  debug: (msg: string, ...args: any[]) => {
    logger.debug({ args }, msg)
  },
}
