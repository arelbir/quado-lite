/**
 * UNIFIED ERROR HANDLER
 * Combines Pino logging + Sentry error tracking
 * 
 * Strategy:
 * - Pino: ALL errors (local logs, structured)
 * - Sentry: CRITICAL errors (production monitoring, alerts)
 * 
 * Usage:
 * ```typescript
 * import { handleError } from '@/lib/monitoring/error-handler';
 * 
 * try {
 *   await riskyOperation();
 * } catch (error) {
 *   handleError(error as Error, { context: 'user-login', userId: '123' });
 * }
 * ```
 */

import { log } from './logger';

/**
 * Handle application errors with dual logging
 * 
 * @param error - Error object
 * @param context - Additional context (userId, action, etc.)
 * @param sendToSentry - Force send to Sentry (default: auto based on severity)
 */
export function handleError(
  error: Error,
  context?: Record<string, any>,
  sendToSentry: boolean = true
): void {
  // 1. ALWAYS log to Pino (structured local logs)
  log.error(error.message || 'Unhandled error', {
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
    context,
    timestamp: new Date().toISOString(),
  });

  // 2. Send to Sentry if:
  //    - Production environment
  //    - Sentry is configured
  //    - sendToSentry is true
  if (sendToSentry && process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_SENTRY_DSN) {
    try {
      // Dynamic import to avoid errors if Sentry not installed
      import('@sentry/nextjs').then(({ captureException }) => {
        captureException(error, {
          extra: context,
          tags: {
            environment: process.env.NODE_ENV,
          },
        });
      }).catch(() => {
        // Sentry not installed, silent fail
        log.warn('Sentry not available, skipping error report');
      });
    } catch (e) {
      // Silent fail - don't break app if Sentry fails
    }
  }
}

/**
 * Handle non-critical warnings (Pino only, no Sentry)
 */
export function handleWarning(message: string, context?: Record<string, any>): void {
  log.warn(message, context);
}

/**
 * Log info events (Pino only)
 */
export function logEvent(message: string, context?: Record<string, any>): void {
  log.info(message, context);
}

/**
 * Log HTTP requests (Pino only)
 */
export function logHttpRequest(
  method: string,
  url: string,
  status: number,
  duration: number
): void {
  log.http(`${method} ${url}`, {
    method,
    url,
    status,
    duration,
  });
}

/**
 * Log database operations (Pino only)
 */
export function logDatabaseOperation(
  operation: string,
  table: string,
  duration: number,
  rowCount?: number
): void {
  log.db(`${operation} on ${table}`, {
    query: `${operation} on ${table}`,
    duration,
    rows: rowCount,
  });
}
