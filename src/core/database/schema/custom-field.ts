import { pgTable, uuid, varchar, boolean, jsonb, integer, timestamp } from 'drizzle-orm/pg-core';
import { user } from './user';

/**
 * Custom Field Definition
 * Stores metadata for custom fields that can be added to entities
 */
export const customFieldDefinitions = pgTable('CustomFieldDefinition', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Entity linkage
  entityType: varchar('entityType', { length: 50 }).notNull(), // AUDIT, FINDING, ACTION, DOF
  
  // Field metadata
  fieldKey: varchar('fieldKey', { length: 100 }).notNull(), // certificationNumber (unique per entity)
  fieldType: varchar('fieldType', { length: 50 }).notNull(), // text, number, select, date, etc.
  label: varchar('label', { length: 255 }).notNull(), // "Certification Number"
  placeholder: varchar('placeholder', { length: 255 }), // "Enter cert number..."
  helpText: varchar('helpText', { length: 500 }), // "Required for ISO audits"
  
  // Validation
  required: boolean('required').default(false).notNull(),
  validation: jsonb('validation'), // { min, max, pattern, etc. }
  
  // Options (for select/multi-select)
  options: jsonb('options'), // [{ value: 'opt1', label: 'Option 1' }]
  
  // Display
  order: integer('order').default(0).notNull(), // Display order
  section: varchar('section', { length: 100 }), // Group fields by section
  
  // Status
  status: varchar('status', { length: 50 }).default('ACTIVE').notNull(), // ACTIVE, ARCHIVED
  
  // Audit fields
  createdBy: uuid('createdBy').references(() => user.id),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

/**
 * Custom Field Value
 * Stores actual values for custom fields per entity instance
 */
export const customFieldValues = pgTable('CustomFieldValue', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Field definition reference
  definitionId: uuid('definitionId')
    .references(() => customFieldDefinitions.id, { onDelete: 'cascade' })
    .notNull(),
  
  // Entity reference
  entityType: varchar('entityType', { length: 50 }).notNull(),
  entityId: uuid('entityId').notNull(), // audit.id, finding.id, etc.
  
  // Value (stored as JSONB for flexibility)
  value: jsonb('value').notNull(),
  
  // Audit
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});
