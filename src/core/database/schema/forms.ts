/**
 * FORMS DATABASE SCHEMA
 * Tables for dynamic form builder and submissions
 */

import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  jsonb,
  integer,
  pgEnum,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { user } from './user';

/**
 * Form status enum
 */
export const formStatusEnum = pgEnum('form_status', [
  'draft',
  'published',
  'archived',
]);

/**
 * Submission status enum
 */
export const submissionStatusEnum = pgEnum('submission_status', [
  'draft',
  'submitted',
  'approved',
  'rejected',
]);

/**
 * Form Definitions Table
 * Stores form schemas and configurations
 */
export const formDefinitions = pgTable('FormDefinition', {
  // Identification
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  
  // Schema (JSON Schema format)
  schema: jsonb('schema').notNull().$type<any>(),
  
  // Version control
  version: integer('version').default(1).notNull(),
  
  // Status
  status: formStatusEnum('status').default('draft').notNull(),
  
  // Categorization
  tags: jsonb('tags').$type<string[]>(),
  category: varchar('category', { length: 100 }),
  
  // Workflow integration
  workflowId: uuid('workflowId'),
  workflowNodeId: varchar('workflowNodeId', { length: 255 }),
  
  // Audit
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt'),
  createdById: uuid('createdById').notNull(),
  updatedById: uuid('updatedById'),
}, (table) => ({
  nameIdx: index('idx_form_definition_name').on(table.name),
  statusIdx: index('idx_form_definition_status').on(table.status),
  categoryIdx: index('idx_form_definition_category').on(table.category),
  workflowIdx: index('idx_form_definition_workflow').on(table.workflowId),
  createdByIdx: index('idx_form_definition_created_by').on(table.createdById),
}));

/**
 * Form Versions Table
 * Stores historical versions of forms
 */
export const formVersions = pgTable('FormVersion', {
  id: uuid('id').primaryKey().defaultRandom(),
  formId: uuid('formId').notNull(),
  version: integer('version').notNull(),
  schema: jsonb('schema').notNull().$type<any>(),
  
  // Changelog
  changeDescription: text('changeDescription'),
  
  // Audit
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  createdById: uuid('createdById').notNull(),
}, (table) => ({
  formIdIdx: index('idx_form_version_form_id').on(table.formId),
  versionIdx: index('idx_form_version_version').on(table.formId, table.version),
}));

/**
 * Form Submissions Table
 * Stores user submissions and responses
 */
export const formSubmissions = pgTable('FormSubmission', {
  // Identification
  id: uuid('id').primaryKey().defaultRandom(),
  formId: uuid('formId').notNull(),
  formVersion: integer('formVersion').notNull(),
  
  // Data
  data: jsonb('data').notNull().$type<Record<string, any>>(),
  
  // Status
  status: submissionStatusEnum('status').default('draft').notNull(),
  
  // User
  submittedBy: uuid('submittedBy'),
  submittedAt: timestamp('submittedAt'),
  
  // Workflow context
  workflowInstanceId: uuid('workflowInstanceId'),
  workflowStepId: varchar('workflowStepId', { length: 255 }),
  
  // File attachments metadata
  attachments: jsonb('attachments').$type<{
    fieldName: string;
    files: {
      id: string;
      name: string;
      url: string;
      size: number;
      type: string;
    }[];
  }[]>(),
  
  // Audit
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt'),
}, (table) => ({
  formIdIdx: index('idx_form_submission_form_id').on(table.formId),
  statusIdx: index('idx_form_submission_status').on(table.status),
  submittedByIdx: index('idx_form_submission_submitted_by').on(table.submittedBy),
  workflowIdx: index('idx_form_submission_workflow').on(table.workflowInstanceId),
  createdAtIdx: index('idx_form_submission_created_at').on(table.createdAt),
}));

/**
 * Relations
 */
export const formDefinitionsRelations = relations(formDefinitions, ({ one, many }) => ({
  createdBy: one(user, {
    fields: [formDefinitions.createdById],
    references: [user.id],
  }),
  updatedBy: one(user, {
    fields: [formDefinitions.updatedById],
    references: [user.id],
  }),
  versions: many(formVersions),
  submissions: many(formSubmissions),
}));

export const formVersionsRelations = relations(formVersions, ({ one }) => ({
  form: one(formDefinitions, {
    fields: [formVersions.formId],
    references: [formDefinitions.id],
  }),
  createdBy: one(user, {
    fields: [formVersions.createdById],
    references: [user.id],
  }),
}));

export const formSubmissionsRelations = relations(formSubmissions, ({ one }) => ({
  form: one(formDefinitions, {
    fields: [formSubmissions.formId],
    references: [formDefinitions.id],
  }),
  submittedBy: one(user, {
    fields: [formSubmissions.submittedBy],
    references: [user.id],
  }),
}));
