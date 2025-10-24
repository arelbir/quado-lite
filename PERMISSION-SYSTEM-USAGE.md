# 🔐 PERMISSION SYSTEM - USAGE GUIDE

## 📋 Quick Reference

**Status:** ✅ Production Ready  
**Version:** Week 3 Complete  
**Backward Compatible:** Yes

---

## 🚀 QUICK START

### **1. Basic Permission Check**

```typescript
import { createPermissionChecker } from "@/lib/helpers";

// In your action/API route
export async function myAction() {
  const checker = createPermissionChecker(userId);
  
  if (await checker.can({ resource: 'Audit', action: 'Create' })) {
    // User can create audits
  }
}
```

### **2. Using withAuth (Recommended)**

```typescript
import { withAuth } from "@/lib/helpers";

// ✅ NEW WAY: Permission-based
export async function approveAudit(auditId: string) {
  return withAuth(
    async (user) => {
      // Your business logic
      return { success: true };
    },
    {
      requirePermission: {
        resource: 'Audit',
        action: 'Approve'
      }
    }
  );
}

// ✅ OLD WAY: Still works (backward compatible)
export async function deleteUser(userId: string) {
  return withAuth(
    async (user) => {
      // Your business logic
      return { success: true };
    },
    { requireAdmin: true } // Legacy admin check
  );
}
```

---

## 📖 DETAILED EXAMPLES

### **Example 1: Server Action with Permission**

```typescript
// src/action/audit-actions.ts
"use server";

import { withAuth } from "@/lib/helpers";
import { db } from "@/drizzle/db";
import { audits } from "@/drizzle/schema";

export async function createAudit(data: AuditData) {
  return withAuth(
    async (user) => {
      // Business logic
      const audit = await db.insert(audits).values({
        ...data,
        createdById: user.id,
      }).returning();
      
      return { success: true, data: audit[0] };
    },
    {
      requirePermission: {
        resource: 'Audit',
        action: 'Create'
      }
    }
  );
}
```

### **Example 2: Context-Based Permission**

```typescript
// Check permission for specific department
export async function approveAction(actionId: string) {
  return withAuth(
    async (user) => {
      // Get action first
      const action = await db.query.actions.findFirst({
        where: eq(actions.id, actionId)
      });
      
      if (!action) {
        return { success: false, error: "Action not found" };
      }
      
      // Context-aware check (department)
      const checker = createPermissionChecker(user.id);
      const canApprove = await checker.can({
        resource: 'Action',
        action: 'Approve',
        context: {
          departmentId: action.departmentId || undefined,
          status: action.status
        }
      });
      
      if (!canApprove) {
        return { success: false, error: "Cannot approve action in this department" };
      }
      
      // Approve logic
      await db.update(actions)
        .set({ status: 'Completed' })
        .where(eq(actions.id, actionId));
      
      return { success: true };
    }
  );
}
```

### **Example 3: Multiple Permissions (AND)**

```typescript
import { createPermissionChecker } from "@/lib/helpers";

export async function complexOperation() {
  const checker = createPermissionChecker(userId);
  
  // Check if user has ALL permissions
  const canProceed = await checker.canAll([
    { resource: 'Audit', action: 'Create' },
    { resource: 'Finding', action: 'Create' },
    { resource: 'Action', action: 'Create' },
  ]);
  
  if (canProceed) {
    // User has all required permissions
  }
}
```

### **Example 4: Multiple Permissions (OR)**

```typescript
import { createPermissionChecker } from "@/lib/helpers";

export async function viewDashboard() {
  const checker = createPermissionChecker(userId);
  
  // Check if user has ANY of these permissions
  const canView = await checker.canAny([
    { resource: 'Audit', action: 'Read' },
    { resource: 'Finding', action: 'Read' },
    { resource: 'Action', action: 'Read' },
  ]);
  
  if (canView) {
    // User can view dashboard
  }
}
```

### **Example 5: Detailed Permission Check**

