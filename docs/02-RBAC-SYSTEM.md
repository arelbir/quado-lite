# RBAC Sistemi - Detaylı Analiz

**Tarih:** 2025-01-07  
**Dosya:** `src/lib/permissions/unified-permission-checker.ts`

---

## 🔐 4-Katmanlı Permission Model

### Akış Diyagramı

```
USER REQUEST
    ↓
withAuth() wrapper
    ↓
checkPermission({user, resource, action, entity})
    ↓
┌───────────────────────────────────────────┐
│ 1️⃣ ADMIN BYPASS                          │
│   SUPER_ADMIN or ADMIN?                   │
│   YES → ✅ ALLOW                          │
│   NO  → Next layer                        │
└───────────────────────────────────────────┘
    ↓
┌───────────────────────────────────────────┐
│ 2️⃣ ROLE-BASED PERMISSIONS                │
│   - Query RolePermissions table           │
│   - Check resource.action match           │
│   - Evaluate JSON constraints             │
│   MATCH → ✅ ALLOW                        │
│   NO    → Next layer                      │
└───────────────────────────────────────────┘
    ↓
┌───────────────────────────────────────────┐
│ 3️⃣ WORKFLOW-BASED PERMISSIONS            │
│   - Check WorkflowInstance                │
│   - Check StepAssignments                 │
│   - Verify assigned user/role             │
│   ASSIGNED → ✅ ALLOW                     │
│   NO       → Next layer                   │
└───────────────────────────────────────────┘
    ↓
┌───────────────────────────────────────────┐
│ 4️⃣ OWNERSHIP-BASED PERMISSIONS           │
│   - Check createdById                     │
│   - Check assignedToId                    │
│   - Check managerId                       │
│   OWNER → ✅ ALLOW (read, update only)   │
│   NO    → ❌ DENY                         │
└───────────────────────────────────────────┘
```

---

## 📝 Core Types

### PermissionContext

```typescript
interface PermissionContext {
  user: PermissionUser;      // Kullanıcı + roller
  resource: string;           // "audit", "finding", "action", "dof", "user"
  action: string;             // "create", "read", "update", "delete", 
                              // "approve", "reject", "submit", "cancel"
  entity?: PermissionEntity;  // İşlem yapılacak kayıt (optional)
}
```

### PermissionUser

```typescript
interface PermissionUser {
  id: string;
  email?: string | null;
  userRoles?: Array<{
    role: {
      id: string;
      code: string;        // "ADMIN", "AUDITOR", "PROCESS_OWNER"
      name: string;
    };
  }>;
}
```

### PermissionEntity

```typescript
interface PermissionEntity {
  id: string;
  createdById?: string | null;     // Oluşturan
  assignedToId?: string | null;    // Atanan
  managerId?: string | null;       // Onaylayan
  status?: string;                 // Mevcut durum
  departmentId?: string | null;    // Departman
  workflowInstanceId?: string | null; // Workflow
}
```

### PermissionResult

```typescript
interface PermissionResult {
  allowed: boolean;           // İzin var mı?
  reason?: string;            // Red nedeni (allowed=false ise)
  source?: "admin"            // Yönetici bypass
         | "role"             // Rol tabanlı
         | "workflow"         // Workflow tabanlı
         | "ownership"        // Sahiplik tabanlı
         | "denied";          // Reddedildi
}
```

---

## 1️⃣ Admin Bypass Layer

### Kural

**Super Admin ve Admin rolleri her şeye izinlidir.**

### Kod

```typescript
function isAdmin(user: PermissionUser): boolean {
  return (
    user.userRoles?.some(
      (ur) =>
        ur.role?.code === "SUPER_ADMIN" || ur.role?.code === "ADMIN"
    ) ?? false
  );
}

// Main check
if (isAdmin(userWithRoles)) {
  return {
    allowed: true,
    source: "admin",
  };
}
```

### Roller

- **SUPER_ADMIN**: Sistem yöneticisi, her şey izinli
- **ADMIN**: İşletme yöneticisi, her şey izinli

### Use Cases

