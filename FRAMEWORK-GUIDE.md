# 🚀 Quado Framework - Developer Guide

**Version:** 3.0.0  
**Status:** ✅ Production Ready  
**Architecture:** Feature-Based Modular Structure

---

## 📁 Project Structure

```
src/
├── features/              # Feature modules (business logic)
│   ├── auth/             # Authentication & Authorization
│   ├── organization/     # Company, Branch, Dept, Position
│   ├── workflows/        # Generic workflow engine
│   ├── notifications/    # Notification system
│   ├── users/           # User management
│   ├── roles/           # RBAC system
│   ├── custom-fields/   # Dynamic custom fields
│   ├── hr-sync/         # HR integration (CSV, LDAP, API)
│   └── menus/           # Dynamic menu management
│
├── core/                 # Framework infrastructure
│   ├── database/        # Database layer (Drizzle ORM)
│   ├── email/           # Email service (Resend)
│   ├── i18n/            # Internationalization
│   └── permissions/     # Permission checker
│
├── lib/                  # Generic utilities
│   ├── core/            # Core utilities (safe-action, pagination, etc.)
│   ├── auth/            # Auth utilities
│   ├── export/          # Export utilities (Excel, PDF)
│   ├── reporting/       # Reporting system
│   └── utils/           # Generic helpers
│
├── components/           # React components
│   ├── shared/          # Shared components
│   ├── ui/              # UI components (shadcn/ui)
│   └── charts/          # Chart components
│
├── app/                  # Next.js App Router
├── server/               # Server utilities
├── config/               # Configuration
├── hooks/                # Global hooks
└── styles/               # Global styles
```

---

## 🎯 Feature Module Structure

Each feature is self-contained:

```
features/feature-name/
├── actions/          # Server actions
├── components/       # Feature-specific components
├── lib/              # Feature utilities
├── hooks/            # Feature hooks
└── index.ts          # Feature exports
```

**Example:**
```typescript
// Import from feature
import { createUser } from '@/features/users/actions/user-actions'
import { UserDialog } from '@/features/users/components/user-dialog'

// Or from feature index
import { Users } from '@/features'
Users.createUser(...)
```

---

## 🔧 Core Modules

### Database
```typescript
import { db } from '@/core/database/client'
import { users, roles } from '@/core/database/schema'
import { getUserById } from '@/core/database/queries/user'
```

### Email
```typescript
import { sendEmail } from '@/core/email/service/email-service'
```

### i18n
```typescript
import { useTranslations } from '@/core/i18n/utils/hooks'
const t = useTranslations('common')
```

### Permissions
```typescript
import { checkPermission } from '@/core/permissions/unified-permission-checker'
```

---

## 🌟 Key Features

### ✅ Authentication & Authorization
- NextAuth.js integration
- Role-based access control (RBAC)
- Permission matrix system
- Multi-tenant support

### ✅ Generic Workflow Engine
- Visual workflow designer
- Custom step definitions
- Auto-assignment rules
- Deadline monitoring
- Workflow delegations

### ✅ Dynamic Custom Fields
- Entity-level custom fields
- Multiple field types (text, number, select, date, etc.)
- Conditional logic support
- Export integration

### ✅ HR Integration
- CSV import/export
- LDAP synchronization
- REST API integration
- Auto-sync scheduling

### ✅ Multi-language Support
- Turkish (TR) - Default
- English (EN)
- Easy to extend

### ✅ Notification System
- In-app notifications
- Email notifications
- Real-time updates
- Notification preferences

---

## 📦 Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript |
| **Database** | PostgreSQL + Drizzle ORM |
| **Auth** | NextAuth.js |
| **UI** | React + Tailwind CSS + shadcn/ui |
| **Email** | Resend |
| **File Upload** | UploadThing |
| **i18n** | next-intl |
| **Charts** | Recharts |
| **Forms** | React Hook Form + Zod |
| **State** | React Server Components |

---

## 🚀 Getting Started

### Installation
```bash
pnpm install
```

### Environment Setup
```bash
cp .env.example .env
# Edit .env with your credentials
```

### Database
```bash
# Generate migration
pnpm db:generate

# Run migration
pnpm db:migrate

# Seed database
pnpm db:seed
```

### Development
```bash
pnpm dev
```

### Build
```bash
pnpm build
```

---

## 📚 Development Guidelines

### Creating a New Feature

1. **Create feature structure:**
```bash
src/features/my-feature/
├── actions/
├── components/
├── lib/
├── hooks/
└── index.ts
```

2. **Define server actions:**
```typescript
// actions/my-feature-actions.ts
"use server"
import { action } from '@/lib/core/safe-action'

export const createMyEntity = action(schema, async (data) => {
  // Implementation
})
```

3. **Create components:**
```typescript
// components/my-feature-dialog.tsx
'use client'
import { createMyEntity } from '../actions/my-feature-actions'
```

4. **Export from index:**
```typescript
// index.ts
export * from './actions/my-feature-actions'
export * from './components/my-feature-dialog'
```

### Database Schema

```typescript
// core/database/schema/my-entity.ts
import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core'

export const myEntity = pgTable('my_entity', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
```

### Server Actions Pattern

```typescript
"use server"
import { action } from '@/lib/core/safe-action'
import { db } from '@/core/database/client'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1),
})

export const createEntity = action(schema, async (data) => {
  const [result] = await db.insert(myEntity)
    .values(data)
    .returning()
  
  return { success: true, data: result }
})
```

---

## 🔐 Permission System

```typescript
// Check permissions
import { checkPermission } from '@/core/permissions/unified-permission-checker'

const hasAccess = await checkPermission({
  userId: 'user-id',
  resource: 'users',
  action: 'create',
})
```

---

## 🌍 Internationalization

### Client Components
```typescript
'use client'
import { useTranslations } from '@/core/i18n/utils/hooks'

export function MyComponent() {
  const t = useTranslations('common')
  return <button>{t('actions.save')}</button>
}
```

### Server Components
```typescript
import { useTranslations } from 'next-intl'

export default function Page() {
  const t = useTranslations('common')
  return <h1>{t('app.name')}</h1>
}
```

---

## 📊 Reporting

```typescript
import { generateExcelReport } from '@/lib/export/excel-service'
import { generatePDFReport } from '@/lib/export/pdf-service'

// Excel
const excel = await generateExcelReport(data, config)

// PDF
const pdf = await generatePDFReport(data, template)
```

---

## 🧪 Testing

```bash
# Type checking
pnpm tsc --noEmit

# Linting
pnpm lint

# Build test
pnpm build
```

---

## 📝 Code Style

- ✅ Use TypeScript for all code
- ✅ Prefer server components over client components
- ✅ Use `action` helper for type-safe server actions
- ✅ Import from feature modules, not internal files
- ✅ Keep components small and focused
- ✅ Use Tailwind CSS for styling
- ✅ Follow the feature-based structure

---

## 🚀 Deployment

### Docker
```bash
docker-compose up -d
```

### Vercel
```bash
vercel deploy
```

---

## 📖 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Drizzle ORM](https://orm.drizzle.team)
- [shadcn/ui](https://ui.shadcn.com)
- [NextAuth.js](https://next-auth.js.org)

---

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

---

## 📄 License

Proprietary - All rights reserved

---

**Last Updated:** November 17, 2025  
**Framework Version:** 3.0.0
