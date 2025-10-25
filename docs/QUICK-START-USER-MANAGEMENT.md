# 🚀 QUICK START - ENTERPRISE USER MANAGEMENT

## 📋 Bu Doküman: Hemen Başlamak İçin

**3 haftalık MVP ile başlayalım!**

---

## 🎯 PHASE 1: QUICK WIN (2-3 Hafta)

### **Week 1: Organization Structure**

#### **Step 1: Database Migration**

```typescript
// drizzle/schema/department.ts
import { pgTable, uuid, varchar, timestamp, foreignKey } from "drizzle-orm/pg-core";
import { user } from "./user";
import { relations } from "drizzle-orm";

export const departments = pgTable("Department", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  description: varchar("description", { length: 500 }),
  
  // Hierarchy
  parentDepartmentId: uuid("parentDepartmentId"), // Self-reference for nested depts
  managerId: uuid("managerId"),
  
  // Future: Branch support
  branchId: uuid("branchId"),
  
  // Metadata
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt"),
  deletedAt: timestamp("deletedAt"),
},
(table) => ({
  managerFkey: foreignKey({
    columns: [table.managerId],
    foreignColumns: [user.id],
    name: "Department_managerId_fkey"
  }).onDelete("set null"),
  parentFkey: foreignKey({
    columns: [table.parentDepartmentId],
    foreignColumns: [table.id],
    name: "Department_parentId_fkey"
  }).onDelete("set null"),
}));

export const departmentRelations = relations(departments, ({ one, many }) => ({
  manager: one(user, {
    fields: [departments.managerId],
    references: [user.id],
    relationName: 'department_manager',
  }),
  parent: one(departments, {
    fields: [departments.parentDepartmentId],
    references: [departments.id],
    relationName: 'department_parent',
  }),
  children: many(departments, {
    relationName: 'department_parent',
  }),
  users: many(user, {
    relationName: 'user_department',
  }),
}));

export type Department = typeof departments.$inferSelect;
export type NewDepartment = typeof departments.$inferInsert;
```

#### **Step 2: Update User Table**

```typescript
// drizzle/schema/user.ts (ADD THESE FIELDS)
export const user = pgTable("User", {
  // ... existing fields
  
  // 🔥 NEW: Organization fields
  departmentId: uuid("departmentId"),
  managerId: uuid("managerId"), // Direct manager
  employeeNumber: varchar("employeeNumber", { length: 50 }).unique(),
  
  // ... rest of fields
},
(table) => ({
  // ... existing constraints
  
  // 🔥 NEW: Foreign keys
  departmentFkey: foreignKey({
    columns: [table.departmentId],
    foreignColumns: [departments.id],
    name: "User_departmentId_fkey"
  }).onDelete("set null"),
  managerFkey: foreignKey({
    columns: [table.managerId],
    foreignColumns: [table.id],
    name: "User_managerId_fkey"
  }).onDelete("set null"),
}));

// 🔥 NEW: Add to userRelation
export const userRelation = relations(user, ({ one, many }) => ({
  // ... existing relations
  
  department: one(departments, {
    fields: [user.departmentId],
    references: [departments.id],
    relationName: 'user_department',
  }),
  manager: one(user, {
    fields: [user.managerId],
    references: [user.id],
    relationName: 'user_manager',
  }),
  directReports: many(user, {
    relationName: 'user_manager', // Users reporting to this user
  }),
}));
```

#### **Step 3: Seed Initial Departments**

```typescript
// drizzle/seed-departments.ts
import { db } from "@/server/db";
import { departments } from "@/drizzle/schema/department";

const initialDepartments = [
  { name: "Kalite Yönetimi", code: "QUALITY", description: "Kalite güvence ve denetim" },
  { name: "Üretim", code: "PRODUCTION", description: "Üretim operasyonları" },
  { name: "AR-GE", code: "RND", description: "Araştırma ve Geliştirme" },
  { name: "Satış", code: "SALES", description: "Satış ve pazarlama" },
  { name: "İnsan Kaynakları", code: "HR", description: "İK operasyonları" },
  { name: "Finans", code: "FINANCE", description: "Finans ve muhasebe" },
  { name: "IT", code: "IT", description: "Bilgi teknolojileri" },
];

export async function seedDepartments() {
  console.log("🌱 Seeding departments...");
  
  for (const dept of initialDepartments) {
    await db.insert(departments).values(dept).onConflictDoNothing();
  }
  
  console.log("✅ Departments seeded!");
}

// Run: tsx drizzle/seed-departments.ts
```

