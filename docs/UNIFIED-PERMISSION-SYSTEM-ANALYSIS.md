# 🔍 **UNIFIED PERMISSION SYSTEM - ANALİZ VE ÖNERİ**

**Date:** 2025-01-29  
**Status:** Analysis & Proposal  
**Priority:** 🔥 CRITICAL - Architecture Decision

---

## 🎯 **KULLANICI TALEBİ**

> **"Bizim tek bir yetkilendirme yapımız olmalı ordan menü yetkisinide sayfada neler yapabileceğini de yönetebilmeliyiz ya zaten altyapımız buna uygundur ya yetkilendirme sistemi workflowla birlikte çalışacaktı amacımız buydu"**

### **Talep Özeti:**
```
✅ Tek merkezi yetkilendirme sistemi
✅ Menü yetkileri + sayfa içi yetkiler unified
✅ Workflow ile entegre
✅ Altyapı zaten bu şekilde tasarlanmış
```

---

## 📊 **MEVCUT DURUM ANALİZİ**

### **1. ALTYAPI (Schema):**

```typescript
// ✅ MEVCUT - role-system.ts

📋 Roles Table
   - id, name, code, category, scope
   - isSystem, isActive
   - createdById

📋 UserRoles Table (Junction)
   - userId, roleId
   - contextType, contextId (Department/Branch/Global)
   - validFrom, validTo (time-based)
   - isActive

📋 Permissions Table ⭐
   - id, name, code (e.g., "audit.create")
   - resource, action (Granular!)
   - category (Grouping)
   - isSystem

📋 RolePermissions Table (Junction)
   - roleId, permissionId
   - constraints (JSON) ⭐⭐⭐
   - Example: {"department": "own", "status": ["Active"]}

📋 RoleMenus Table (Junction)
   - roleId, menuId
   - createdById

// ✅ MEVCUT - workflow.ts

📋 WorkflowDefinition
   - entityType (Audit/Finding/Action/DOF)
   - steps (JSON)
   - isActive

📋 WorkflowInstance
   - definitionId, entityType, entityId
   - currentStepId
   - status

📋 StepAssignment
   - workflowInstanceId, stepId
   - assignmentType (role/user/auto)
   - assignedRoleId, assignedUserId
   - status, deadline
```

---

### **2. MEVCUT KULLANIM ŞEKLİ:**

#### **❌ FRAGMENTED (Dağınık):**

```typescript
// 1️⃣ Menü Yetkileri (Role-based)
// src/server/data/role-menu.ts
const menus = await getMenusByUserRoles(userId);

// 2️⃣ Sayfa İçi Yetkiler (Custom logic)
// src/lib/permissions/finding-permissions.ts
export function canCreateAction(user, finding) {
  return isProcessOwner(user, finding) || isAdmin(user);
}

// 3️⃣ Workflow-based Yetkiler (Workflow engine'de)
// src/server/actions/action-actions.ts
if (action.status === 'PendingManagerApproval') {
  // Manager can approve
}

// 4️⃣ Permission Tablosu (UNUSED!)
// Hiç kullanılmıyor! 😱
```

---

## 🐛 **SORUNLAR**

### **1. FRAGMENTED LOGIC:**
```
❌ Menü yetkileri: RoleMenus table
❌ CRUD yetkileri: Custom functions (finding-permissions.ts)
❌ Workflow yetkileri: Workflow engine logic
❌ Permissions table: BOŞTA DURUYOR!
```

### **2. DRY VIOLATION:**
```typescript
// Her modül için ayrı permission file:
finding-permissions.ts → canCreateAction, canCreateDOF
audit-permissions.ts   → canCreateFinding (yok!)
dof-permissions.ts     → canApproveDOF (yok!)
action-permissions.ts  → canApproveAction (yok!)

// TEKRARLI KOD! 😱
```

### **3. WORKFLOW DISCONNECTED:**
```
Workflow engine → Kendi permission logic'i
Permission system → Workflow'dan habersiz
Finding permissions → Workflow'u bilmiyor
```

