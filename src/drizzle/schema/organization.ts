/**
 * ORGANIZATION SCHEMA
 * Enterprise organization hierarchy tables
 * 
 * Hierarchy: Company → Branch → Department → User
 * 
 * Created: 2025-01-24
 * Sprint: Week 1 - Organization Structure
 */

import { 
  pgTable, 
  uuid, 
  varchar, 
  text,
  timestamp, 
  boolean,
  foreignKey 
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "./user";

/**
 * COMPANIES TABLE
 * Top-level organization entity
 */
export const companies = pgTable("Company", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  
  // Legal info
  legalName: varchar("legalName", { length: 500 }),
  taxNumber: varchar("taxNumber", { length: 50 }),
  
  // Contact
  country: varchar("country", { length: 100 }),
  city: varchar("city", { length: 100 }),
  address: text("address"),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 255 }),
  website: varchar("website", { length: 255 }),
  
  // Status
  isActive: boolean("isActive").default(true).notNull(),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt"),
  deletedAt: timestamp("deletedAt"),
  
  // Audit
  createdById: uuid("createdById"),
  deletedById: uuid("deletedById"),
},
(table) => ({
  createdByFkey: foreignKey({
    columns: [table.createdById],
    foreignColumns: [user.id],
    name: "Company_createdById_fkey"
  }).onDelete("set null"),
  deletedByFkey: foreignKey({
    columns: [table.deletedById],
    foreignColumns: [user.id],
    name: "Company_deletedById_fkey"
  }).onDelete("set null"),
}));

/**
 * BRANCHES TABLE
 * Physical locations or regional offices
 */
export const branches = pgTable("Branch", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  companyId: uuid("companyId").notNull(),
  
  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code", { length: 50 }).notNull(),
  
  // Type of branch
  type: varchar("type", { length: 50 }).default('Branch'), // Headquarters, Branch, Factory, Office
  
  // Location
  country: varchar("country", { length: 100 }),
  city: varchar("city", { length: 100 }),
  address: text("address"),
  phone: varchar("phone", { length: 50 }),
  
  // Management
  managerId: uuid("managerId"), // Branch manager
  
  // Status
  isActive: boolean("isActive").default(true).notNull(),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt"),
  deletedAt: timestamp("deletedAt"),
  
  // Audit
  createdById: uuid("createdById"),
  deletedById: uuid("deletedById"),
},
(table) => ({
  companyFkey: foreignKey({
    columns: [table.companyId],
    foreignColumns: [companies.id],
    name: "Branch_companyId_fkey"
  }).onDelete("cascade"),
  managerFkey: foreignKey({
    columns: [table.managerId],
    foreignColumns: [user.id],
    name: "Branch_managerId_fkey"
  }).onDelete("set null"),
  createdByFkey: foreignKey({
    columns: [table.createdById],
    foreignColumns: [user.id],
    name: "Branch_createdById_fkey"
  }).onDelete("set null"),
  deletedByFkey: foreignKey({
    columns: [table.deletedById],
    foreignColumns: [user.id],
    name: "Branch_deletedById_fkey"
  }).onDelete("set null"),
}));

/**
 * DEPARTMENTS TABLE
 * Organizational departments (can be nested)
 */