---

### **Week 2: Multi-Role System**

#### **Step 1: Create Roles Table (Decoupled)**

```typescript
// drizzle/schema/role-system.ts
import { pgTable, uuid, varchar, text, timestamp, boolean, json } from "drizzle-orm/pg-core";
import { pgEnum } from "drizzle-orm/pg-core";
import { user } from "./user";
import { relations } from "drizzle-orm";

// Enums
export const roleCategory = pgEnum("RoleCategory", ['System', 'Functional', 'Project', 'Custom']);
export const roleScope = pgEnum("RoleScope", ['Global', 'Company', 'Branch', 'Department']);
export const contextType = pgEnum("ContextType", ['Global', 'Company', 'Branch', 'Department', 'Project']);

// Roles Table
export const roles = pgTable("Role", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  description: text("description"),
  
  category: roleCategory("category").default('Custom'),
  scope: roleScope("scope").default('Global'),
  
  isSystem: boolean("isSystem").default(false), // Protected system roles
  isActive: boolean("isActive").default(true),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt"),
  createdById: uuid("createdById"),
});

// User-Role Junction (Many-to-Many with context)
export const userRoles = pgTable("UserRole", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  userId: uuid("userId").notNull(),
  roleId: uuid("roleId").notNull(),
  
  // Context (where this role applies)
  contextType: contextType("contextType").default('Global'),
  contextId: uuid("contextId"), // Department ID, Project ID, etc.
  
  // Time-based roles (optional)
  validFrom: timestamp("validFrom"),
  validTo: timestamp("validTo"),
  
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  assignedBy: uuid("assignedBy"),
},
(table) => ({
  userFkey: foreignKey({
    columns: [table.userId],
    foreignColumns: [user.id],
    name: "UserRole_userId_fkey"
  }).onDelete("cascade"),
  roleFkey: foreignKey({
    columns: [table.roleId],
    foreignColumns: [roles.id],
    name: "UserRole_roleId_fkey"
  }).onDelete("cascade"),
}));

// Permissions Table
export const permissions = pgTable("Permission", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  code: varchar("code", { length: 100 }).notNull().unique(), // e.g., "audit.create"
  description: text("description"),
  
  resource: varchar("resource", { length: 50 }).notNull(), // Audit, Finding, Action, DOF, User
  action: varchar("action", { length: 50 }).notNull(), // Create, Read, Update, Delete, Approve
  
  category: varchar("category", { length: 50 }), // Group permissions
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Role-Permission Junction
export const rolePermissions = pgTable("RolePermission", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  roleId: uuid("roleId").notNull(),
  permissionId: uuid("permissionId").notNull(),
  
  // Optional: Constraints (JSON)
  // e.g., {"department": "own", "status": ["Active", "InProgress"]}
  constraints: json("constraints"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
},
(table) => ({
  roleFkey: foreignKey({
    columns: [table.roleId],
    foreignColumns: [roles.id],
    name: "RolePermission_roleId_fkey"
  }).onDelete("cascade"),
  permissionFkey: foreignKey({
    columns: [table.permissionId],
    foreignColumns: [permissions.id],
    name: "RolePermission_permissionId_fkey"
  }).onDelete("cascade"),
}));

// Relations
export const roleRelations = relations(roles, ({ many }) => ({
  userRoles: many(userRoles),
  permissions: many(rolePermissions),
}));

export const userRoleRelations = relations(userRoles, ({ one }) => ({
  user: one(user, {
    fields: [userRoles.userId],
    references: [user.id],
  }),
  role: one(roles, {
    fields: [userRoles.roleId],
    references: [roles.id],
  }),
}));

export const permissionRelations = relations(permissions, ({ many }) => ({
  roles: many(rolePermissions),
}));

export const rolePermissionRelations = relations(rolePermissions, ({ one }) => ({
  role: one(roles, {
    fields: [rolePermissions.roleId],
    references: [roles.id],
  }),
  permission: one(permissions, {
    fields: [rolePermissions.permissionId],
    references: [permissions.id],
  }),
}));

// Types
export type Role = typeof roles.$inferSelect;
export type UserRole = typeof userRoles.$inferSelect;
export type Permission = typeof permissions.$inferSelect;
export type RolePermission = typeof rolePermissions.$inferSelect;
```

#### **Step 2: Seed Default Roles & Permissions**

