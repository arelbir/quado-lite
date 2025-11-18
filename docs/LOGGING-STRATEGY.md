# Logging Strategy: Pino + Sentry

## Overview

Projede **dual logging** stratejisi kullanılıyor:
- **Pino**: Tüm application logs (structured, local)
- **Sentry**: Production error tracking (critical errors, monitoring)

---

## 🎯 Pino (Application Logging)

### Kullanım Alanları:
- ✅ Business logic tracking
- ✅ HTTP requests/responses
- ✅ Database operations
- ✅ Queue operations
- ✅ Auth events
- ✅ Performance metrics

### Log Levels:
```typescript
log.error()  // Errors (also sent to Sentry in production)
log.warn()   // Warnings
log.info()   // General information
log.http()   // HTTP requests
log.debug()  // Debug information (dev only)
log.db()     // Database operations
log.queue()  // Queue operations
log.auth()   // Auth events
```

### Examples:
```typescript
import { log } from '@/lib/monitoring/logger';

// Info logging
log.info('User logged in', { userId: '123', email: 'user@example.com' });

// HTTP request
log.http('API request completed', {
  method: 'POST',
  url: '/api/users',
  status: 200,
  duration: 145,
});

// Database operation
log.db('Query executed', {
  query: 'SELECT * FROM users WHERE id = $1',
  duration: 45,
  rows: 1,
});

// Error logging
log.error('Database connection failed', {
  error: dbError,
  host: 'localhost',
  port: 5432,
});
```

### Output:
- **Development**: Console (pretty printed with colors)
- **Production**: 
  - `logs/all.log` (all levels)
  - `logs/error.log` (errors only)

---

## 🚨 Sentry (Error Tracking)

### Kullanım Alanları:
- ✅ Unhandled exceptions
- ✅ Critical errors
- ✅ User impact tracking
- ✅ Error trends & alerts
- ✅ Release tracking

### Setup:

1. **Install Sentry:**
```bash
pnpm add @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

2. **Environment Variables:**
```env
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx
SENTRY_AUTH_TOKEN=xxx
```

3. **Auto-configured by wizard:**
- `sentry.client.config.ts`
- `sentry.server.config.ts`
- `sentry.edge.config.ts`

### Features:
- Error grouping & deduplication
- Stack traces with source maps
- User context tracking
- Release tracking
- Performance monitoring
- Real-time alerts

---

## 🔄 Unified Error Handler

**Kullanım (Recommended):**

```typescript
import { handleError } from '@/lib/monitoring/error-handler';

try {
  await riskyOperation();
} catch (error) {
  // Automatically logs to Pino AND Sentry
  handleError(error as Error, {
    userId: user.id,
    action: 'create-user',
    context: 'user-registration',
  });
  
  throw error; // Re-throw if needed
}
```

### Functions:

| Function | Pino | Sentry | Use Case |
|----------|------|--------|----------|
| `handleError()` | ✅ | ✅ (prod) | All errors |
| `handleWarning()` | ✅ | ❌ | Warnings only |
| `logEvent()` | ✅ | ❌ | Business events |
| `logHttpRequest()` | ✅ | ❌ | HTTP requests |
| `logDatabaseOperation()` | ✅ | ❌ | DB operations |

---

## 📋 Best Practices

### 1. **Use Unified Error Handler**
```typescript
// ✅ GOOD
handleError(error, { context: 'payment-processing' });

// ❌ BAD
console.error(error);
log.error('Error', error);
Sentry.captureException(error);
```

### 2. **Add Context to Errors**
```typescript
// ✅ GOOD
handleError(error, {
  userId: user.id,
  orderId: order.id,
  action: 'create-order',
  amount: order.total,
});

// ❌ BAD
handleError(error);
```

### 3. **Don't Log Sensitive Data**
```typescript
// ✅ GOOD
log.info('User authenticated', { userId: user.id });

// ❌ BAD
log.info('User authenticated', { password: user.password }); // NEVER!
```

### 4. **Use Appropriate Log Levels**
```typescript
// ✅ GOOD
log.debug('Cache miss', { key: 'user:123' });      // Dev only
log.info('Order created', { orderId: '456' });     // Business event
log.warn('Payment retry', { attempt: 3 });         // Potential issue
log.error('Payment failed', { error });            // Error + Sentry

// ❌ BAD
log.error('User clicked button');  // Not an error!
log.info('Critical database failure');  // Should be error!
```

---

## 🏗️ Architecture

```
┌─────────────────┐
│   Application   │
└────────┬────────┘
         │
         ├─────────────────┬─────────────────┐
         │                 │                 │
         ▼                 ▼                 ▼
    handleError()     log.info()       log.http()
         │                 │                 │
         │                 └─────────┬───────┘
         │                           │
         ▼                           ▼
    ┌─────────┐              ┌──────────┐
    │  Pino   │              │   Pino   │
    │ (error) │              │  (info)  │
    └────┬────┘              └─────┬────┘
         │                         │
         ├─────────────────────────┤
         │                         │
         ▼                         ▼
    logs/error.log            logs/all.log
         │
         │ (production only)
         ▼
    ┌─────────┐
    │ Sentry  │
    │Dashboard│
    └─────────┘
```

---

## 📊 Log Retention

| Type | Retention | Storage |
|------|-----------|---------|
| Pino logs (dev) | Console only | N/A |
| Pino logs (prod) | 7 days | `logs/*.log` |
| Sentry errors | 90 days | Sentry cloud |
| Sentry events | Per plan | Sentry cloud |

---

## 🚀 Setup Checklist

- [x] Pino logger configured (`src/lib/monitoring/logger.ts`)
- [x] Unified error handler (`src/lib/monitoring/error-handler.ts`)
- [x] Error boundaries use `handleError()`
- [x] Critical paths migrated from `console.log`
- [ ] Sentry installed (optional, for production)
- [ ] Sentry DSN configured (optional)
- [ ] Log rotation configured (production)
- [ ] External log aggregation (optional: Datadog, CloudWatch)

---

## 🔧 Migration Guide

### From console.log to Pino:

```typescript
// Before
console.log('User created:', userId);
console.error('Error:', error);

// After
log.info('User created', { userId });
handleError(error, { context: 'user-creation' });
```

### From direct Sentry to Unified:

```typescript
// Before
log.error('Error', error);
Sentry.captureException(error);

// After
handleError(error, { context: 'operation-name' });
```

---

## 📞 Support

- Pino docs: https://getpino.io
- Sentry docs: https://docs.sentry.io
- Internal: Ask team lead

---

**Last Updated:** 2025-01-25
**Version:** 1.0.0
