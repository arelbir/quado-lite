# 🏗️ Framework Architecture

**Last Updated:** November 17, 2025

---

## Table of Contents

1. [Overview](#overview)
2. [Design Principles](#design-principles)
3. [Layer Architecture](#layer-architecture)
4. [Feature-Based Structure](#feature-based-structure)
5. [Data Flow](#data-flow)
6. [Type System](#type-system)
7. [Security Model](#security-model)
8. [Performance Strategy](#performance-strategy)

---

## Overview

Quado Framework follows a **Feature-Based Modular Architecture** with clear separation of concerns across multiple layers.

### Architecture Style

- **Feature-Based Modules** - Self-contained, domain-agnostic modules
- **Server-First** - React Server Components by default
- **Type-Safe** - Full TypeScript with strict mode
- **Database-Centric** - Drizzle ORM as single source of truth
- **Progressive Enhancement** - Works without JavaScript

---

## Design Principles

### 1. Feature Independence

Each feature is self-contained with its own:
- Actions (business logic)
- Components (UI)
- Schemas (validation)
- Types (if needed)

```
features/users/
├── actions/          # Business logic
├── components/       # UI components
├── schemas/          # Validation
└── index.ts          # Public API
```

**Benefits:**
- Easy to add/remove features
- Clear boundaries
- Independent testing
- Parallel development

### 2. Core Stability

Core modules provide stable, generic functionality:
- **database** - Data persistence
- **email** - Communication
- **i18n** - Localization
- **permissions** - Authorization

**Guarantees:**
- Stable APIs
- No domain assumptions
- Well-tested
- Documented

### 3. Type Safety

Everything is typed:
- Database schema → TypeScript types
- Validation schema → TypeScript types
- API contracts → TypeScript types

```typescript
// Database defines types
const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull()
})

// Inferred type
type User = typeof users.$inferSelect
```

### 4. Security by Default

- Server Actions only
- Input validation (Zod)
- SQL injection protection (Drizzle)
- XSS protection (React)
- CSRF protection (NextAuth)

---

## Layer Architecture

```
┌─────────────────────────────────────────────────┐
│         Presentation Layer (Next.js)            │
│  - App Router                                   │
│  - Server Components (default)                  │
│  - Client Components (interactive)              │
├─────────────────────────────────────────────────┤
│           Business Logic Layer                  │
│  - Server Actions (type-safe)                   │
│  - Validation (Zod schemas)                     │
│  - Authorization (permission checks)            │
├─────────────────────────────────────────────────┤
│            Feature Modules                      │
│  - Self-contained business domains              │
│  - Actions + Components + Schemas               │
│  - Clear public API (index.ts)                  │
├─────────────────────────────────────────────────┤
│            Core Framework                       │
│  - Database (Drizzle ORM)                       │
│  - Email (Resend)                               │
│  - i18n (next-intl)                             │
│  - Permissions (unified checker)                │
├─────────────────────────────────────────────────┤
│          Infrastructure Layer                   │
│  - PostgreSQL (data)                            │
│  - Resend (email)                               │
│  - UploadThing (files)                          │
│  - Vercel/Docker (hosting)                      │
└─────────────────────────────────────────────────┘
```

### Layer Responsibilities

#### 1. Presentation Layer
- Routing (Next.js App Router)
- Server-side rendering
- Client-side interactivity
- UI components

#### 2. Business Logic Layer
- Input validation
- Business rules
- Authorization
- Data transformation

#### 3. Feature Modules
- Domain logic
- Feature-specific workflows
- Public APIs

#### 4. Core Framework
- Generic utilities
- Infrastructure abstractions
- Cross-cutting concerns

#### 5. Infrastructure Layer
- External services
- Data persistence
- File storage
- Email delivery

---

## Feature-Based Structure

### Anatomy of a Feature

```
features/[feature-name]/
├── actions/
│   └── [feature]-actions.ts      # Server actions
├── components/
│   ├── [feature]-dialog.tsx      # Dialogs
│   ├── [feature]-table.tsx       # Tables
│   └── [feature]-form.tsx        # Forms
├── schemas/
│   └── [feature].ts              # Validation schemas
├── lib/                          # Optional
│   └── [feature]-service.ts      # Complex logic
└── index.ts                      # Public API
```

### Example: Users Feature

```
features/users/
├── actions/
│   └── user-actions.ts
├── components/
│   ├── user-dialog.tsx
│   ├── user-table.tsx
│   └── user-role-management.tsx
├── schemas/
│   └── user.ts
└── index.ts
```

**Public API (`index.ts`):**
```typescript
/**
 * USERS FEATURE
 * User management
 */

// Actions
export * from './actions/user-actions'

// Components
export * from './components/user-dialog'
export * from './components/user-table'
```

**Usage:**
```typescript
import { createUser, UserDialog } from '@/features/users'
```

---

## Data Flow

### Server Action Flow

```
┌──────────┐
│  Client  │
│Component │
└────┬─────┘
     │ 1. Call action
     ▼
┌──────────────┐
│Server Action │
│  (validate)  │
└────┬─────────┘
     │ 2. Validate input (Zod)
     ▼
┌──────────────┐
│ Permission   │
│   Check      │
└────┬─────────┘
     │ 3. Check authorization
     ▼
┌──────────────┐
│  Database    │
│   Query      │
└────┬─────────┘
     │ 4. Execute query
     ▼
┌──────────────┐
│  Transform   │
│   & Return   │
└────┬─────────┘
     │ 5. Return result
     ▼
┌──────────┐
│  Client  │
│  (update)│
└──────────┘
```

### Example Implementation

```typescript
// 1. Client Component
'use client'
export function UserForm() {
  async function handleSubmit(data: FormData) {
    const result = await createUser(data)
    if (result.success) {
      toast.success('User created!')
    }
  }
}

// 2. Server Action
"use server"
import { action } from '@/lib/core/safe-action'
import { userSchema } from '../schemas/user'

export const createUser = action(userSchema, async (data) => {
  // 2. Validation (automatic)
  
  // 3. Permission check
  const hasPermission = await checkPermission({
    userId: currentUser.id,
    resource: 'users',
    action: 'create'
  })
  
  if (!hasPermission) {
    return { success: false, error: 'Unauthorized' }
  }
  
  // 4. Database query
  const [user] = await db.insert(users)
    .values(data)
    .returning()
  
  // 5. Return result
  return { success: true, data: user }
})
```

---

## Type System

### Type Organization

```
types/
├── framework/          # Framework-level types
│   ├── actions.ts     # Action return types
│   └── data-table.ts  # DataTable types
├── domain/            # Business types
│   ├── common.ts      # Common types
│   └── custom-field.ts # Custom field types
└── model/             # Data models
    ├── user.ts        # User model
    └── menu.ts        # Menu model
```

### Type Flow

```typescript
// 1. Database Schema → Type
const users = pgTable('users', {
  id: uuid('id').primaryKey(),
  email: text('email').notNull()
})

type User = typeof users.$inferSelect

// 2. Validation Schema → Type
const userSchema = z.object({
  email: z.string().email()
})

type UserInput = z.infer<typeof userSchema>

// 3. Action Return → Type
type ActionReturn<T> = 
  | { success: true; data: T }
  | { success: false; error: string }
```

---

## Security Model

### 1. Input Validation

**All inputs validated with Zod:**

```typescript
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
})

// Automatic validation in actions
export const action = action(schema, async (data) => {
  // data is validated & typed
})
```

### 2. SQL Injection Protection

**Drizzle ORM parameterized queries:**

```typescript
// ✅ Safe - parameterized
await db.query.users.findFirst({
  where: eq(users.email, userEmail)
})

// ❌ Dangerous - raw SQL
await db.execute(sql`SELECT * FROM users WHERE email = ${userEmail}`)
```

### 3. Authorization

**Permission-based access control:**

```typescript
const canAccess = await checkPermission({
  userId: currentUser.id,
  resource: 'users',
  action: 'delete'
})

if (!canAccess) {
  throw new Error('Unauthorized')
}
```

### 4. Authentication

**NextAuth.js with JWT:**

```typescript
import { auth } from '@/lib/auth/nextauth'

export default async function Page() {
  const session = await auth()
  
  if (!session) {
    redirect('/login')
  }
  
  // Authenticated
}
```

---

## Performance Strategy

### 1. Server Components

**Server-first rendering:**

```typescript
// ✅ Server Component (fast, SEO-friendly)
export default async function Page() {
  const users = await getUsers()
  return <UserList users={users} />
}

// Only use 'use client' when needed
'use client'
export function InteractiveWidget() {
  const [state, setState] = useState()
  // Interactive logic
}
```

### 2. Database Optimization

**Efficient queries:**

```typescript
// ✅ Include relations upfront
const user = await db.query.users.findFirst({
  where: eq(users.id, userId),
  with: {
    roles: true,
    department: true
  }
})

// ❌ N+1 query problem
const user = await getUser(userId)
const roles = await getRoles(userId)  // Separate query
```

### 3. Caching Strategy

```typescript
import { unstable_cache } from 'next/cache'

// Cache expensive operations
const getUsers = unstable_cache(
  async () => {
    return await db.query.users.findMany()
  },
  ['users'],
  { revalidate: 3600 }
)
```

### 4. Streaming

```typescript
import { Suspense } from 'react'

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <SlowComponent />
    </Suspense>
  )
}
```

---

## Deployment Architecture

### Production Setup

```
┌─────────────┐
│   Vercel    │  ← Next.js App
└──────┬──────┘
       │
       ├─────────┐
       │         │
       ▼         ▼
┌──────────┐ ┌──────────┐
│PostgreSQL│ │  Resend  │
│(Supabase)│ │  (Email) │
└──────────┘ └──────────┘
```

### Scaling Considerations

1. **Horizontal Scaling** - Multiple Next.js instances
2. **Database** - Connection pooling (PgBouncer)
3. **Caching** - Redis for session/cache
4. **CDN** - Static assets on edge
5. **Monitoring** - Error tracking (Sentry)

---

**Document Version:** 1.0.0  
**Last Review:** November 17, 2025