```typescript
// drizzle/seed-roles-permissions.ts
import { db } from "@/server/db";
import { roles, permissions, rolePermissions } from "@/drizzle/schema/role-system";

const SYSTEM_ROLES = [
  {
    name: "Super Admin",
    code: "SUPER_ADMIN",
    description: "Full system access",
    category: "System",
    scope: "Global",
    isSystem: true,
  },
  {
    name: "Admin",
    code: "ADMIN",
    description: "Company-wide admin",
    category: "System",
    scope: "Company",
    isSystem: true,
  },
  {
    name: "Quality Manager",
    code: "QUALITY_MANAGER",
    description: "Manage audits, approve findings and DOFs",
    category: "Functional",
    scope: "Department",
    isSystem: false,
  },
  {
    name: "Auditor",
    code: "AUDITOR",
    description: "Conduct audits, create findings",
    category: "Functional",
    scope: "Global",
    isSystem: false,
  },
  {
    name: "Process Owner",
    code: "PROCESS_OWNER",
    description: "Manage actions, close findings",
    category: "Functional",
    scope: "Department",
    isSystem: false,
  },
  {
    name: "User",
    code: "USER",
    description: "Basic user access",
    category: "System",
    scope: "Global",
    isSystem: true,
  },
];

const PERMISSIONS = [
  // Audit permissions
  { code: "audit.create", resource: "Audit", action: "Create", category: "Audit" },
  { code: "audit.read", resource: "Audit", action: "Read", category: "Audit" },
  { code: "audit.update", resource: "Audit", action: "Update", category: "Audit" },
  { code: "audit.delete", resource: "Audit", action: "Delete", category: "Audit" },
  { code: "audit.approve", resource: "Audit", action: "Approve", category: "Audit" },
  
  // Finding permissions
  { code: "finding.create", resource: "Finding", action: "Create", category: "Finding" },
  { code: "finding.read", resource: "Finding", action: "Read", category: "Finding" },
  { code: "finding.update", resource: "Finding", action: "Update", category: "Finding" },
  { code: "finding.close", resource: "Finding", action: "Close", category: "Finding" },
  { code: "finding.approve", resource: "Finding", action: "Approve", category: "Finding" },
  
  // Action permissions
  { code: "action.create", resource: "Action", action: "Create", category: "Action" },
  { code: "action.read", resource: "Action", action: "Read", category: "Action" },
  { code: "action.complete", resource: "Action", action: "Complete", category: "Action" },
  { code: "action.approve", resource: "Action", action: "Approve", category: "Action" },
  
  // DOF permissions
  { code: "dof.create", resource: "DOF", action: "Create", category: "DOF" },
  { code: "dof.read", resource: "DOF", action: "Read", category: "DOF" },
  { code: "dof.update", resource: "DOF", action: "Update", category: "DOF" },
  { code: "dof.approve", resource: "DOF", action: "Approve", category: "DOF" },
  
  // User permissions
  { code: "user.create", resource: "User", action: "Create", category: "User" },
  { code: "user.read", resource: "User", action: "Read", category: "User" },
  { code: "user.update", resource: "User", action: "Update", category: "User" },
  { code: "user.delete", resource: "User", action: "Delete", category: "User" },
  
  // Department permissions
  { code: "department.manage", resource: "Department", action: "Manage", category: "Admin" },
];

const ROLE_PERMISSION_MAPPINGS = {
  SUPER_ADMIN: "all", // All permissions
  ADMIN: [
    "audit.create", "audit.read", "audit.update", "audit.delete",
    "finding.read", "finding.update",
    "action.read",
    "dof.read",
    "user.create", "user.read", "user.update", "user.delete",
    "department.manage",
  ],
  QUALITY_MANAGER: [
    "audit.create", "audit.read", "audit.update", "audit.approve",
    "finding.read", "finding.approve", "finding.close",
    "action.read", "action.approve",
    "dof.read", "dof.approve",
  ],
  AUDITOR: [
    "audit.create", "audit.read", "audit.update",
    "finding.create", "finding.read", "finding.update",
  ],
  PROCESS_OWNER: [
    "finding.read", "finding.close",
    "action.create", "action.read", "action.complete", "action.approve",
    "dof.create", "dof.read", "dof.update",
  ],
  USER: [
    "audit.read",
    "finding.read",
    "action.read",
    "dof.read",
  ],
};

export async function seedRolesAndPermissions() {
  console.log("🌱 Seeding roles and permissions...");
  
  // 1. Create permissions
  const createdPermissions = new Map();
  for (const perm of PERMISSIONS) {
    const [created] = await db.insert(permissions)
      .values({
        name: `${perm.resource} - ${perm.action}`,
        code: perm.code,
        resource: perm.resource,
        action: perm.action,
        category: perm.category,
      })
      .returning()
      .onConflictDoNothing();
    
    if (created) {
      createdPermissions.set(perm.code, created.id);
    }
  }
  
  // 2. Create roles
  const createdRoles = new Map();
  for (const role of SYSTEM_ROLES) {
    const [created] = await db.insert(roles)
      .values(role)
      .returning()
      .onConflictDoNothing();
    
    if (created) {
      createdRoles.set(role.code, created.id);
    }
  }
  
  // 3. Map roles to permissions
  for (const [roleCode, permissionCodes] of Object.entries(ROLE_PERMISSION_MAPPINGS)) {
    const roleId = createdRoles.get(roleCode);
    if (!roleId) continue;
    
    if (permissionCodes === "all") {
      // Super admin gets all permissions
      for (const permId of createdPermissions.values()) {
        await db.insert(rolePermissions)
          .values({ roleId, permissionId: permId })
          .onConflictDoNothing();
      }
    } else {
      for (const permCode of permissionCodes) {
        const permId = createdPermissions.get(permCode);
        if (!permId) continue;
        
        await db.insert(rolePermissions)
          .values({ roleId, permissionId: permId })
          .onConflictDoNothing();
      }
    }
  }
  
  console.log("✅ Roles and permissions seeded!");
}
```

