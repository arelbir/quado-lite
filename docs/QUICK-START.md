# 🚀 Quick Start Guide

Get up and running with Quado Framework in **10 minutes**.

---

## Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **PostgreSQL** 15+ ([Download](https://www.postgresql.org/download/))
- **pnpm** 8+ (Install: `npm install -g pnpm`)

---

## 1. Clone & Install

```bash
# Clone repository
git clone <your-repo-url>
cd quado-framework

# Install dependencies
pnpm install
```

---

## 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env
```

Edit `.env`:

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/quado"

# NextAuth
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"

# Email (Get free key at resend.com)
RESEND_API_KEY="re_..."
EMAIL_FROM="noreply@yourdomain.com"

# File Upload (Get at uploadthing.com)
UPLOADTHING_SECRET="sk_..."
UPLOADTHING_APP_ID="..."
```

---

## 3. Database Setup

```bash
# Generate initial schema
pnpm db:generate

# Run migrations
pnpm db:migrate

# Seed initial data
pnpm db:seed
```

**Default Admin:**
- Email: `admin@example.com`
- Password: `Admin123!`

---

## 4. Start Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 5. Create Your First Feature

### Step 1: Create Feature Structure

```bash
mkdir -p src/features/products/{actions,components,schemas}
touch src/features/products/index.ts
```

### Step 2: Define Schema

```typescript
// src/features/products/schemas/product.ts
import { z } from 'zod'

export const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  price: z.number().positive('Price must be positive'),
  description: z.string().optional()
})

export type ProductInput = z.infer<typeof productSchema>
```

### Step 3: Create Database Schema

```typescript
// src/core/database/schema/product.ts
import { pgTable, uuid, text, numeric, timestamp } from 'drizzle-orm/pg-core'

export const products = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

export type Product = typeof products.$inferSelect
```

### Step 4: Create Server Action

```typescript
// src/features/products/actions/product-actions.ts
"use server"

import { action } from '@/lib/core/safe-action'
import { productSchema } from '../schemas/product'
import { db } from '@/core/database/client'
import { products } from '@/core/database/schema/product'

export const createProduct = action(productSchema, async (data) => {
  const [product] = await db.insert(products)
    .values(data)
    .returning()
  
  return { success: true, data: product }
})

export const getProducts = async () => {
  return await db.query.products.findMany({
    orderBy: (products, { desc }) => [desc(products.createdAt)]
  })
}
```

### Step 5: Create Component

```typescript
// src/features/products/components/product-form.tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { productSchema, type ProductInput } from '../schemas/product'
import { createProduct } from '../actions/product-actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

export function ProductForm() {
  const [loading, setLoading] = useState(false)
  
  const form = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      price: 0,
      description: ''
    }
  })
  
  async function onSubmit(data: ProductInput) {
    setLoading(true)
    const result = await createProduct(data)
    setLoading(false)
    
    if (result.success) {
      toast.success('Product created!')
      form.reset()
    } else {
      toast.error(result.error)
    }
  }
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Input
          {...form.register('name')}
          placeholder="Product Name"
        />
        {form.formState.errors.name && (
          <p className="text-red-500 text-sm">{form.formState.errors.name.message}</p>
        )}
      </div>
      
      <div>
        <Input
          {...form.register('price', { valueAsNumber: true })}
          type="number"
          step="0.01"
          placeholder="Price"
        />
      </div>
      
      <Button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Product'}
      </Button>
    </form>
  )
}
```

### Step 6: Export from Feature

```typescript
// src/features/products/index.ts
/**
 * PRODUCTS FEATURE
 */

export * from './actions/product-actions'
export * from './components/product-form'
```

### Step 7: Create Page

```typescript
// src/app/(main)/products/page.tsx
import { getProducts } from '@/features/products'
import { ProductForm } from '@/features/products'

export default async function ProductsPage() {
  const products = await getProducts()
  
  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Products</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="text-xl font-semibold mb-4">Create Product</h2>
          <ProductForm />
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Product List</h2>
          <div className="space-y-2">
            {products.map(product => (
              <div key={product.id} className="p-4 border rounded">
                <h3 className="font-semibold">{product.name}</h3>
                <p className="text-sm text-gray-600">${product.price}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
```

### Step 8: Run Migration

```bash
# Generate migration for new schema
pnpm db:generate

# Run migration
pnpm db:migrate
```

---

## 6. Common Tasks

### Add Translation

```json
// src/core/i18n/locales/en/common.json
{
  "products": {
    "title": "Products",
    "create": "Create Product",
    "name": "Name",
    "price": "Price"
  }
}
```

### Use Translation

```typescript
import { useTranslations } from '@/core/i18n/utils/hooks'

export function MyComponent() {
  const t = useTranslations('common')
  return <h1>{t('products.title')}</h1>
}
```

### Check Permission

```typescript
import { checkPermission } from '@/core/permissions/unified-permission-checker'

const canCreate = await checkPermission({
  userId: currentUser.id,
  resource: 'products',
  action: 'create'
})
```

### Send Email

```typescript
import { EmailService } from '@/core/email/service/email-service'

await EmailService.send({
  to: 'user@example.com',
  subject: 'Welcome!',
  html: '<p>Hello!</p>'
})
```

---

## 7. Testing

```bash
# Type check
pnpm tsc --noEmit

# Lint
pnpm lint

# Build
pnpm build
```

---

## 8. Deploy

### Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Docker

```bash
# Build image
docker build -t quado-framework .

# Run container
docker run -p 3000:3000 quado-framework
```

---

## Next Steps

- 📖 Read [Full Documentation](./FRAMEWORK.md)
- 🏗️ Study [Architecture](./ARCHITECTURE.md)
- 📚 Explore [API Reference](./API.md)
- 🎨 Customize UI with [shadcn/ui](https://ui.shadcn.com)

---

**Need Help?**
- 📧 Email: support@quado.com
- 💬 Discord: [Join Server](#)
- 📖 Docs: [docs.quado.com](#)

---

**Happy Coding!** 🚀
