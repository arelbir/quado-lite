/**
 * ROLE & PERMISSION SYSTEM
 * Enterprise multi-role with granular permissions
 * 
 * Features:
 * - Multiple roles per user
 * - Context-based roles (Department/Project/Global)
 * - Time-based roles (validFrom/To)
 * - Granular permissions (Resource + Action)
 * - Constraint-based (JSON constraints)
 * 
 * Created: 2025-01-24
 * Sprint: Week 2 - Multi-Role System
 */

import { 
  pgTable, 
  uuid, 
  varchar, 
  text,
  timestamp, 
  boolean,
  json,
  foreignKey,
  pgEnum 
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "./user";

/**
 * ENUMS
 */
export const roleCategory = pgEnum("RoleCategory", [
  'System',      // System roles (protected)
  'Functional',  // Functional roles (Quality Manager, Auditor)
  'Project',     // Project-based roles
  'Custom'       // Custom user-defined roles
]);

export const roleScope = pgEnum("RoleScope", [
  'Global',      // Company-wide
  'Company',     // Specific company
  'Branch',      // Specific branch
  'Department'   // Specific department
]);

export const contextType = pgEnum("ContextType", [
  'Global',      // No context (applies everywhere)
  'Company',     // Company context
  'Branch',      // Branch context
  'Department',  // Department context
  'Project'      // Project context (future)
]);

/**
 * ROLES TABLE (NEW - Decoupled from User)
 * Multiple users can have same role
 */
export const roles = pgTable("Roles", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  
  name: varchar("name", { length: 100 }).notNull(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  description: text("description"),
  
  // Role classification
  category: roleCategory("category").default('Custom').notNull(),
  scope: roleScope("scope").default('Global').notNull(),
  
  // System protection
  isSystem: boolean("isSystem").default(false).notNull(), // Protected from deletion
  isActive: boolean("isActive").default(true).notNull(),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt"),
  
  // Audit
  createdById: uuid("createdById"),
},
(table) => ({
  createdByFkey: foreignKey({
    columns: [table.createdById],
    foreignColumns: [user.id],
    name: "Roles_createdById_fkey"
  }).onDelete("set null"),
}));

/**
 * USER_ROLES TABLE (Junction - Many-to-Many)
 * Users can have multiple roles
 * Roles can be context-specific and time-limited
 */
export const userRoles = pgTable("UserRoles", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  
  userId: uuid("userId").notNull(),
  roleId: uuid("roleId").notNull(),
  
  // Context: Where does this role apply?
  contextType: contextType("contextType").default('Global').notNull(),
  contextId: uuid("contextId"), // ID of Company/Branch/Department/Project
  
  // Time-based roles (optional)
  validFrom: timestamp("validFrom"),
  validTo: timestamp("validTo"),
  
  // Status
  isActive: boolean("isActive").default(true).notNull(),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt"),
  
  // Audit
  assignedBy: uuid("assignedBy"),
},
(table) => ({
  userFkey: foreignKey({
    columns: [table.userId],
    foreignColumns: [user.id],
    name: "UserRoles_userId_fkey"
  }).onDelete("cascade"),
  roleFkey: foreignKey({
    columns: [table.roleId],
    foreignColumns: [roles.id],
    name: "UserRoles_roleId_fkey"
  }).onDelete("cascade"),
  assignedByFkey: foreignKey({
    columns: [table.assignedBy],
    foreignColumns: [user.id],
    name: "UserRoles_assignedBy_fkey"
  }).onDelete("set null"),
}));

/**
 * PERMISSIONS TABLE
 * Granular permissions (Resource + Action)
 */
export const permissions = pgTable("Permissions", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  
  name: varchar("name", { length: 100 }).notNull(),
  code: varchar("code", { length: 100 }).notNull().unique(), // e.g., "audit.create"
  description: text("description"),
  
  // Resource & Action
  resource: varchar("resource", { length: 50 }).notNull(), // Audit, Finding, Action, DOF, User
  action: varchar("action", { length: 50 }).notNull(), // Create, Read, Update, Delete, Approve, Export
  
  // Grouping
  category: varchar("category", { length: 50 }), // Group permissions (Audit Management, User Management)
  
  // System protection
  isSystem: boolean("isSystem").default(false).notNull(),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/**
 * ROLE_PERMISSIONS TABLE (Junction)
 * Roles have permissions
 * Permissions can have constraints (JSON)
 */
export const rolePermissions = pgTable("RolePermissions", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  
  roleId: uuid("roleId").notNull(),
  permissionId: uuid("permissionId").notNull(),
  
  // Optional: Constraints (JSON)
  // Example: {"department": "own", "status": ["Active", "InProgress"]}
  constraints: json("constraints"),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
},
(table) => ({
  roleFkey: foreignKey({
    columns: [table.roleId],
    foreignColumns: [roles.id],
    name: "RolePermissions_roleId_fkey"
  }).onDelete("cascade"),
  permissionFkey: foreignKey({
    columns: [table.permissionId],
    foreignColumns: [permissions.id],
    name: "RolePermissions_permissionId_fkey"
  }).onDelete("cascade"),
}));

/**
 * RELATIONS
 */
export const roleRelations = relations(roles, ({ many }) => ({
  userRoles: many(userRoles, {
    relationName: 'role_users',
  }),
  permissions: many(rolePermissions, {
    relationName: 'role_permissions',
  }),
}));

export const userRoleRelations = relations(userRoles, ({ one }) => ({
  user: one(user, {
    fields: [userRoles.userId],
    references: [user.id],
    relationName: 'user_roles',
  }),
  role: one(roles, {
    fields: [userRoles.roleId],
    references: [roles.id],
    relationName: 'role_users',
  }),
  assignedByUser: one(user, {
    fields: [userRoles.assignedBy],
    references: [user.id],
    relationName: 'user_assigned_roles',
  }),
}));

export const permissionRelations = relations(permissions, ({ many }) => ({
  roles: many(rolePermissions, {
    relationName: 'permission_roles',
  }),
}));

export const rolePermissionRelations = relations(rolePermissions, ({ one }) => ({
  role: one(roles, {
    fields: [rolePermissions.roleId],
    references: [roles.id],
    relationName: 'role_permissions',
  }),
  permission: one(permissions, {
    fields: [rolePermissions.permissionId],
    references: [permissions.id],
    relationName: 'permission_roles',
  }),
}));

/**
 * TYPES
 * Note: Suffixed to avoid conflicts with legacy Role table
 */
export type SystemRole = typeof roles.$inferSelect;
export type NewSystemRole = typeof roles.$inferInsert;

export type UserRoleAssignment = typeof userRoles.$inferSelect;
export type NewUserRoleAssignment = typeof userRoles.$inferInsert;

export type Permission = typeof permissions.$inferSelect;
export type NewPermission = typeof permissions.$inferInsert;

export type RolePermission = typeof rolePermissions.$inferSelect;
export type NewRolePermission = typeof rolePermissions.$inferInsert;

/**
 * HELPER TYPES
 */
export type RoleWithPermissions = SystemRole & {
  permissions: (RolePermission & {
    permission: Permission;
  })[];
};

export type UserWithRoles = {
  id: string;
  name: string | null;
  email: string | null;
  roles: (UserRoleAssignment & {
    role: SystemRole;
  })[];
};

export type PermissionCheck = {
  resource: string;
  action: string;
  context?: {
    departmentId?: string;
    type?: 'own' | 'any';
  };
};
