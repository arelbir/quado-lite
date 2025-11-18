import * as Sentry from '@sentry/nextjs'
import { log } from './logger'

export function initSentry() {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NODE_ENV,
      
      // Performance Monitoring
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      
      // Session Replay
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      
      // Filtering
      ignoreErrors: [
        // Ignore common browser errors
        'ResizeObserver loop limit exceeded',
        'Non-Error promise rejection captured',
      ],
      
      beforeSend(event, hint) {
        // Don't send events in development
        if (process.env.NODE_ENV === 'development') {
          log.debug('Sentry Event (dev-only, not sent)', {
            eventId: event.event_id,
            level: event.level,
            message: hint.originalException,
          });
          return null
        }
        return event
      },
    })
  }
}

// Capture exception helper
export function captureException(error: Error, context?: Record<string, any>) {
  Sentry.captureException(error, {
    extra: context,
  })
}

// Capture message helper
export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info') {
  Sentry.captureMessage(message, level)
}

// Set user context
export function setUser(user: { id: string; email?: string; username?: string }) {
  Sentry.setUser(user)
}

// Clear user context
export function clearUser() {
  Sentry.setUser(null)
}