✅ Admin kullanıcı herhangi bir audit'i silebilir  
✅ Admin kullanıcı başkasının DOF'ünü güncelleyebilir  
✅ Admin kullanıcı herhangi bir finding'i kapatabilir

---

## 2️⃣ Role-Based Permissions Layer

### Database Schema

#### Permissions Table

```sql
CREATE TABLE "Permissions" (
  id          UUID PRIMARY KEY,
  resource    TEXT NOT NULL,      -- "audit", "finding", "action", "dof"
  action      TEXT NOT NULL,      -- "create", "read", "update", "delete"
  description TEXT,
  code        TEXT UNIQUE,        -- "audit.create", "finding.update"
  UNIQUE(resource, action)
);
```

#### RolePermissions Table

```sql
CREATE TABLE "RolePermissions" (
  id            UUID PRIMARY KEY,
  role_id       UUID REFERENCES "Roles"(id),
  permission_id UUID REFERENCES "Permissions"(id),
  constraints   JSONB,            -- JSON constraints
  UNIQUE(role_id, permission_id)
);
```

### JSON Constraints

#### Format

```json
{
  "department": "own" | "any",
  "status": ["Active", "InProgress", ...],
  "owner": "self" | "any",
  "assigned": "self" | "any"
}
```

#### Örnekler

**Örnek 1: Sadece kendi departmanındaki bulguları görüntüleme**

```json
{
  "department": "own"
}
```

**Örnek 2: Sadece Active ve InProgress aksiyonları güncelleme**

```json
{
  "status": ["Assigned", "PendingManagerApproval"]
}
```

**Örnek 3: Sadece kendine atanan bulguları düzenleme**

```json
{
  "assigned": "self"
}
```

**Örnek 4: Kombinasyon - Kendi departmanında kendine atanan aktif kaydı güncelleme**

```json
{
  "department": "own",
  "assigned": "self",
  "status": ["Active", "InProgress"]
}
```

### Constraint Evaluation

```typescript
function evaluateConstraints(
  constraints: Record<string, any>,
  entity: PermissionEntity | undefined,
  user: PermissionUser
): boolean {
  // Boş constraints → her zaman allow
  if (!constraints || Object.keys(constraints).length === 0) {
    return true;
  }

  // Department constraint
  if (constraints.department === "own") {
    if (!entity?.departmentId || entity.departmentId !== (user as any).departmentId) {
      return false;
    }
  }

  // Status constraint
  if (constraints.status && Array.isArray(constraints.status)) {
    if (!entity?.status || !constraints.status.includes(entity.status)) {
      return false;
    }
  }

  // Owner constraint
  if (constraints.owner === "self") {
    if (!entity?.createdById || entity.createdById !== user.id) {
      return false;
    }
  }

  // Assigned constraint
  if (constraints.assigned === "self") {
    if (!entity?.assignedToId || entity.assignedToId !== user.id) {
      return false;
    }
  }

  return true;
}
```

### Query

```typescript
async function checkRolePermission(
  user: PermissionUser,
  resource: string,
  action: string,
  entity?: PermissionEntity
): Promise<PermissionResult> {
  // Get user's role IDs
  const userRoleIds = user.userRoles?.map((ur) => ur.role.id) ?? [];

  if (userRoleIds.length === 0) {
    return { allowed: false, source: "denied" };
  }

  // Query: RolePermissions JOIN Permissions
  const rolePerms = await db
    .select({
      permissionCode: permissions.code,
      permissionResource: permissions.resource,
      permissionAction: permissions.action,
      constraints: rolePermissions.constraints,
    })
    .from(rolePermissions)
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(
      and(
        eq(permissions.resource, resource),
        eq(permissions.action, action),
        inArray(rolePermissions.roleId, userRoleIds)
      )
    );

  if (rolePerms.length === 0) {
    return { allowed: false, source: "denied" };
  }

  // Check constraints
  for (const perm of rolePerms) {
    if (!perm.constraints) {
      // No constraints → Allowed
      return {
        allowed: true,
        source: "role",
      };
    }

    // Evaluate constraints
    const constraints = perm.constraints as any;
    if (evaluateConstraints(constraints, entity, user)) {
      return {
        allowed: true,
        source: "role",
      };
    }
  }

  return {
    allowed: false,
    reason: "Permission constraints not satisfied",
    source: "denied",
  };
}
```