### **4. NO CONSTRAINT SUPPORT:**
```typescript
// Permissions table'da JSON constraints var AMA:
constraints: {"department": "own", "status": ["Active"]}

// Hiçbir yerde kullanılmıyor! 😱
```

---

## ✅ **UNIFIED SYSTEM ÖNERİSİ**

### **ARCHITECTURE:**

```
┌─────────────────────────────────────────────────────┐
│         UNIFIED PERMISSION CHECKER                  │
│                                                     │
│  Input: (user, resource, action, context)         │
│  Output: boolean (allowed/denied)                  │
└─────────────────────────────────────────────────────┘
                         ↓
        ┌────────────────┼────────────────┐
        │                │                │
   ┌────▼────┐     ┌────▼────┐     ┌────▼────┐
   │  ROLES  │     │WORKFLOW │     │CONSTRAINTS│
   │ PERMS   │     │ RULES   │     │  (JSON)   │
   └─────────┘     └─────────┘     └───────────┘
```

---

### **IMPLEMENTATION:**

```typescript
// src/lib/permissions/unified-permission-checker.ts

import { db } from "@/drizzle/db";
import { eq, and, or } from "drizzle-orm";
import {
  permissions,
  rolePermissions,
  userRoles,
  workflowInstances,
  stepAssignments,
} from "@/drizzle/schema";

/**
 * UNIFIED PERMISSION CHECKER
 * Single source of truth for ALL permissions
 */

export interface PermissionContext {
  user: {
    id: string;
    roles: Array<{ code: string }>;
  };
  resource: string; // "audit", "finding", "action", "dof"
  action: string; // "create", "read", "update", "delete", "approve", "reject"
  entity?: {
    id: string;
    ownerId?: string;
    assignedToId?: string;
    status?: string;
    departmentId?: string;
    workflowInstanceId?: string;
  };
}

export async function checkPermission(
  context: PermissionContext
): Promise<{
  allowed: boolean;
  reason?: string;
  source?: "role" | "workflow" | "ownership" | "admin";
}> {
  const { user, resource, action, entity } = context;

  // 1️⃣ ADMIN BYPASS (Super Admin)
  if (user.roles.some((r) => r.code === "SUPER_ADMIN")) {
    return { allowed: true, source: "admin" };
  }

  // 2️⃣ ROLE-BASED PERMISSIONS (From Permissions table)
  const rolePermission = await checkRolePermission(user, resource, action, entity);
  if (rolePermission.allowed) {
    return rolePermission;
  }

  // 3️⃣ WORKFLOW-BASED PERMISSIONS
  if (entity?.workflowInstanceId) {
    const workflowPermission = await checkWorkflowPermission(
      user,
      entity.workflowInstanceId,
      action
    );
    if (workflowPermission.allowed) {
      return workflowPermission;
    }
  }

  // 4️⃣ OWNERSHIP-BASED PERMISSIONS
  if (entity?.ownerId === user.id || entity?.assignedToId === user.id) {
    // Own records can be viewed/edited (with constraints)
    if (["read", "update"].includes(action)) {
      return { allowed: true, source: "ownership" };
    }
  }

  // ❌ DEFAULT: DENY
  return {
    allowed: false,
    reason: `User does not have permission: ${resource}.${action}`,
  };
}

/**
 * Check role-based permissions from Permissions table
 */
async function checkRolePermission(
  user: any,
  resource: string,
  action: string,
  entity?: any
): Promise<{ allowed: boolean; reason?: string; source?: string }> {
  // Get user's role IDs
  const userRoleIds = user.roles.map((r: any) => r.id);

  // Query: RolePermissions with constraints
  const rolePerms = await db
    .select({
      permissionCode: permissions.code,
      constraints: rolePermissions.constraints,
    })
    .from(rolePermissions)
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(
      and(
        eq(permissions.resource, resource),
        eq(permissions.action, action),
        // roleId in user's roles
      )
    );

  if (rolePerms.length === 0) {
    return { allowed: false };
  }

  // Check constraints (JSON)
  for (const perm of rolePerms) {
    if (!perm.constraints) {
      // No constraints → Allowed
      return { allowed: true, source: "role" };
    }

    // Evaluate constraints
    const constraints = perm.constraints as any;
    if (evaluateConstraints(constraints, entity, user)) {
      return { allowed: true, source: "role" };
    }
  }

  return { allowed: false, reason: "Constraints not satisfied" };
}

/**
 * Check workflow-based permissions
 */
async function checkWorkflowPermission(
  user: any,
  workflowInstanceId: string,
  action: string
): Promise<{ allowed: boolean; source?: string }> {
  // Get current step assignment
  const assignment = await db.query.stepAssignments.findFirst({
    where: and(
      eq(stepAssignments.workflowInstanceId, workflowInstanceId),
      eq(stepAssignments.status, "in_progress")
    ),
    with: {
      workflowInstance: true,
    },
  });

  if (!assignment) {
    return { allowed: false };
  }

  // Check if user is assigned to this step
  if (
    assignment.assignedUserId === user.id ||
    (assignment.assignedRoleId &&
      user.roles.some((r: any) => r.id === assignment.assignedRoleId))
  ) {
    // Workflow step actions
    if (["approve", "reject", "complete"].includes(action)) {
      return { allowed: true, source: "workflow" };
    }
  }

  return { allowed: false };
}

/**
 * Evaluate JSON constraints
 */
function evaluateConstraints(
  constraints: any,
  entity: any,
  user: any
): boolean {
  // Example constraints:
  // {"department": "own", "status": ["Active", "InProgress"]}

  // Department constraint
  if (constraints.department === "own") {
    if (entity?.departmentId !== user.departmentId) {
      return false;
    }
  }

  // Status constraint
  if (constraints.status && Array.isArray(constraints.status)) {
    if (!constraints.status.includes(entity?.status)) {
      return false;
    }
  }

  // Owner constraint
  if (constraints.owner === "self") {
    if (entity?.ownerId !== user.id) {
      return false;
    }
  }

  return true;
}

/**
 * SHORTHAND HELPERS (Backward compatible)
 */

export async function canCreate(user: any, resource: string, entity?: any) {
  const result = await checkPermission({
    user,
    resource,
    action: "create",
    entity,
  });
  return result.allowed;
}

export async function canRead(user: any, resource: string, entity?: any) {
  const result = await checkPermission({
    user,
    resource,
    action: "read",
    entity,
  });
  return result.allowed;
}

export async function canUpdate(user: any, resource: string, entity?: any) {
  const result = await checkPermission({
    user,
    resource,
    action: "update",
    entity,
  });
  return result.allowed;
}

export async function canDelete(user: any, resource: string, entity?: any) {
  const result = await checkPermission({
    user,
    resource,
    action: "delete",
    entity,
  });
  return result.allowed;
}

export async function canApprove(user: any, resource: string, entity?: any) {
  const result = await checkPermission({
    user,
    resource,
    action: "approve",
    entity,
  });
  return result.allowed;
}

export async function canReject(user: any, resource: string, entity?: any) {
  const result = await checkPermission({
    user,
    resource,
    action: "reject",
    entity,
  });
  return result.allowed;
}
```

