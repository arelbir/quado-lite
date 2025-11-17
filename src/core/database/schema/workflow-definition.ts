import { pgTable, uuid, varchar, text, jsonb, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { user } from './user';

// Workflow status enum
export const workflowStatusEnum = pgEnum('workflow_status', [
  'DRAFT',
  'ACTIVE',
  'ARCHIVED',
]);

// Workflow module enum
export const workflowModuleEnum = pgEnum('workflow_module', [
  'DOF',
  'ACTION',
  'FINDING',
  'AUDIT',
]);

/**
 * VisualWorkflow Table
 * Stores visual workflow designs with versioning support
 */
export const visualWorkflow = pgTable('VisualWorkflow', {
  // Identification
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  
  // Module & Status
  module: workflowModuleEnum('module').notNull(),
  status: workflowStatusEnum('status').notNull().default('DRAFT'),
  
  // Visual Design (React Flow format)
  nodes: jsonb('nodes').notNull().$type<any[]>(), // Array of React Flow nodes
  edges: jsonb('edges').notNull().$type<any[]>(), // Array of React Flow edges
  
  // Metadata
  version: varchar('version', { length: 50 }).notNull().default('1.0'),
  
  // Audit fields
  createdById: uuid('createdById')
    .notNull()
    .references(() => user.id, { onDelete: 'restrict' }),
  createdAt: timestamp('createdAt', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updatedAt', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  publishedAt: timestamp('publishedAt', { withTimezone: true }),
  publishedById: uuid('publishedById').references(() => user.id, {
    onDelete: 'set null',
  }),
});

/**
 * VisualWorkflowVersion Table
 * Version history for visual workflow definitions
 */
export const visualWorkflowVersion = pgTable('VisualWorkflowVersion', {
  // Identification
  id: uuid('id').primaryKey().defaultRandom(),
  workflowId: uuid('workflowId')
    .notNull()
    .references(() => visualWorkflow.id, { onDelete: 'cascade' }),
  
  // Version info
  version: varchar('version', { length: 50 }).notNull(),
  changeNotes: text('changeNotes'),
  
  // Snapshot of workflow at this version
  nodes: jsonb('nodes').notNull().$type<any[]>(),
  edges: jsonb('edges').notNull().$type<any[]>(),
  
  // Audit
  createdById: uuid('createdById')
    .notNull()
    .references(() => user.id, { onDelete: 'restrict' }),
  createdAt: timestamp('createdAt', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Relations
import { relations } from 'drizzle-orm';

export const visualWorkflowRelations = relations(visualWorkflow, ({ one, many }) => ({
  createdBy: one(user, {
    fields: [visualWorkflow.createdById],
    references: [user.id],
    relationName: 'visual_workflow_created_by',
  }),
  publishedBy: one(user, {
    fields: [visualWorkflow.publishedById],
    references: [user.id],
    relationName: 'visual_workflow_published_by',
  }),
  versions: many(visualWorkflowVersion),
}));

export const visualWorkflowVersionRelations = relations(visualWorkflowVersion, ({ one }) => ({
  workflow: one(visualWorkflow, {
    fields: [visualWorkflowVersion.workflowId],
    references: [visualWorkflow.id],
  }),
  createdBy: one(user, {
    fields: [visualWorkflowVersion.createdById],
    references: [user.id],
  }),
}));

// Types for TypeScript
export type VisualWorkflow = typeof visualWorkflow.$inferSelect;
export type NewVisualWorkflow = typeof visualWorkflow.$inferInsert;
export type VisualWorkflowVersion = typeof visualWorkflowVersion.$inferSelect;
export type NewVisualWorkflowVersion = typeof visualWorkflowVersion.$inferInsert;