---

### **Week 3: Permission Checker & UI**

#### **Step 1: Permission Checker Service**

```typescript
// lib/auth/permission-checker.ts
import { db } from "@/server/db";
import { userRoles, rolePermissions, permissions } from "@/drizzle/schema/role-system";
import { eq, and, inArray } from "drizzle-orm";

type PermissionCheck = {
  resource: string;
  action: string;
  context?: {
    departmentId?: string;
    type?: 'own' | 'any';
  };
};

export class PermissionChecker {
  private userId: string;
  private cache: Map<string, boolean> = new Map();

  constructor(userId: string) {
    this.userId = userId;
  }

  /**
   * Check if user has permission
   */
  async can(check: PermissionCheck): Promise<boolean> {
    const cacheKey = JSON.stringify(check);
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const result = await this.checkPermission(check);
    this.cache.set(cacheKey, result);
    
    return result;
  }

  private async checkPermission(check: PermissionCheck): Promise<boolean> {
    // 1. Get user's active roles
    const userRolesList = await db.query.userRoles.findMany({
      where: and(
        eq(userRoles.userId, this.userId),
        eq(userRoles.isActive, true)
      ),
      with: {
        role: {
          with: {
            permissions: {
              with: {
                permission: true,
              },
            },
          },
        },
      },
    });

    // 2. Check if any role has the permission
    for (const userRole of userRolesList) {
      const role = userRole.role;
      
      for (const rolePerm of role.permissions) {
        const perm = rolePerm.permission;
        
        // Match permission
        if (
          perm.resource === check.resource &&
          perm.action === check.action
        ) {
          // Check context constraints
          if (check.context && rolePerm.constraints) {
            const constraints = rolePerm.constraints as any;
            
            // Example: Department constraint
            if (check.context.departmentId) {
              if (constraints.department === 'own') {
                // User must be in the same department
                const user = await db.query.user.findFirst({
                  where: eq(user.id, this.userId),
                });
                
                if (user?.departmentId !== check.context.departmentId) {
                  continue; // Not in same department
                }
              }
            }
          }
          
          return true; // Permission granted
        }
      }
    }

    return false; // No permission found
  }

  /**
   * Shorthand methods for common checks
   */
  async canCreateAudit(): Promise<boolean> {
    return this.can({ resource: 'Audit', action: 'Create' });
  }

  async canApproveAction(actionId: string): Promise<boolean> {
    // Get action to check context
    const action = await db.query.actions.findFirst({
      where: eq(actions.id, actionId),
    });
    
    if (!action) return false;
    
    return this.can({
      resource: 'Action',
      action: 'Approve',
      context: {
        departmentId: action.departmentId || undefined,
      },
    });
  }

  async canCloseFinding(findingId: string): Promise<boolean> {
    return this.can({ resource: 'Finding', action: 'Close' });
  }
}

/**
 * Factory function
 */
export function createPermissionChecker(userId: string): PermissionChecker {
  return new PermissionChecker(userId);
}

/**
 * Middleware helper
 */
export async function requirePermission(
  userId: string,
  check: PermissionCheck
): Promise<void> {
  const checker = createPermissionChecker(userId);
  const hasPermission = await checker.can(check);
  
  if (!hasPermission) {
    throw new Error(`Permission denied: ${check.resource}.${check.action}`);
  }
}
```

