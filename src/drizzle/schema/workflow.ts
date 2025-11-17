/**
 * WORKFLOW SYSTEM SCHEMA
 * Generic workflow engine for approval processes
 * 
 * Features:
 * - Multiple workflow definitions (templates)
 * - Workflow instances (active flows)
 * - Step assignments (role/user based)
 * - Delegation system (yetki devri)
 * - Deadline tracking
 * - Escalation handling
 * - Veto authority
 * - Timeline/Audit trail
 * 
 * Created: 2025-01-25
 * Sprint: Workflow System Core
 */

import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  json,
  integer,
  foreignKey,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "./user";

/**
 * ENUMS - GENERIC FRAMEWORK ONLY
 */
export const entityType = pgEnum("EntityType", [
  "User",
  "Workflow",
  "Document",
  "CustomEntity",
]);

export const stepType = pgEnum("StepType", [
  "start",        // Başlangıç adımı
  "approval",     // Onay adımı
  "task",         // Görev adımı
  "decision",     // Karar adımı (koşullu)
  "end",          // Bitiş adımı
]);

export const assignmentType = pgEnum("AssignmentType", [
  "role",         // Role-based (e.g., "manager")
  "user",         // Specific user
  "auto",         // Auto-assignment (round-robin, workload)
]);

export const stepStatus = pgEnum("StepStatus", [
  "pending",      // Bekliyor
  "in_progress",  // Devam ediyor
  "completed",    // Tamamlandı
  "rejected",     // Reddedildi
  "escalated",    // Yükseltildi
  "skipped",      // Atlandı (veto)
]);

export const instanceStatus = pgEnum("InstanceStatus", [
  "active",       // Aktif
  "completed",    // Tamamlandı
  "cancelled",    // İptal edildi
  "on_hold",      // Beklemede
]);

export const actionType = pgEnum("ActionType", [
  "submit",       // Başlatma
  "approve",      // Onaylama
  "reject",       // Reddetme
  "assign",       // Atama
  "reassign",     // Yeniden atama
  "escalate",     // Yükseltme
  "veto",         // Üst yetki bypass
  "complete",     // Tamamlama
  "cancel",       // İptal
]);

/**
 * WORKFLOW_DEFINITIONS TABLE
 * Workflow templates (reusable definitions)
 */
export const workflowDefinitions = pgTable("WorkflowDefinition", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),

  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  entityType: entityType("entityType").notNull(),

  // Version control
  version: integer("version").default(1).notNull(),
  isActive: boolean("isActive").default(true).notNull(),

  // Workflow configuration (JSON)
  steps: json("steps").notNull(),
  // Example:
  // [
  //   {
  //     id: "draft",
  //     name: "Taslak",
  //     type: "start",
  //     allowedRoles: ["auditor"]
  //   },
  //   {
  //     id: "review",
  //     name: "İnceleme",
  //     type: "approval",
  //     assignmentType: "role",
  //     assignedRole: "manager",
  //     deadline: "3d",
  //     escalateTo: "director"
  //   },
  //   {
  //     id: "approved",
  //     name: "Onaylandı",
  //     type: "end"
  //   }
  // ]

  transitions: json("transitions").notNull(),
  // Example:
  // [
  //   { from: "draft", to: "review", action: "submit" },
  //   { from: "review", to: "approved", action: "approve" },
  //   { from: "review", to: "draft", action: "reject" }
  // ]

  // Conditional transitions
  conditions: json("conditions"),
  // Example:
  // [
  //   {
  //     stepId: "review",
  //     field: "riskLevel",
  //     operator: ">",
  //     value: "medium",
  //     nextStep: "director-approval"
  //   }
  // ]

  // Veto roles (can bypass all steps)
  vetoRoles: json("vetoRoles"),
  // Example: ["ceo", "admin"]

  // Metadata
  metadata: json("metadata"),

  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt"),

  // Audit
  createdById: uuid("createdById"),
}, (table) => ({
  createdByFkey: foreignKey({
    columns: [table.createdById],
    foreignColumns: [user.id],
    name: "WorkflowDefinition_createdById_fkey",
  }).onDelete("set null"),
  entityTypeIdx: index("workflow_definition_entity_type_idx").on(table.entityType),
  activeIdx: index("workflow_definition_active_idx").on(table.isActive),
}));

/**
 * WORKFLOW_INSTANCES TABLE
 * Active workflow instances (per entity)
 */
