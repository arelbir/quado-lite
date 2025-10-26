# 📊 STEP 1: DATABASE SCHEMA

**Phase:** Foundation  
**Duration:** 2 days  
**Dependencies:** None

---

## **🎯 OBJECTIVES:**

- Create CustomFieldDefinition table
- Create CustomFieldValue table
- Add indexes for performance
- Create migration files

---

## **📐 SCHEMA DESIGN:**

### **Table 1: CustomFieldDefinition**

Stores the field definitions (metadata).

```typescript
// src/drizzle/schema/custom-field.ts

import { pgTable, uuid, varchar, boolean, jsonb, integer, timestamp } from 'drizzle-orm/pg-core';
import { users } from './user';

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
  createdBy: uuid('createdBy').references(() => users.id),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

// Indexes
// CREATE INDEX idx_custom_field_def_entity ON "CustomFieldDefinition"(entityType, status);
// CREATE UNIQUE INDEX idx_custom_field_def_key ON "CustomFieldDefinition"(entityType, fieldKey);
```

---

### **Table 2: CustomFieldValue**

Stores actual values for each entity instance.

```typescript
export const customFieldValues = pgTable('CustomFieldValue', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Field definition reference
  definitionId: uuid('definitionId')
    .references(() => customFieldDefinitions.id, { onDelete: 'cascade' })
    .notNull(),
  
  // Entity reference
  entityType: varchar('entityType', { length: 50 }).notNull(),
  entityId: uuid('entityId').notNull(), // audit.id, finding.id, etc.
  
  // Value
  value: jsonb('value').notNull(), // Actual field value (can be any type)
  
  // Audit
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

// Indexes
// CREATE INDEX idx_custom_field_value_entity ON "CustomFieldValue"(entityType, entityId);
// CREATE UNIQUE INDEX idx_custom_field_value_unique ON "CustomFieldValue"(definitionId, entityId);
```

---

## **📋 FIELD TYPES SUPPORTED:**

```typescript
// lib/types/custom-field.ts

export type CustomFieldType =
  | 'text'           // Single line text
  | 'textarea'       // Multi-line text
  | 'number'         // Numeric input
  | 'email'          // Email with validation
  | 'url'            // URL with validation
  | 'phone'          // Phone number
  | 'select'         // Single select dropdown
  | 'multi-select'   // Multiple select
  | 'radio'          // Radio buttons
  | 'checkbox'       // Single checkbox
  | 'date'           // Date picker
  | 'datetime'       // Date + time picker
  | 'time'           // Time picker
  | 'file'           // File upload (single)
  | 'files'          // File upload (multiple)
  | 'user-picker'    // User selection
  | 'department-picker' // Department selection
  | 'color'          // Color picker
  | 'rating'         // Star rating (1-5)
  | 'slider';        // Numeric slider

export interface CustomFieldDefinition {
  id: string;
  entityType: 'AUDIT' | 'FINDING' | 'ACTION' | 'DOF';
  fieldKey: string;
  fieldType: CustomFieldType;
  label: string;
  placeholder?: string;
  helpText?: string;
  required: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    accept?: string[]; // For file uploads
  };
  options?: Array<{
    value: string;
    label: string;
    color?: string;
  }>;
  order: number;
  section?: string;
  status: 'ACTIVE' | 'ARCHIVED';
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomFieldValue {
  id: string;
  definitionId: string;
  entityType: string;
  entityId: string;
  value: any;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## **🔧 MIGRATION FILE:**

```typescript
// src/drizzle/migrations/YYYYMMDD_create_custom_fields.sql

-- Create CustomFieldDefinition table
CREATE TABLE "CustomFieldDefinition" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "entityType" VARCHAR(50) NOT NULL,
  "fieldKey" VARCHAR(100) NOT NULL,
  "fieldType" VARCHAR(50) NOT NULL,
  "label" VARCHAR(255) NOT NULL,
  "placeholder" VARCHAR(255),
  "helpText" VARCHAR(500),
  "required" BOOLEAN DEFAULT false NOT NULL,
  "validation" JSONB,
  "options" JSONB,
  "order" INTEGER DEFAULT 0 NOT NULL,
  "section" VARCHAR(100),
  "status" VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL,
  "createdBy" UUID REFERENCES "User"("id"),
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create CustomFieldValue table
CREATE TABLE "CustomFieldValue" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "definitionId" UUID NOT NULL REFERENCES "CustomFieldDefinition"("id") ON DELETE CASCADE,
  "entityType" VARCHAR(50) NOT NULL,
  "entityId" UUID NOT NULL,
  "value" JSONB NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create indexes
CREATE INDEX idx_custom_field_def_entity 
  ON "CustomFieldDefinition"("entityType", "status");

CREATE UNIQUE INDEX idx_custom_field_def_key 
  ON "CustomFieldDefinition"("entityType", "fieldKey");

CREATE INDEX idx_custom_field_value_entity 
  ON "CustomFieldValue"("entityType", "entityId");

CREATE UNIQUE INDEX idx_custom_field_value_unique 
  ON "CustomFieldValue"("definitionId", "entityId");

-- Comments
COMMENT ON TABLE "CustomFieldDefinition" IS 'Stores custom field definitions for entities';
COMMENT ON TABLE "CustomFieldValue" IS 'Stores actual values for custom fields';
```

---

## **✅ CHECKLIST:**

- [ ] Create schema file: `src/drizzle/schema/custom-field.ts`
- [ ] Create types file: `lib/types/custom-field.ts`
- [ ] Create migration: `src/drizzle/migrations/YYYYMMDD_create_custom_fields.sql`
- [ ] Run migration: `pnpm drizzle-kit push`
- [ ] Verify tables created
- [ ] Test indexes performance
- [ ] Update schema exports in `src/drizzle/schema/index.ts`

---

## **🧪 TESTING:**

```sql
-- Test data insertion
INSERT INTO "CustomFieldDefinition" (
  "entityType", "fieldKey", "fieldType", "label", "required", "order"
) VALUES (
  'AUDIT', 'certificationNumber', 'text', 'Certification Number', true, 1
);

-- Test query
SELECT * FROM "CustomFieldDefinition" 
WHERE "entityType" = 'AUDIT' AND "status" = 'ACTIVE'
ORDER BY "order";

-- Test foreign key cascade
DELETE FROM "CustomFieldDefinition" WHERE "fieldKey" = 'certificationNumber';
-- Verify CustomFieldValue records also deleted
```

---

**Status:** ✅ Schema designed  
**Next:** [Server Actions](./02-SERVER-ACTIONS.md)