```typescript
import { createPermissionChecker } from "@/lib/helpers";

export async function debugPermissions() {
  const checker = createPermissionChecker(userId);
  
  // Get detailed result
  const result = await checker.canWithReason({
    resource: 'DOF',
    action: 'Approve'
  });
  
  if (result.granted) {
    console.log(`Permission granted by role: ${result.matchedRole}`);
    console.log(`Permission: ${result.matchedPermission}`);
  } else {
    console.log(`Permission denied: ${result.reason}`);
  }
}
```

---

## 🎯 SHORTHAND HELPERS

Use pre-defined helpers for common checks:

```typescript
import { 
  canCreateAudit,
  canApproveAudit,
  canCreateFinding,
  canCloseFinding,
  canApproveAction,
  canApproveDOF,
  canManageUsers,
  canManageRoles
} from "@/lib/helpers";

// Quick checks
if (await canCreateAudit(userId)) {
  // Show "Create Audit" button
}

if (await canApproveAction(userId, actionId)) {
  // Show "Approve" button
}

if (await canManageUsers(userId)) {
  // Show user management section
}
```

---

## 🔄 MIGRATION GUIDE

### **Migrating from Admin-Only Checks**

**Before (Old System):**
```typescript
export async function deleteAudit(id: string) {
  return withAuth(async (user) => {
    if (!requireAdmin(user)) {
      return { success: false, error: "Admin required" };
    }
    // Delete logic
  });
}
```

**After (New System):**
```typescript
export async function deleteAudit(id: string) {
  return withAuth(
    async (user) => {
      // Delete logic (permission checked automatically)
    },
    {
      requirePermission: {
        resource: 'Audit',
        action: 'Delete'
      }
    }
  );
}
```

**Hybrid (Both Systems):**
```typescript
export async function criticalOperation(id: string) {
  return withAuth(
    async (user) => {
      // Critical logic
    },
    {
      requireAdmin: true, // Fallback: admin required
      requirePermission: { // Primary: specific permission
        resource: 'System',
        action: 'Execute'
      }
    }
  );
}
```

---

## 🎨 UI COMPONENTS

### **React Component with Permission**

```typescript
// components/audit/create-audit-button.tsx
"use client";

import { useEffect, useState } from "react";
import { canCreateAudit } from "@/lib/helpers";
import { Button } from "@/components/ui/button";

export function CreateAuditButton({ userId }: { userId: string }) {
  const [canCreate, setCanCreate] = useState(false);
  
  useEffect(() => {
    canCreateAudit(userId).then(setCanCreate);
  }, [userId]);
  
  if (!canCreate) return null; // Hide button if no permission
  
  return (
    <Button onClick={handleCreate}>
      Create Audit
    </Button>
  );
}
```

### **Server Component with Permission**

```typescript
// app/(main)/audits/page.tsx
import { currentUser } from "@/lib/auth";
import { canCreateAudit } from "@/lib/helpers";
import { CreateAuditButton } from "@/components/audit/create-audit-button";

export default async function AuditsPage() {
  const user = await currentUser();
  if (!user) redirect('/login');
  
  const canCreate = await canCreateAudit(user.id);
  
  return (
    <div>
      <h1>Audits</h1>
      {canCreate && <CreateAuditButton userId={user.id} />}
    </div>
  );
}
```

---

## 🔍 DEBUGGING

### **Get All User Permissions**

```typescript
import { createPermissionChecker } from "@/lib/helpers";

export async function debugUserPermissions(userId: string) {
  const checker = createPermissionChecker(userId);
  
  // Get all permissions
  const permissions = await checker.getAllPermissions();
  console.log("User permissions:", permissions);
  // ["audit.create", "audit.read", "finding.create", ...]
  
  // Get all roles
  const roles = await checker.getRoles();
  console.log("User roles:", roles);
  // [{ code: "AUDITOR", name: "Auditor" }, ...]
}
```

### **Clear Cache**

```typescript
import { createPermissionChecker } from "@/lib/helpers";

// After role/permission changes
export async function updateUserRole(userId: string, roleId: string) {
  // Update role...
  
  // Clear permission cache
  const checker = createPermissionChecker(userId);
  checker.clearCache();
}
```