### 31 Permissions (Seed Data)

#### Finding Module (5 permissions)

```typescript
{
  resource: "finding",
  action: "create",
  code: "finding.create",
  description: "Create new findings"
},
{
  resource: "finding",
  action: "read",
  code: "finding.read",
  description: "View findings"
},
{
  resource: "finding",
  action: "update",
  code: "finding.update",
  description: "Update findings"
},
{
  resource: "finding",
  action: "submit",
  code: "finding.submit",
  description: "Submit finding for closure"
},
{
  resource: "finding",
  action: "approve",
  code: "finding.approve",
  description: "Approve/reject finding closure"
}
```

#### Action Module (6 permissions)

```typescript
{
  resource: "action",
  action: "create",
  code: "action.create",
  description: "Create new actions"
},
{
  resource: "action",
  action: "read",
  code: "action.read",
  description: "View actions"
},
{
  resource: "action",
  action: "update",
  code: "action.update",
  description: "Update actions"
},
{
  resource: "action",
  action: "complete",
  code: "action.complete",
  description: "Complete actions"
},
{
  resource: "action",
  action: "approve",
  code: "action.approve",
  description: "Approve/reject completed actions"
},
{
  resource: "action",
  action: "cancel",
  code: "action.cancel",
  description: "Cancel actions"
}
```

#### DOF Module (6 permissions)

```typescript
{
  resource: "dof",
  action: "create",
  code: "dof.create",
  description: "Create new DOFs"
},
{
  resource: "dof",
  action: "read",
  code: "dof.read",
  description: "View DOFs"
},
{
  resource: "dof",
  action: "update",
  code: "dof.update",
  description: "Update DOF steps"
},
{
  resource: "dof",
  action: "submit",
  code: "dof.submit",
  description: "Submit DOF for approval"
},
{
  resource: "dof",
  action: "approve",
  code: "dof.approve",
  description: "Approve DOF"
},
{
  resource: "dof",
  action: "reject",
  code: "dof.reject",
  description: "Reject DOF"
}
```

#### Audit Module (8 permissions)

```typescript
// audit.create, audit.read, audit.update, audit.complete
// audit.close, audit.archive, audit.reactivate, audit.delete
```

#### User Module (6 permissions)

```typescript
// user.create, user.read, user.update, user.delete
// user.assignRole, user.removeRole
```

---

## 3️⃣ Workflow-Based Permissions Layer

### Kural

**Workflow'da bir adıma atanan kullanıcı/rol, o adımı gerçekleştirebilir.**

### Database Schema

#### WorkflowInstances

```sql
CREATE TABLE "WorkflowInstances" (
  id                     UUID PRIMARY KEY,
  workflow_definition_id UUID REFERENCES "WorkflowDefinitions"(id),
  entity_type            TEXT,           -- "Action", "DOF", "Audit"
  entity_id              UUID,           -- İlgili entity ID
  current_step           TEXT,
  status                 TEXT,           -- "in_progress", "completed", "cancelled"
  metadata               JSONB
);
```

#### StepAssignments

```sql
CREATE TABLE "StepAssignments" (
  id                   UUID PRIMARY KEY,
  workflow_instance_id UUID REFERENCES "WorkflowInstances"(id),
  step_id              TEXT,
  assigned_user_id     UUID REFERENCES "User"(id),    -- Kullanıcıya atandıysa
  assigned_role        TEXT,                          -- Role'e atandıysa
  status               TEXT,           -- "pending", "in_progress", "completed"
  deadline             TIMESTAMP,
  completed_at         TIMESTAMP
);
```

### Query