---

### **USAGE EXAMPLES:**

#### **1. Menu Permissions (Same as before):**
```typescript
// Menu visibility still uses RoleMenus
const menus = await getMenusByUserRoles(userId);
```

#### **2. Page/Component Permissions (NEW):**
```typescript
// src/app/(main)/denetim/findings/[id]/page.tsx

import { checkPermission } from "@/lib/permissions/unified-permission-checker";

// Get current user
const session = await auth();
const user = session?.user;

// Check permission
const canCreateActionPerm = await checkPermission({
  user,
  resource: "action",
  action: "create",
  entity: {
    id: finding.id,
    ownerId: finding.createdById,
    assignedToId: finding.assignedToId,
    workflowInstanceId: finding.workflowInstanceId,
  },
});

return (
  <div>
    {canCreateActionPerm.allowed && (
      <Button>Create Action</Button>
    )}
  </div>
);
```

#### **3. Server Actions (NEW):**
```typescript
// src/server/actions/action-actions.ts

import { checkPermission } from "@/lib/permissions/unified-permission-checker";

export async function createAction(data: any) {
  return withAuth(async (user) => {
    // Check permission
    const perm = await checkPermission({
      user,
      resource: "action",
      action: "create",
      entity: { id: data.findingId },
    });

    if (!perm.allowed) {
      return createPermissionError(perm.reason);
    }

    // Create action...
  });
}
```

