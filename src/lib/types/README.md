# Central Types System 🎯

## 📋 Genel Bakış

Bu klasör, projede kullanılan tüm type definition'ları merkezi olarak yöneten sistemin ana dosyalarını içerir.

**Dosyalar:**
- `common.ts` - Tüm type definitions
- `index.ts` - Central export point

---

## 🎨 İçerik

### 1. User Types
```typescript
import type { User } from "@/lib/types";

// ✅ Multi-Role System
const user: User = {
  id: "123",
  name: "John Doe",
  email: "john@example.com",
  userRoles: [
    { role: { code: 'ADMIN', name: 'Administrator' } }
  ]
};

// Check if user is admin
const isAdmin = user.userRoles?.some(ur => 
  ur.role?.code === 'ADMIN' || ur.role?.code === 'SUPER_ADMIN'
);
```

### 2. Plan Types
```typescript
import type { Plan, PlanStatus } from "@/lib/types";
```

### 3. Action Types
```typescript
import type { Action, ActionStatus, ActionType } from "@/lib/types";
```

### 4. Finding Types
```typescript
import type { Finding, FindingStatus, RiskType } from "@/lib/types";
```

### 5. DOF Types
```typescript
import type { DOF, DOFStatus, ActivityType } from "@/lib/types";
```

### 6. Audit Types
```typescript
import type { Audit, AuditStatus } from "@/lib/types";
```

### 7. Response Types
```typescript
import type { ActionResponse } from "@/lib/types";

async function myAction(): Promise<ActionResponse<{ id: string }>> {
  return { success: true, data: { id: "123" } };
}
```

---

## 🚀 Kullanım Örnekleri

### Örnek 1: Server Action
```typescript
"use server";

import type { ActionResponse, User, Plan } from "@/lib/types";

export async function createPlan(data: any): Promise<ActionResponse<{ id: string }>> {
  // Type-safe implementation
}
```

### Örnek 2: Component Props
```typescript
import type { User, Plan } from "@/lib/types";

interface Props {
  user: User;
  plan: Plan;
}

export function PlanCard({ user, plan }: Props) {
  // Type-safe component
}
```

### Örnek 3: Helper Utilities
```typescript
import type { WithRequired, User } from "@/lib/types";

// Make name and email required
type AuthenticatedUser = WithRequired<User, "name" | "email">;
```

---

## 📊 Mevcut Type'lar

### User Type
```typescript
// ✅ NEW: Multi-Role System
interface User {
  id: string;
  name: string | null;
  email: string | null;
  userRoles?: Array<{
    role?: {
      code?: string;  // 'ADMIN', 'SUPER_ADMIN', 'USER', etc.
      name?: string;  // Display name
    };
  }>;
}

// ❌ REMOVED: Legacy single-role field
// role: "admin" | "superAdmin" | "user";
// Use userRoles array instead!
```

### Plan Type
```typescript
interface Plan {
  id: string;
  title: string;
  description: string | null;
  status: "Pending" | "Created" | "Cancelled";
  createdById: string | null;
  templateId: string | null;
  scheduledDate: Date | null;
  [key: string]: any; // For DB fields
}
```

### Action Type
```typescript
interface Action {
  id: string;
  title: string;
  status: "Assigned" | "PendingManagerApproval" | "Completed" | "Rejected" | "Cancelled";
  type: "Simple" | "Corrective" | "Preventive";
  // ...
}
```

---

## 🔧 Type Utilities

### WithRequired<T, K>
Make specific properties required:
```typescript
import type { WithRequired, User } from "@/lib/types";

type UserWithEmail = WithRequired<User, "email">;
```

### WithOptional<T, K>
Make specific properties optional:
```typescript
import type { WithOptional, Plan } from "@/lib/types";

type PartialPlan = WithOptional<Plan, "description" | "scheduledDate">;
```

### PickProps<T, K>
Pick only specified properties:
```typescript
import type { PickProps, User } from "@/lib/types";

type UserBasic = PickProps<User, "id" | "name">;
```

---

## ✅ Avantajlar

### 1. DRY (Don't Repeat Yourself)
- Tek bir dosyada tüm type'lar
- Güncelleme tek yerden
- Type tekrarı yok

### 2. Type Safety
- TypeScript strict mode uyumlu
- Compile-time hata yakalama
- IDE autocomplete desteği

### 3. Maintainability
- Type değişikliği 1 dakika
- Yeni type eklemek kolay
- Consistent naming

### 4. Consistency
- Tüm projede aynı types
- Aynı terminology
- Aynı yapı

---

## 🎯 Best Practices

### ✅ DO
```typescript
// ✅ Merkezi types kullan
import type { User, Plan } from "@/lib/types";

// ✅ Type utilities kullan
import type { WithRequired, User } from "@/lib/types";
type RequiredUser = WithRequired<User, "name">;
```

### ❌ DON'T
```typescript
// ❌ Local type tanımlama
interface User {
  id: string;
  name: string;
}

// ❌ any kullanma
const user: any = {...};
```

---

## 🔄 Migration Guide

### Önce (Local types):
```typescript
// Her dosyada tekrar:
interface User {
  id: string;
  role: string;
  // ...
}

type ActionResponse<T> = ...
```

### Sonra (Central types):
```typescript
// Tek satır import:
import type { User, ActionResponse } from "@/lib/types";
```

---

## 📝 Yeni Type Ekleme

### Adım 1: common.ts'e ekle
```typescript
export interface MyNewType {
  id: string;
  name: string;
}

export type MyNewTypeStatus = MyNewType["status"];
```

### Adım 2: index.ts'e export ekle
```typescript
export type {
  // ... existing exports
  MyNewType,
  MyNewTypeStatus,
} from "./common";
```

### Adım 3: Kullan
```typescript
import type { MyNewType } from "@/lib/types";
```

---

## 🔗 İlişkili Sistemler

**Status Labels:** `@/lib/constants/status-labels`
```typescript
import { USER_STATUS_LABELS } from "@/lib/constants/status-labels";
import type { UserStatus } from "@/lib/types";

const status: UserStatus = "active";
const label = USER_STATUS_LABELS[status];
```

**Helper Functions:** Action files'da helper functions
```typescript
import type { ActionResponse, User } from "@/lib/types";

async function withAuth(callback: (user: User) => Promise<ActionResponse>) {
  // Implementation
}
```

---

## 📚 Daha Fazla Bilgi

**Pattern:** Single Source of Truth  
**Principle:** DRY + Type Safety  
**Status:** ✅ Production Ready

**İlgili Dosyalar:**
- `/lib/constants/` - Status labels & constants
- `/action/*.ts` - Server actions
- `/components/` - UI components

---

**Son Güncelleme:** 23 Ekim 2025  
**Versiyon:** 1.0.0  
**Durum:** ✅ Production Ready