```typescript
async function checkWorkflowPermission(
  user: PermissionUser,
  workflowInstanceId: string,
  action: string
): Promise<PermissionResult> {
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
    return { allowed: false, source: "denied" };
  }

  // Check if user is assigned to this step
  const isAssignedUser = assignment.assignedUserId === user.id;
  const isAssignedRole =
    assignment.assignedRole &&
    user.userRoles?.some((ur) => ur.role.code === assignment.assignedRole);

  if (isAssignedUser || isAssignedRole) {
    // Workflow step actions
    if (["approve", "reject", "complete", "submit", "update"].includes(action)) {
      return {
        allowed: true,
        source: "workflow",
      };
    }
  }

  return { allowed: false, source: "denied" };
}
```

### Workflow Actions

**İzin verilen aksiyonlar:**
- `approve` - Onaylama
- `reject` - Reddetme
- `complete` - Tamamlama
- `submit` - Gönderme
- `update` - Güncelleme

### Use Cases

**Örnek 1: Action Manager Approval**

```
1. Action oluşturulur (status: "Assigned")
2. Workflow başlar: "Action Complex Flow"
3. Step 1: "Complete" → Assigned user'a atanır
4. Assigned user tamamlar → checkPermission()
   - workflow-based: ✅ isAssignedUser = true
5. Step 2: "Manager Approval" → Manager'a atanır
6. Manager onayla/reddet → checkPermission()
   - workflow-based: ✅ isAssignedUser = true
```

**Örnek 2: DOF 8-Step Flow**

```
1. DOF oluşturulur (status: "Step1_Problem")
2. Workflow başlar: "DOF Standard CAPA Flow"
3. Step 1-6: Assigned user'a atanır
4. Assigned user her step'i tamamlar
   - workflow-based: ✅ isAssignedUser = true
5. Step 7: Manager'a atanır
6. Manager onayla/reddet
   - workflow-based: ✅ isAssignedUser = true
```

---

## 4️⃣ Ownership-Based Permissions Layer

### Kural

**Bir kaydın sahibi (creator/assigned), o kaydı görüntüleyebilir ve güncelleyebilir.**

### Kod

```typescript
function checkOwnershipPermission(
  user: PermissionUser,
  action: string,
  entity?: PermissionEntity
): PermissionResult {
  if (!entity) {
    return { allowed: false, source: "denied" };
  }

  // Owner can view and edit their own records
  const isOwner = entity.createdById === user.id;
  const isAssigned = entity.assignedToId === user.id;

  if (isOwner || isAssigned) {
    if (["read", "update"].includes(action)) {
      return {
        allowed: true,
        source: "ownership",
      };
    }
  }

  return { allowed: false, source: "denied" };
}
```

### İzinler

**Sahip (createdById) veya Atanan (assignedToId):**
- ✅ `read` - Görüntüleme
- ✅ `update` - Güncelleme
- ❌ `delete` - Silme (izinsiz)
- ❌ `approve` - Onaylama (izinsiz)

### Use Cases

**Örnek 1: Kendi oluşturduğu finding'i görme**

```typescript
// User: process-owner-1
// Finding: createdById = "process-owner-1"

const result = await checkPermission({
  user: processOwner,
  resource: "finding",
  action: "read",
  entity: finding,
});

// Result: { allowed: true, source: "ownership" }
```

**Örnek 2: Kendine atanan action'ı güncelleme**

```typescript
// User: engineer-1
// Action: assignedToId = "engineer-1"

const result = await checkPermission({
  user: engineer,
  resource: "action",
  action: "update",
  entity: action,
});

// Result: { allowed: true, source: "ownership" }
```

---

## 🔧 Helper Functions

### Shorthand Helpers

```typescript
// Create
export async function canCreate(
  user: PermissionUser,
  resource: string,
  entity?: PermissionEntity
): Promise<boolean>

// Read
export async function canRead(
  user: PermissionUser,
  resource: string,
  entity?: PermissionEntity
): Promise<boolean>

// Update
export async function canUpdate(
  user: PermissionUser,
  resource: string,
  entity?: PermissionEntity
): Promise<boolean>

// Delete
export async function canDelete(
  user: PermissionUser,
  resource: string,
  entity?: PermissionEntity
): Promise<boolean>

// Approve
export async function canApprove(
  user: PermissionUser,
  resource: string,
  entity?: PermissionEntity
): Promise<boolean>

// Reject
export async function canReject(
  user: PermissionUser,
  resource: string,
  entity?: PermissionEntity
): Promise<boolean>

// Submit
export async function canSubmit(
  user: PermissionUser,
  resource: string,
  entity?: PermissionEntity
): Promise<boolean>

// Cancel
export async function canCancel(
  user: PermissionUser,
  resource: string,
  entity?: PermissionEntity
): Promise<boolean>
```