#### **4. Workflow Integration:**
```typescript
// Workflow step'de approval
const perm = await checkPermission({
  user,
  resource: "action",
  action: "approve",
  entity: {
    id: action.id,
    workflowInstanceId: action.workflowInstanceId,
    status: action.status,
  },
});

// Workflow engine otomatik çözecek:
// - Current step'de mi?
// - Assigned user mı?
// - Role match mi?
```

---

## 📋 **MIGRATION PLAN**

### **Phase 1: Infrastructure (1-2 days)**
```
✅ Create unified-permission-checker.ts
✅ Populate Permissions table (seed)
✅ Create permission seed with constraints
✅ Write unit tests
```

### **Phase 2: Integration (2-3 days)**
```
✅ Update finding-permissions.ts → Use unified
✅ Update action-actions.ts → Use unified
✅ Update finding-actions.ts → Use unified
✅ Update dof-actions.ts → Use unified
✅ Update audit-actions.ts → Use unified
```

### **Phase 3: Workflow Integration (2 days)**
```
✅ Workflow engine → Call checkPermission
✅ StepAssignment → Permission validation
✅ Timeline → Permission audit trail
```

### **Phase 4: UI Integration (1 day)**
```
✅ Finding detail page → checkPermission
✅ Action forms → checkPermission
✅ DOF forms → checkPermission
✅ Audit pages → checkPermission
```

### **Phase 5: Cleanup (1 day)**
```
✅ Remove custom permission functions
✅ Deprecate finding-permissions.ts
✅ Update documentation
✅ Add permission admin UI
```

**TOTAL:** ~7-10 days

---

## 🎯 **BENEFITS**

### **1. UNIFIED:**
```
✅ Single source of truth
✅ Consistent logic across app
✅ No fragmented checks
```

### **2. DRY:**
```
✅ One function for all permissions
✅ No duplicate code
✅ Easy to maintain
```

### **3. SOLID:**
```
✅ Single Responsibility (permission checker)
✅ Open/Closed (constraints extensible)
✅ Dependency Inversion (depends on abstraction)
```

### **4. WORKFLOW-INTEGRATED:**
```
✅ Workflow steps → Auto-check permissions
✅ Role assignments → Permission validation
✅ Audit trail → Permission history
```

### **5. CONSTRAINT-BASED:**
```
✅ JSON constraints (flexible)
✅ Department-level permissions
✅ Status-based permissions
✅ Owner-based permissions
```

### **6. TESTABLE:**
```
✅ Unit testable (pure function)
✅ Mock-able (database calls isolated)
✅ Integration tests easy
```

---

## 🚀 **NEXT STEPS**

### **KARAR:**
```
1. Bu unified system'i implement edelim mi?
2. Önce prototype yapalım test edelim mi?
3. Başka bir approach düşünüyor musun?
```

### **EĞER ONAYLARSAN:**
```
1. unified-permission-checker.ts oluşturacağım
2. Permission seed'i ekleyeceğim
3. Bir modül üzerinde test edeceğiz (Finding?)
4. Workflow integration yapacağız
5. Tüm sistem'e yayacağız
```

---

**Status:** 📋 **PROPOSAL - WAITING FOR APPROVAL**  
**Priority:** 🔥 **HIGH - Architecture Decision**  
**Impact:** 🎯 **ENTIRE APPLICATION**