export const workflowInstances = pgTable("WorkflowInstance", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),

  workflowDefinitionId: uuid("workflowDefinitionId").notNull(),

  // Entity reference (polymorphic)
  entityType: entityType("entityType").notNull(),
  entityId: uuid("entityId").notNull(),

  // Current state
  currentStepId: varchar("currentStepId", { length: 100 }).notNull(),
  status: instanceStatus("status").default("active").notNull(),

  // Timeline
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),

  // Entity metadata (snapshot at workflow start)
  entityMetadata: json("entityMetadata"),
  // Example:
  // {
  //   riskLevel: "high",
  //   amount: 50000,
  //   department: "IT"
  // }

  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt"),
}, (table) => ({
  workflowDefFkey: foreignKey({
    columns: [table.workflowDefinitionId],
    foreignColumns: [workflowDefinitions.id],
    name: "WorkflowInstance_workflowDefinitionId_fkey",
  }).onDelete("restrict"),
  entityIdx: index("workflow_instance_entity_idx").on(table.entityType, table.entityId),
  statusIdx: index("workflow_instance_status_idx").on(table.status),
  currentStepIdx: index("workflow_instance_current_step_idx").on(table.currentStepId),
}));

/**
 * STEP_ASSIGNMENTS TABLE
 * Step assignments (who should work on this step)
 */
export const stepAssignments = pgTable("StepAssignment", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),

  workflowInstanceId: uuid("workflowInstanceId").notNull(),
  stepId: varchar("stepId", { length: 100 }).notNull(),

  // Assignment
  assignmentType: assignmentType("assignmentType").notNull(),
  assignedRole: varchar("assignedRole", { length: 100 }),
  assignedUserId: uuid("assignedUserId"),

  // Status
  status: stepStatus("status").default("pending").notNull(),

  // Timeline
  assignedAt: timestamp("assignedAt").defaultNow().notNull(),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  deadline: timestamp("deadline"),

  // Completion
  completedBy: uuid("completedBy"),
  action: actionType("action"),
  comment: text("comment"),

  // Escalation
  escalatedAt: timestamp("escalatedAt"),
  escalatedTo: uuid("escalatedTo"),

  // Metadata
  metadata: json("metadata"),

  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt"),
}, (table) => ({
  workflowInstanceFkey: foreignKey({
    columns: [table.workflowInstanceId],
    foreignColumns: [workflowInstances.id],
    name: "StepAssignment_workflowInstanceId_fkey",
  }).onDelete("cascade"),
  assignedUserFkey: foreignKey({
    columns: [table.assignedUserId],
    foreignColumns: [user.id],
    name: "StepAssignment_assignedUserId_fkey",
  }).onDelete("set null"),
  completedByFkey: foreignKey({
    columns: [table.completedBy],
    foreignColumns: [user.id],
    name: "StepAssignment_completedBy_fkey",
  }).onDelete("set null"),
  escalatedToFkey: foreignKey({
    columns: [table.escalatedTo],
    foreignColumns: [user.id],
    name: "StepAssignment_escalatedTo_fkey",
  }).onDelete("set null"),
  instanceStepIdx: index("step_assignment_instance_step_idx").on(
    table.workflowInstanceId,
    table.stepId
  ),
  assignedUserIdx: index("step_assignment_assigned_user_idx").on(table.assignedUserId),
  statusIdx: index("step_assignment_status_idx").on(table.status),
  deadlineIdx: index("step_assignment_deadline_idx").on(table.deadline),
}));

/**
 * WORKFLOW_DELEGATIONS TABLE
 * User delegation (yetki devri)
 */
export const workflowDelegations = pgTable("WorkflowDelegation", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),

  fromUserId: uuid("fromUserId").notNull(),
  toUserId: uuid("toUserId").notNull(),

  // Delegation scope
  role: varchar("role", { length: 100 }).notNull(),
  entityType: entityType("entityType"), // Null = all entities

  // Timeline
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate").notNull(),

  // Status
  isActive: boolean("isActive").default(true).notNull(),

  // Reason
  reason: text("reason"),

  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt"),

  // Audit
  createdById: uuid("createdById"),
}, (table) => ({
  fromUserFkey: foreignKey({
    columns: [table.fromUserId],
    foreignColumns: [user.id],
    name: "WorkflowDelegation_fromUserId_fkey",
  }).onDelete("cascade"),
  toUserFkey: foreignKey({
    columns: [table.toUserId],
    foreignColumns: [user.id],
    name: "WorkflowDelegation_toUserId_fkey",
  }).onDelete("cascade"),
  createdByFkey: foreignKey({
    columns: [table.createdById],
    foreignColumns: [user.id],
    name: "WorkflowDelegation_createdById_fkey",
  }).onDelete("set null"),
  fromUserIdx: index("workflow_delegation_from_user_idx").on(table.fromUserId),
  toUserIdx: index("workflow_delegation_to_user_idx").on(table.toUserId),
  activeIdx: index("workflow_delegation_active_idx").on(table.isActive),
  dateIdx: index("workflow_delegation_date_idx").on(table.startDate, table.endDate),
}));

/**
 * WORKFLOW_TIMELINE TABLE
 * Audit trail for workflow actions
 */