### Batch Check

```typescript
export async function checkMultiplePermissions(
  user: PermissionUser,
  checks: Array<{
    resource: string;
    action: string;
    entity?: PermissionEntity;
  }>
): Promise<Record<string, boolean>>
```

**Örnek:**

```typescript
const permissions = await checkMultiplePermissions(user, [
  { resource: "finding", action: "create" },
  { resource: "action", action: "update", entity: action },
  { resource: "dof", action: "approve", entity: dof },
]);

// Result:
// {
//   "finding.create": true,
//   "action.update": false,
//   "dof.approve": true
// }
```

### Entity Permissions

```typescript
export async function getUserPermissionsForEntity(
  user: PermissionUser,
  resource: string,
  entity?: PermissionEntity
): Promise<{
  canCreate: boolean;
  canRead: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canApprove: boolean;
  canReject: boolean;
  canSubmit: boolean;
  canCancel: boolean;
}>
```

**Kullanım (UI'da button gösterme/gizleme):**

```typescript
const permissions = await getUserPermissionsForEntity(
  user,
  "action",
  action
);

// UI
{permissions.canApprove && (
  <Button onClick={handleApprove}>Onayla</Button>
)}

{permissions.canReject && (
  <Button onClick={handleReject}>Reddet</Button>
)}
```

---

## 📚 Integration Examples

### Server Action'da Kullanım

```typescript
// src/server/actions/action-actions.ts

export async function completeAction(
  actionId: string,
  completionNotes: string
): Promise<ActionResponse> {
  return withAuth(async (user: User) => {
    // 1. Entity fetch
    const action = await db.query.actions.findFirst({
      where: eq(actions.id, actionId),
    });

    if (!action) {
      return createNotFoundError("Action");
    }

    // 2. Permission check
    const perm = await checkPermission({
      user: user as any,
      resource: "action",
      action: "complete",
      entity: {
        id: action.id,
        assignedToId: action.assignedToId,
        createdById: action.createdById,
        status: action.status,
        workflowInstanceId: action.workflowInstanceId,
      },
    });

    if (!perm.allowed) {
      return createPermissionError(
        perm.reason || "You cannot complete this action"
      );
    }

    // 3. Business logic
    await db
      .update(actions)
      .set({
        status: "PendingManagerApproval",
        completionNotes,
        completedAt: new Date(),
      })
      .where(eq(actions.id, actionId));

    return { success: true };
  });
}
```

### Finding Module Integration

```typescript
// src/lib/permissions/finding-permissions.ts

export async function canCreateAction(
  user: User,
  finding: Finding
): Promise<boolean> {
  const result = await checkPermission({
    user: user as PermissionUser,
    resource: "action",
    action: "create",
    entity: {
      id: finding.id,
      assignedToId: finding.assignedToId,
      createdById: finding.createdById,
      status: finding.status,
    } as PermissionEntity,
  });
  return result.allowed;
}

export async function getFindingPermissions(user: User, finding: Finding) {
  const [
    canViewResult,
    canEditResult,
    canCloseResult,
    canCreateActionResult,
    canCreateDOFResult,
  ] = await Promise.all([
    canViewFinding(user, finding),
    canEditFinding(user, finding),
    canCloseFinding(user, finding),
    canCreateAction(user, finding),
    canCreateDOF(user, finding),
  ]);

  return {
    canView: canViewResult,
    canEdit: canEditResult,
    canClose: canCloseResult,
    canCreateAction: canCreateActionResult,
    canCreateDOF: canCreateDOFResult,
  };
}
```

---

## ✅ Sonraki: Workflow Engine

Şimdi workflow engine'in nasıl çalıştığını inceleyelim → `03-WORKFLOW-ENGINE.md`
