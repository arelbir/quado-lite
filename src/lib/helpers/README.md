# Helper Functions System 🛠️

## 📋 Genel Bakış

Bu klasör, tüm action dosyalarında kullanılacak ortak helper functions'ları içerir.

**Dosyalar:**
- `auth-helpers.ts` - Authentication & Authorization
- `error-helpers.ts` - Error handling
- `revalidation-helpers.ts` - Path revalidation
- `index.ts` - Central exports

---

## 🚀 Kullanım

### Quick Start
```typescript
"use server";

import type { ActionResponse } from "@/lib/types";
import { withAuth, createActionError } from "@/lib/helpers";

export async function myAction(data: any): Promise<ActionResponse> {
  return withAuth(async (user) => {
    // Business logic here
    return { success: true, data: result };
  }, { requireAdmin: true });
}
```

---

## 📚 Auth Helpers

### withAuth<T>()
Authentication wrapper - en sık kullanılan!

```typescript
import { withAuth } from "@/lib/helpers";

// Admin yetkisi gerektiren
export async function adminAction(): Promise<ActionResponse> {
  return withAuth(async (user) => {
    // user is type-safe: User
    return { success: true };
  }, { requireAdmin: true });
}

// Sadece authentication
export async function userAction(): Promise<ActionResponse> {
  return withAuth(async (user) => {
    // Any authenticated user
    return { success: true };
  });
}
```

### requireUser()
Low-level authentication check

```typescript
import { requireUser } from "@/lib/helpers";

const userResult = await requireUser();
if ('error' in userResult) {
  return { success: false, error: userResult.error };
}
const { user } = userResult;
```

### requireAdmin()
Admin kontrolü

```typescript
import { requireAdmin } from "@/lib/helpers";

if (!requireAdmin(user)) {
  return { success: false, error: "Admin required" };
}
```

### requireCreatorOrAdmin()
Creator veya admin kontrolü

```typescript
import { requireCreatorOrAdmin } from "@/lib/helpers";

if (!requireCreatorOrAdmin(user, item.createdById)) {
  return { success: false, error: "Permission denied" };
}
```

---

## 🚨 Error Helpers

### createActionError()
Standard error response

```typescript
import { createActionError } from "@/lib/helpers";

try {
  // ... code
} catch (error) {
  return createActionError("create user", error);
  // Output: { success: false, error: "Failed to create user" }
}
```

### createValidationError()
Validation error

```typescript
import { createValidationError } from "@/lib/helpers";

if (!data.email) {
  return createValidationError("Email is required");
}
```

### createNotFoundError()
Not found error

```typescript
import { createNotFoundError } from "@/lib/helpers";

if (!user) {
  return createNotFoundError("User");
  // Output: { success: false, error: "User not found" }
}
```

### createPermissionError()
Permission denied error

```typescript
import { createPermissionError } from "@/lib/helpers";

if (!hasPermission) {
  return createPermissionError("Only admin can perform this action");
}
```

---

## 🔄 Revalidation Helpers

### revalidateAuditPaths()
Audit-related paths

```typescript
import { revalidateAuditPaths } from "@/lib/helpers";

revalidateAuditPaths({
  plans: true,
  audits: true,
  all: true,
  specificPlan: planId,
});
```

### revalidateActionPaths()
Action-related paths

```typescript
import { revalidateActionPaths } from "@/lib/helpers";

revalidateActionPaths({
  list: true,
  specific: actionId,
  myTasks: true,
});
```

### revalidateFindingPaths()
Finding-related paths

```typescript
import { revalidateFindingPaths } from "@/lib/helpers";

revalidateFindingPaths({
  list: true,
  specific: findingId,
});
```

### revalidateDOFPaths()
DOF-related paths

```typescript
import { revalidateDOFPaths } from "@/lib/helpers";

revalidateDOFPaths({
  list: true,
  myTasks: true,
});
```

### revalidateCommonPaths()
All common paths

```typescript
import { revalidateCommonPaths } from "@/lib/helpers";

revalidateCommonPaths();
// Revalidates: /denetim, /denetim/my-tasks, /denetim/all
```

---

## ✅ Best Practices

### DO ✅
```typescript
// ✅ Use withAuth wrapper
export async function myAction(): Promise<ActionResponse> {
  return withAuth(async (user) => {
    // Clean business logic
  });
}

// ✅ Use error helpers
return createNotFoundError("User");

// ✅ Use revalidation helpers
revalidateActionPaths({ list: true, myTasks: true });
```

### DON'T ❌
```typescript
// ❌ Don't manually check auth
const user = await currentUser();
if (!user) return { success: false, error: "Unauthorized" };

// ❌ Don't create custom errors
return { success: false, error: "User not found" };

// ❌ Don't manually revalidate
revalidatePath("/denetim/actions");
revalidatePath("/denetim/my-tasks");
```

---

## 🔗 İlişkili Sistemler

**Types:** `@/lib/types`
```typescript
import type { ActionResponse, User } from "@/lib/types";
import { withAuth } from "@/lib/helpers";
```

**Constants:** `@/lib/constants`
```typescript
import { ACTION_STATUS_LABELS } from "@/lib/constants/status-labels";
import { withAuth } from "@/lib/helpers";
```

---

## 📝 Yeni Helper Ekleme

### Adım 1: Helper dosyasına ekle
```typescript
// auth-helpers.ts
export function myNewHelper() {
  // Implementation
}
```

### Adım 2: index.ts'e export ekle
```typescript
// index.ts
export { myNewHelper } from "./auth-helpers";
```

### Adım 3: Kullan
```typescript
import { myNewHelper } from "@/lib/helpers";
```

---

## 🎯 Action Files Refactoring Pattern

```typescript
"use server";

// 1. Imports
import { db } from "@/drizzle/db";
import { ... } from "@/drizzle/schema";
import type { ActionResponse, User } from "@/lib/types";
import { 
  withAuth, 
  createActionError,
  revalidateActionPaths 
} from "@/lib/helpers";

// 2. Local helpers (if needed)
async function validateData(data: any) {
  // Validation logic
}

// 3. Export actions
export async function myAction(data: any): Promise<ActionResponse> {
  return withAuth(async (user) => {
    // Validate
    const validation = await validateData(data);
    if (!validation.success) {
      return createValidationError(validation.error);
    }
    
    // Business logic
    const result = await db.insert(...).values(...);
    
    // Revalidate
    revalidateActionPaths({ list: true });
    
    return { success: true, data: result };
  }, { requireAdmin: true });
}
```

---

**Pattern:** DRY + Reusable + Type-Safe  
**Status:** ✅ Production Ready  
**Last Updated:** 23 Ekim 2025
