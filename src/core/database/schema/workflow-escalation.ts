/**
 * WORKFLOW ESCALATION LOG SCHEMA
 * Tracks workflow task escalations
 * 
 * Created: 2025-01-25
 * Implements TODO from deadline-monitor.ts
 */

import { pgTable, uuid, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { stepAssignments } from "./workflow";
import { user } from "./user";

/**
 * Workflow Escalation Log
 * Dedicated table for tracking escalations
 */
export const workflowEscalationLog = pgTable("workflow_escalation_log", {
  id: uuid("id").defaultRandom().primaryKey(),
  
  // Assignment being escalated
  assignmentId: uuid("assignment_id")
    .references(() => stepAssignments.id)
    .notNull(),
  
  // Escalation details
  escalatedFrom: uuid("escalated_from").references(() => user.id),
  escalatedTo: uuid("escalated_to").references(() => user.id).notNull(),
  reason: text("reason").notNull(), // 'DEADLINE_EXCEEDED', 'MANUAL', etc.
  
  // Additional context
  metadata: jsonb("metadata").default({}).notNull(),
  
  // Audit
  createdBy: uuid("created_by").references(() => user.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Export type
export type WorkflowEscalationLog = typeof workflowEscalationLog.$inferSelect;
export type NewWorkflowEscalationLog = typeof workflowEscalationLog.$inferInsert;
