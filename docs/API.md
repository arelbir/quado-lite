# 📖 API Reference

Complete API documentation for Quado Framework.

---

## Table of Contents

1. [Core APIs](#core-apis)
2. [Feature APIs](#feature-apis)
3. [Utility Functions](#utility-functions)
4. [Type Definitions](#type-definitions)

---

## Core APIs

### Database (`@/core/database`)

#### Client

```typescript
import { db } from '@/core/database/client'

// Query builder
const users = await db.query.users.findMany()

// Insert
const [user] = await db.insert(users)
  .values({ email: 'user@example.com' })
  .returning()

// Update
await db.update(users)
  .set({ name: 'John' })
  .where(eq(users.id, userId))

// Delete
await db.delete(users)
  .where(eq(users.id, userId))
```

#### Queries

```typescript
import { getUserById, getUserByEmail } from '@/core/database/queries/user'

// Get user by ID
const user = await getUserById(userId)

// Get user by email
const user = await getUserByEmail('user@example.com')
```

---

### Email (`@/core/email`)

```typescript
import { EmailService } from '@/core/email/service/email-service'

await EmailService.send({
  to: 'user@example.com' | ['user1@example.com', 'user2@example.com'],
  subject: 'Subject',
  html: '<p>HTML content</p>',
  text: 'Plain text content' // optional
})
```

**Returns:**
```typescript
{
  success: boolean
  error?: any
}
```

---

### i18n (`@/core/i18n`)

#### Server Components

```typescript
import { useTranslations } from 'next-intl'

const t = useTranslations('namespace')
const text = t('key')
```

#### Client Components

```typescript
'use client'
import { useTranslations } from '@/core/i18n/utils/hooks'

const t = useTranslations('namespace')
const text = t('key')
```

**Translation Files:**
- Location: `src/core/i18n/locales/{locale}/{namespace}.json`
- Supported: `en`, `tr`

---

### Permissions (`@/core/permissions`)

```typescript
import { checkPermission } from '@/core/permissions/unified-permission-checker'

const hasAccess = await checkPermission({
  userId: string,
  resource: string,     // e.g., 'users', 'roles'
  action: string,       // e.g., 'create', 'read', 'update', 'delete'
  entityId?: string,    // optional - for ownership checks
  entityOwnerId?: string // optional - for ownership checks
})
```

**Returns:** `Promise<boolean>`

---

## Feature APIs

### Auth (`@/features/auth`)

#### Actions

```typescript
import { 
  login,
  logout, 
  register,
  resetPassword,
  currentUser,
  getLatestUser
} from '@/features/auth'

// Login
const result = await login({
  email: 'user@example.com',
  password: 'password123'
})

// Get current user (cached)
const user = await currentUser()

// Get latest user (fresh from DB)
const user = await getLatestUser()
```

**Login/Register Returns:**
```typescript
{
  success: boolean
  error?: string
  data?: User
}
```

---

### Users (`@/features/users`)

```typescript
import {
  createUser,
  updateUser,
  deleteUser,
  getUsers,
  assignRoleToUser
} from '@/features/users'

// Create user
const result = await createUser({
  email: 'user@example.com',
  name: 'John Doe',
  password: 'password123'
})

// Update user
const result = await updateUser(userId, {
  name: 'Jane Doe'
})

// Assign role
const result = await assignRoleToUser({
  userId: string,
  roleId: string
})
```

---

### Organization (`@/features/organization`)

```typescript
import {
  createCompany,
  createBranch,
  createDepartment,
  createPosition
} from '@/features/organization'

// Create company
const result = await createCompany({
  name: 'Company Name',
  code: 'COMP001'
})

// Create branch
const result = await createBranch({
  name: 'Branch Name',
  companyId: string
})
```

---

### Workflows (`@/features/workflows`)

```typescript
import {
  createWorkflow,
  getWorkflowsByEntity,
  assignWorkflowStep,
  completeWorkflowStep
} from '@/features/workflows'

// Create workflow
const result = await createWorkflow({
  name: 'Approval Workflow',
  entityType: 'Document',
  steps: [...]
})

// Assign step
const result = await assignWorkflowStep({
  stepId: string,
  userId: string
})

// Complete step
const result = await completeWorkflowStep({
  stepId: string,
  status: 'approved' | 'rejected',
  comment?: string
})
```

---

### Custom Fields (`@/features/custom-fields`)

```typescript
import {
  createCustomFieldDefinition,
  getCustomFieldDefinitions,
  saveCustomFieldValues
} from '@/features/custom-fields'

// Create field definition
const result = await createCustomFieldDefinition({
  entityType: 'User',
  fieldKey: 'phone',
  fieldType: 'phone',
  label: 'Phone Number',
  required: true
})

// Get fields for entity
const fields = await getCustomFieldDefinitions('User')

// Save field values
const result = await saveCustomFieldValues({
  entityType: 'User',
  entityId: userId,
  values: {
    phone: '+1234567890'
  }
})
```

---

## Utility Functions

### Safe Actions (`@/lib/core/safe-action`)

```typescript
import { action } from '@/lib/core/safe-action'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1)
})

export const myAction = action(schema, async (data) => {
  // data is validated and typed
  return { success: true, data: result }
})
```

**Returns:**
```typescript
Promise<ActionReturnValue<T>>

type ActionReturnValue<T> = 
  | { success: true; data: T }
  | { success: false; error: string }
```

---

### Pagination (`@/lib/core/pagination`)

```typescript
import { createPaginationInfo } from '@/lib/core/pagination'

const pagination = createPaginationInfo({
  page: 1,
  perPage: 10,
  total: 100
})
```

**Returns:**
```typescript
{
  page: number
  perPage: number
  total: number
  pageCount: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  from: number
  to: number
}
```

---

### Filtering (`@/lib/core/filter`)

```typescript
import { filterColumn } from '@/lib/core/filter'

const condition = filterColumn({
  column: users.name,
  value: 'John',
  operator: 'contains' | 'equals' | 'startsWith' | 'endsWith' | 'notEqual'
})

// Use in query
const results = await db.query.users.findMany({
  where: condition
})
```

---

### Array Utilities (`@/lib/core/array`)

```typescript
import { getMenuHierarchy } from '@/lib/core/array'

// Convert flat array to hierarchy
const hierarchy = getMenuHierarchy(flatMenuArray)
```

---

## Type Definitions

### Framework Types (`@/types/framework`)

```typescript
import type { ActionReturnValue } from '@/types/framework/actions'
import type { DataTableConfig } from '@/types/framework/data-table'

// Action return type
type ActionReturnValue<T> = 
  | { success: true; data: T }
  | { success: false; error: string }

// DataTable config
interface DataTableConfig {
  // ... config options
}
```

---

### Domain Types (`@/types/domain`)

```typescript
import type { 
  CustomFieldDefinition,
  CustomFieldType,
  EntityType 
} from '@/types/domain'

// Custom field types
type CustomFieldType = 
  | 'text'
  | 'textarea'
  | 'number'
  | 'email'
  | 'select'
  | ...

// Entity type (generic)
type EntityType = string
```

---

### Database Types

```typescript
import type { User, Role, Company } from '@/core/database/schema'

// Inferred from schema
type User = typeof users.$inferSelect
type UserInsert = typeof users.$inferInsert
```

---

## HTTP Status Codes

### Success Responses

- `200` - OK (success)
- `201` - Created (resource created)

### Error Responses

- `400` - Bad Request (validation error)
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (not authorized)
- `404` - Not Found (resource not found)
- `500` - Internal Server Error

---

## Error Handling

### Action Errors

```typescript
const result = await myAction(data)

if (!result.success) {
  console.error(result.error)
  toast.error(result.error)
  return
}

// Success
const data = result.data
```

### Database Errors

```typescript
try {
  await db.insert(users).values(data)
} catch (error) {
  if (error.code === '23505') {
    // Unique constraint violation
    return { success: false, error: 'Email already exists' }
  }
  throw error
}
```

---

## Rate Limiting

Currently not implemented. Recommended for production:

```typescript
// Example with Upstash Rate Limit
import { Ratelimit } from '@upstash/ratelimit'

const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, '10 s')
})

const { success } = await ratelimit.limit(userId)
if (!success) {
  return { success: false, error: 'Rate limit exceeded' }
}
```

---

## Webhooks

### UploadThing

```typescript
// src/app/api/uploadthing/route.ts
import { createRouteHandler } from 'uploadthing/next'
import { ourFileRouter } from '@/config/uploadthing'

export const { GET, POST } = createRouteHandler({
  router: ourFileRouter
})
```

---

**API Version:** 3.0.0  
**Last Updated:** November 17, 2025