#### **Step 2: Update withAuth Helper**

```typescript
// lib/helpers/auth-helpers.ts (ENHANCED)
import { createPermissionChecker, type PermissionCheck } from "@/lib/auth/permission-checker";

interface WithAuthOptions {
  requireAdmin?: boolean;
  requirePermission?: PermissionCheck; // 🔥 NEW
}

export async function withAuth<T>(
  callback: (user: User) => Promise<ActionResponse<T>>,
  options: WithAuthOptions = {}
): Promise<ActionResponse<T>> {
  try {
    const user = await requireUser();
    
    if (options.requireAdmin) {
      requireAdmin(user);
    }
    
    // 🔥 NEW: Permission check
    if (options.requirePermission) {
      const checker = createPermissionChecker(user.id);
      const hasPermission = await checker.can(options.requirePermission);
      
      if (!hasPermission) {
        return {
          success: false,
          error: `Permission denied: ${options.requirePermission.resource}.${options.requirePermission.action}`,
        };
      }
    }
    
    return await callback(user);
  } catch (error) {
    return createActionError("withAuth", error);
  }
}

// Usage example:
export async function createAudit(data: AuditData) {
  return withAuth(
    async (user) => {
      // Create audit logic
    },
    {
      requirePermission: { resource: 'Audit', action: 'Create' }
    }
  );
}
```

---

## 🎨 UI COMPONENTS

### **Department Selector**

```typescript
// components/user/department-selector.tsx
"use client";

import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Department {
  id: string;
  name: string;
  code: string;
}

export function DepartmentSelector({
  value,
  onValueChange,
}: {
  value?: string;
  onValueChange: (value: string) => void;
}) {
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    fetch("/api/departments")
      .then(res => res.json())
      .then(data => setDepartments(data));
  }, []);

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue placeholder="Departman seçin" />
      </SelectTrigger>
      <SelectContent>
        {departments.map((dept) => (
          <SelectItem key={dept.id} value={dept.id}>
            {dept.name} ({dept.code})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
```

### **Role Assignment Dialog**

```typescript
// components/user/assign-role-dialog.tsx
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { assignRoleToUser } from "@/action/user-actions";
import { toast } from "sonner";

export function AssignRoleDialog({ 
  userId, 
  open, 
  onOpenChange 
}: { 
  userId: string; 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
}) {
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleAssign = async () => {
    setLoading(true);
    const result = await assignRoleToUser(userId, selectedRole);
    
    if (result.success) {
      toast.success("Rol atandı!");
      onOpenChange(false);
    } else {
      toast.error(result.error);
    }
    
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rol Ata</DialogTitle>
        </DialogHeader>
        
        {/* Role selector */}
        <Select value={selectedRole} onValueChange={setSelectedRole}>
          {/* ... role options */}
        </Select>
        
        <Button onClick={handleAssign} disabled={loading}>
          Ata
        </Button>
      </DialogContent>
    </Dialog>
  );
}
```

---

## ✅ CHECKLIST

### **Week 1:**
- [ ] Create `departments` table migration
- [ ] Update `user` table with `departmentId`, `managerId`, `employeeNumber`
- [ ] Run migrations
- [ ] Seed initial departments
- [ ] Test department CRUD

### **Week 2:**
- [ ] Create `roles`, `userRoles`, `permissions`, `rolePermissions` tables
- [ ] Run migrations
- [ ] Seed default roles & permissions
- [ ] Test role assignment

### **Week 3:**
- [ ] Create `PermissionChecker` service
- [ ] Update `withAuth` helper
- [ ] Create department management UI
- [ ] Create role assignment UI
- [ ] Test permission checks in existing features

---

## 🎯 IMMEDIATE VALUE

After 3 weeks, you'll have:
✅ Users organized by department
✅ Manager hierarchy
✅ Multiple roles per user
✅ Granular permission system
✅ Foundation for HR integration
✅ Scalable architecture

---

**Ready to start? Let's begin with Week 1!** 🚀