---

## ⚡ PERFORMANCE

### **Caching Strategy**

```typescript
// PermissionChecker automatically caches results
const checker = createPermissionChecker(userId);

// First call: DB query
await checker.can({ resource: 'Audit', action: 'Create' }); // ~50ms

// Second call: Cached
await checker.can({ resource: 'Audit', action: 'Create' }); // ~1ms

// Cache is per-instance, per-permission
```

### **Best Practices**

1. **Reuse checker instance:**
   ```typescript
   const checker = createPermissionChecker(userId);
   
   // Multiple checks with same instance (cached)
   await checker.can({ resource: 'Audit', action: 'Create' });
   await checker.can({ resource: 'Finding', action: 'Create' });
   ```

2. **Use shorthand helpers for simple checks:**
   ```typescript
   // ✅ Good
   if (await canCreateAudit(userId)) { ... }
   
   // ❌ Overkill for simple checks
   const checker = createPermissionChecker(userId);
   if (await checker.can({ resource: 'Audit', action: 'Create' })) { ... }
   ```

3. **Clear cache after changes:**
   ```typescript
   // After assigning/revoking roles
   checker.clearCache();
   ```

---

## 🎯 COMMON PATTERNS

### **Pattern 1: Action Guard**

```typescript
export async function myAction(id: string) {
  return withAuth(
    async (user) => {
      // Business logic
    },
    { requirePermission: { resource: 'Resource', action: 'Action' } }
  );
}
```

### **Pattern 2: Manual Check**

```typescript
export async function myAction(id: string) {
  return withAuth(async (user) => {
    const checker = createPermissionChecker(user.id);
    
    if (!await checker.can({ resource: 'Resource', action: 'Action' })) {
      return { success: false, error: "Permission denied" };
    }
    
    // Business logic
  });
}
```

### **Pattern 3: Context-Aware**

```typescript
export async function myAction(resourceId: string) {
  return withAuth(async (user) => {
    const resource = await getResource(resourceId);
    const checker = createPermissionChecker(user.id);
    
    const canAccess = await checker.can({
      resource: 'Resource',
      action: 'Update',
      context: {
        departmentId: resource.departmentId,
        status: resource.status
      }
    });
    
    if (!canAccess) {
      return { success: false, error: "Cannot access resource" };
    }
    
    // Business logic
  });
}
```

---

## 📚 AVAILABLE PERMISSIONS

### **Audit Management**
- `audit.create`, `audit.read`, `audit.update`, `audit.delete`
- `audit.approve`, `audit.export`

### **Finding Management**
- `finding.create`, `finding.read`, `finding.update`, `finding.delete`
- `finding.assign`, `finding.close`, `finding.approve`, `finding.reject`

### **Action Management**
- `action.create`, `action.read`, `action.update`, `action.delete`
- `action.complete`, `action.approve`, `action.reject`, `action.cancel`

### **DOF Management**
- `dof.create`, `dof.read`, `dof.update`, `dof.delete`
- `dof.submit`, `dof.approve`, `dof.reject`

### **User Management**
- `user.create`, `user.read`, `user.update`, `user.delete`
- `user.assign_role`

### **Organization Management**
- `department.create`, `department.read`, `department.update`, `department.delete`

### **System Management**
- `role.create`, `role.read`, `role.update`, `role.delete`

### **Reporting**
- `report.audit`, `report.finding`, `report.dof`

---

## ✅ CHECKLIST

Before deploying permission system:

- [ ] Roles seeded (`pnpm run seed:roles`)
- [ ] Permissions seeded (automatic with roles)
- [ ] Users assigned to roles (via UserRoles table)
- [ ] Legacy admin checks still working
- [ ] New permission checks implemented
- [ ] UI components updated
- [ ] Cache strategy understood
- [ ] Tested with different roles

---

## 🎉 YOU'RE READY!

**Permission system is production-ready!**

**Next steps:**
1. Assign roles to users
2. Update existing actions with permissions
3. Build role management UI
4. Enjoy granular access control! 🚀