export const departments = pgTable("Department", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  branchId: uuid("branchId"), // Optional: can belong to branch
  
  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code", { length: 50 }).notNull(),
  description: text("description"),
  
  // Hierarchy (self-reference for nested departments)
  parentDepartmentId: uuid("parentDepartmentId"),
  
  // Management
  managerId: uuid("managerId"), // Department manager
  
  // Finance
  costCenter: varchar("costCenter", { length: 50 }),
  budget: varchar("budget", { length: 100 }),
  
  // Status
  isActive: boolean("isActive").default(true).notNull(),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt"),
  deletedAt: timestamp("deletedAt"),
  
  // Audit
  createdById: uuid("createdById"),
  deletedById: uuid("deletedById"),
},
(table) => ({
  branchFkey: foreignKey({
    columns: [table.branchId],
    foreignColumns: [branches.id],
    name: "Department_branchId_fkey"
  }).onDelete("set null"),
  parentFkey: foreignKey({
    columns: [table.parentDepartmentId],
    foreignColumns: [table.id],
    name: "Department_parentId_fkey"
  }).onDelete("set null"),
  managerFkey: foreignKey({
    columns: [table.managerId],
    foreignColumns: [user.id],
    name: "Department_managerId_fkey"
  }).onDelete("set null"),
  createdByFkey: foreignKey({
    columns: [table.createdById],
    foreignColumns: [user.id],
    name: "Department_createdById_fkey"
  }).onDelete("set null"),
  deletedByFkey: foreignKey({
    columns: [table.deletedById],
    foreignColumns: [user.id],
    name: "Department_deletedById_fkey"
  }).onDelete("set null"),
}));

/**
 * POSITIONS TABLE
 * Job titles and career levels
 */
export const positions = pgTable("Position", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  
  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  description: text("description"),
  
  // Career level (1-10)
  level: varchar("level", { length: 10 }),
  
  // Category
  category: varchar("category", { length: 100 }), // Management, Technical, Administrative, Operational
  
  // Salary info (optional)
  salaryGrade: varchar("salaryGrade", { length: 50 }),
  
  // Status
  isActive: boolean("isActive").default(true).notNull(),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt"),
  deletedAt: timestamp("deletedAt"),
  
  // Audit
  createdById: uuid("createdById"),
  deletedById: uuid("deletedById"),
},
(table) => ({
  createdByFkey: foreignKey({
    columns: [table.createdById],
    foreignColumns: [user.id],
    name: "Position_createdById_fkey"
  }).onDelete("set null"),
  deletedByFkey: foreignKey({
    columns: [table.deletedById],
    foreignColumns: [user.id],
    name: "Position_deletedById_fkey"
  }).onDelete("set null"),
}));

/**
 * RELATIONS
 */
export const companyRelations = relations(companies, ({ many }) => ({
  branches: many(branches),
}));

export const branchRelations = relations(branches, ({ one, many }) => ({
  company: one(companies, {
    fields: [branches.companyId],
    references: [companies.id],
    relationName: 'company_branches',
  }),
  manager: one(user, {
    fields: [branches.managerId],
    references: [user.id],
    relationName: 'branch_manager',
  }),
  departments: many(departments),
}));

export const departmentRelations = relations(departments, ({ one, many }) => ({
  branch: one(branches, {
    fields: [departments.branchId],
    references: [branches.id],
    relationName: 'branch_departments',
  }),
  parent: one(departments, {
    fields: [departments.parentDepartmentId],
    references: [departments.id],
    relationName: 'department_parent',
  }),
  children: many(departments, {
    relationName: 'department_parent',
  }),
  manager: one(user, {
    fields: [departments.managerId],
    references: [user.id],
    relationName: 'department_manager',
  }),
  users: many(user, {
    relationName: 'user_department',
  }),
}));

export const positionRelations = relations(positions, ({ many }) => ({
  users: many(user, {
    relationName: 'user_position',
  }),
}));

/**
 * TYPES
 */
export type Company = typeof companies.$inferSelect;
export type NewCompany = typeof companies.$inferInsert;

export type Branch = typeof branches.$inferSelect;
export type NewBranch = typeof branches.$inferInsert;

export type Department = typeof departments.$inferSelect;
export type NewDepartment = typeof departments.$inferInsert;

export type Position = typeof positions.$inferSelect;
export type NewPosition = typeof positions.$inferInsert;

/**
 * HELPER TYPES
 */
export type DepartmentWithChildren = Department & {
  children: DepartmentWithChildren[];
  manager?: {
    id: string;
    name: string | null;
    email: string | null;
  };
};

export type BranchWithDepartments = Branch & {
  departments: Department[];
  company: Company;
};