export const workflowTimeline = pgTable("WorkflowTimeline", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),

  workflowInstanceId: uuid("workflowInstanceId").notNull(),

  // Action details
  stepId: varchar("stepId", { length: 100 }).notNull(),
  action: actionType("action").notNull(),

  // Actor
  performedBy: uuid("performedBy"),
  performedAt: timestamp("performedAt").defaultNow().notNull(),

  // Details
  comment: text("comment"),
  metadata: json("metadata"),

  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  workflowInstanceFkey: foreignKey({
    columns: [table.workflowInstanceId],
    foreignColumns: [workflowInstances.id],
    name: "WorkflowTimeline_workflowInstanceId_fkey",
  }).onDelete("cascade"),
  performedByFkey: foreignKey({
    columns: [table.performedBy],
    foreignColumns: [user.id],
    name: "WorkflowTimeline_performedBy_fkey",
  }).onDelete("set null"),
  instanceIdx: index("workflow_timeline_instance_idx").on(table.workflowInstanceId),
  performedAtIdx: index("workflow_timeline_performed_at_idx").on(table.performedAt),
}));

/**
 * RELATIONS
 */
export const workflowDefinitionRelations = relations(workflowDefinitions, ({ many }) => ({
  instances: many(workflowInstances, {
    relationName: "definition_instances",
  }),
}));

export const workflowInstanceRelations = relations(workflowInstances, ({ one, many }) => ({
  definition: one(workflowDefinitions, {
    fields: [workflowInstances.workflowDefinitionId],
    references: [workflowDefinitions.id],
    relationName: "definition_instances",
  }),
  assignments: many(stepAssignments, {
    relationName: "instance_assignments",
  }),
  timeline: many(workflowTimeline, {
    relationName: "instance_timeline",
  }),
}));

export const stepAssignmentRelations = relations(stepAssignments, ({ one }) => ({
  instance: one(workflowInstances, {
    fields: [stepAssignments.workflowInstanceId],
    references: [workflowInstances.id],
    relationName: "instance_assignments",
  }),
  assignedUser: one(user, {
    fields: [stepAssignments.assignedUserId],
    references: [user.id],
    relationName: "user_assignments",
  }),
  completedByUser: one(user, {
    fields: [stepAssignments.completedBy],
    references: [user.id],
    relationName: "user_completions",
  }),
}));

export const workflowDelegationRelations = relations(workflowDelegations, ({ one }) => ({
  fromUser: one(user, {
    fields: [workflowDelegations.fromUserId],
    references: [user.id],
    relationName: "user_delegations_from",
  }),
  toUser: one(user, {
    fields: [workflowDelegations.toUserId],
    references: [user.id],
    relationName: "user_delegations_to",
  }),
}));

export const workflowTimelineRelations = relations(workflowTimeline, ({ one }) => ({
  instance: one(workflowInstances, {
    fields: [workflowTimeline.workflowInstanceId],
    references: [workflowInstances.id],
    relationName: "instance_timeline",
  }),
  performedByUser: one(user, {
    fields: [workflowTimeline.performedBy],
    references: [user.id],
    relationName: "user_timeline_actions",
  }),
}));

/**
 * TYPES
 */
export type WorkflowDefinition = typeof workflowDefinitions.$inferSelect;
export type NewWorkflowDefinition = typeof workflowDefinitions.$inferInsert;

export type WorkflowInstance = typeof workflowInstances.$inferSelect;
export type NewWorkflowInstance = typeof workflowInstances.$inferInsert;

export type StepAssignment = typeof stepAssignments.$inferSelect;
export type NewStepAssignment = typeof stepAssignments.$inferInsert;

export type WorkflowDelegation = typeof workflowDelegations.$inferSelect;
export type NewWorkflowDelegation = typeof workflowDelegations.$inferInsert;

export type WorkflowTimelineEntry = typeof workflowTimeline.$inferSelect;
export type NewWorkflowTimelineEntry = typeof workflowTimeline.$inferInsert;

/**
 * HELPER TYPES
 */
export interface WorkflowStep {
  id: string;
  name: string;
  type: "start" | "approval" | "task" | "decision" | "end";
  assignmentType?: "role" | "user" | "auto";
  assignedRole?: string;
  assignedUser?: string;
  allowedRoles?: string[];
  deadline?: string; // e.g., "3d", "1w", "2h"
  escalateTo?: string; // role or user
}

export interface WorkflowTransition {
  from: string;
  to: string;
  action: string;
  condition?: {
    field: string;
    operator: "=" | "!=" | ">" | "<" | ">=" | "<=" | "in" | "not_in";
    value: any;
  };
}

export interface WorkflowCondition {
  stepId: string;
  field: string;
  operator: "=" | "!=" | ">" | "<" | ">=" | "<=" | "in" | "not_in";
  value: any;
  nextStep: string;
}

export type WorkflowDefinitionWithSteps = WorkflowDefinition & {
  steps: WorkflowStep[];
  transitions: WorkflowTransition[];
  conditions?: WorkflowCondition[];
  vetoRoles?: string[];
};

export type WorkflowInstanceWithDetails = WorkflowInstance & {
  definition: WorkflowDefinition;
  assignments: StepAssignment[];
  timeline: WorkflowTimelineEntry[];
};
