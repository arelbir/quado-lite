# ⚙️ STEP 2: SERVER ACTIONS

**Phase:** Foundation  
**Duration:** 2-3 days  
**Dependencies:** Database Schema (Step 1)

---

## **🎯 OBJECTIVES:**

- CRUD operations for custom field definitions
- Save/load custom field values
- Validation logic
- Type-safe responses

---

## **📁 FILE STRUCTURE:**

```
src/server/actions/
├── custom-field-definition-actions.ts  (Admin operations)
└── custom-field-value-actions.ts       (User operations)
```

---

## **1️⃣ DEFINITION ACTIONS (Admin):**

```typescript
// src/server/actions/custom-field-definition-actions.ts

'use server';

import { db } from '@/drizzle/db';
import { customFieldDefinitions } from '@/drizzle/schema';
import { withAuth, requireAdmin, createValidationError } from '@/lib/helpers';
import { revalidatePath } from 'next/cache';
import type { ActionResponse, CustomFieldDefinition } from '@/lib/types';
import { eq, and } from 'drizzle-orm';

/**
 * Get all custom field definitions for an entity type
 */
export async function getCustomFieldDefinitions(
  entityType: 'AUDIT' | 'FINDING' | 'ACTION' | 'DOF'
): Promise<ActionResponse<CustomFieldDefinition[]>> {
  return withAuth(async (user) => {
    const fields = await db.customFieldDefinition.findMany({
      where: and(
        eq(customFieldDefinitions.entityType, entityType),
        eq(customFieldDefinitions.status, 'ACTIVE')
      ),
      orderBy: [customFieldDefinitions.order, customFieldDefinitions.createdAt],
    });

    return { success: true, data: fields };
  });
}

/**
 * Create a new custom field definition
 */
export async function createCustomFieldDefinition(data: {
  entityType: 'AUDIT' | 'FINDING' | 'ACTION' | 'DOF';
  fieldKey: string;
  fieldType: string;
  label: string;
  placeholder?: string;
  helpText?: string;
  required?: boolean;
  validation?: any;
  options?: any[];
  section?: string;
  order?: number;
}): Promise<ActionResponse<CustomFieldDefinition>> {
  return withAuth(async (user) => {
    requireAdmin(user);

    // Validate field key uniqueness
    const existing = await db.customFieldDefinition.findFirst({
      where: and(
        eq(customFieldDefinitions.entityType, data.entityType),
        eq(customFieldDefinitions.fieldKey, data.fieldKey)
      ),
    });

    if (existing) {
      return createValidationError(
        `Field with key "${data.fieldKey}" already exists for ${data.entityType}`
      );
    }

    // Create field
    const field = await db.customFieldDefinition.create({
      data: {
        ...data,
        required: data.required ?? false,
        order: data.order ?? 0,
        status: 'ACTIVE',
        createdBy: user.id,
      },
    });

    revalidatePath(`/admin/custom-fields/${data.entityType}`);

    return { success: true, data: field };
  }, { requireAdmin: true });
}

/**
 * Update custom field definition
 */
export async function updateCustomFieldDefinition(
  id: string,
  data: Partial<CustomFieldDefinition>
): Promise<ActionResponse<CustomFieldDefinition>> {
  return withAuth(async (user) => {
    requireAdmin(user);

    const field = await db.customFieldDefinition.findUnique({
      where: { id },
    });

    if (!field) {
      return createNotFoundError('Custom field');
    }

    const updated = await db.customFieldDefinition.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });

    revalidatePath(`/admin/custom-fields/${field.entityType}`);

    return { success: true, data: updated };
  }, { requireAdmin: true });
}

/**
 * Delete (archive) custom field definition
 */
export async function deleteCustomFieldDefinition(
  id: string
): Promise<ActionResponse> {
  return withAuth(async (user) => {
    requireAdmin(user);

    const field = await db.customFieldDefinition.findUnique({
      where: { id },
    });

    if (!field) {
      return createNotFoundError('Custom field');
    }

    // Soft delete (archive)
    await db.customFieldDefinition.update({
      where: { id },
      data: {
        status: 'ARCHIVED',
        updatedAt: new Date(),
      },
    });

    revalidatePath(`/admin/custom-fields/${field.entityType}`);

    return { success: true };
  }, { requireAdmin: true });
}

/**
 * Reorder custom fields
 */
export async function reorderCustomFields(
  entityType: string,
  fieldIds: string[]
): Promise<ActionResponse> {
  return withAuth(async (user) => {
    requireAdmin(user);

    // Update order for each field
    for (let i = 0; i < fieldIds.length; i++) {
      await db.customFieldDefinition.update({
        where: { id: fieldIds[i] },
        data: { order: i, updatedAt: new Date() },
      });
    }

    revalidatePath(`/admin/custom-fields/${entityType}`);

    return { success: true };
  }, { requireAdmin: true });
}
```

---

## **2️⃣ VALUE ACTIONS (User):**

```typescript
// src/server/actions/custom-field-value-actions.ts

'use server';

import { db } from '@/drizzle/db';
import { customFieldDefinitions, customFieldValues } from '@/drizzle/schema';
import { withAuth, createValidationError } from '@/lib/helpers';
import type { ActionResponse } from '@/lib/types';
import { eq, and } from 'drizzle-orm';

/**
 * Save custom field values for an entity
 */
export async function saveCustomFieldValues(params: {
  entityType: 'AUDIT' | 'FINDING' | 'ACTION' | 'DOF';
  entityId: string;
  values: Record<string, any>;
}): Promise<ActionResponse> {
  return withAuth(async (user) => {
    // Get active field definitions
    const definitions = await db.customFieldDefinition.findMany({
      where: and(
        eq(customFieldDefinitions.entityType, params.entityType),
        eq(customFieldDefinitions.status, 'ACTIVE')
      ),
    });

    // Validate required fields
    for (const def of definitions) {
      if (def.required && !params.values[def.fieldKey]) {
        return createValidationError(`${def.label} is required`);
      }
    }

    // Validate field values against validation rules
    for (const def of definitions) {
      const value = params.values[def.fieldKey];
      if (!value) continue;

      // Type-specific validation
      if (def.fieldType === 'number' && def.validation) {
        const num = Number(value);
        if (def.validation.min !== undefined && num < def.validation.min) {
          return createValidationError(
            `${def.label} must be at least ${def.validation.min}`
          );
        }
        if (def.validation.max !== undefined && num > def.validation.max) {
          return createValidationError(
            `${def.label} must be at most ${def.validation.max}`
          );
        }
      }

      if (def.fieldType === 'text' && def.validation) {
        const str = String(value);
        if (def.validation.minLength && str.length < def.validation.minLength) {
          return createValidationError(
            `${def.label} must be at least ${def.validation.minLength} characters`
          );
        }
        if (def.validation.maxLength && str.length > def.validation.maxLength) {
          return createValidationError(
            `${def.label} must be at most ${def.validation.maxLength} characters`
          );
        }
        if (def.validation.pattern) {
          const regex = new RegExp(def.validation.pattern);
          if (!regex.test(str)) {
            return createValidationError(
              `${def.label} format is invalid`
            );
          }
        }
      }
    }

    // Save values (upsert)
    for (const def of definitions) {
      const value = params.values[def.fieldKey];
      
      // Skip if no value and not required
      if (value === undefined || value === null) {
        if (!def.required) continue;
      }

      await db.customFieldValue.upsert({
        where: {
          definitionId_entityId: {
            definitionId: def.id,
            entityId: params.entityId,
          },
        },
        create: {
          definitionId: def.id,
          entityType: params.entityType,
          entityId: params.entityId,
          value,
        },
        update: {
          value,
          updatedAt: new Date(),
        },
      });
    }

    return { success: true };
  });
}

/**
 * Get custom field values for an entity
 */
export async function getCustomFieldValues(
  entityType: 'AUDIT' | 'FINDING' | 'ACTION' | 'DOF',
  entityId: string
): Promise<ActionResponse<Record<string, any>>> {
  return withAuth(async (user) => {
    const values = await db.customFieldValue.findMany({
      where: and(
        eq(customFieldValues.entityType, entityType),
        eq(customFieldValues.entityId, entityId)
      ),
      include: {
        definition: true,
      },
    });

    // Convert to key-value object
    const result = values.reduce((acc, v) => {
      acc[v.definition.fieldKey] = v.value;
      return acc;
    }, {} as Record<string, any>);

    return { success: true, data: result };
  });
}

/**
 * Delete custom field values for an entity
 */
export async function deleteCustomFieldValues(
  entityType: string,
  entityId: string
): Promise<ActionResponse> {
  return withAuth(async (user) => {
    await db.customFieldValue.deleteMany({
      where: and(
        eq(customFieldValues.entityType, entityType),
        eq(customFieldValues.entityId, entityId)
      ),
    });

    return { success: true };
  });
}

/**
 * Get custom field values with definitions (for display)
 */
export async function getCustomFieldValuesWithDefinitions(
  entityType: 'AUDIT' | 'FINDING' | 'ACTION' | 'DOF',
  entityId: string
): Promise<ActionResponse<Array<{
  definition: CustomFieldDefinition;
  value: any;
}>>> {
  return withAuth(async (user) => {
    const values = await db.customFieldValue.findMany({
      where: and(
        eq(customFieldValues.entityType, entityType),
        eq(customFieldValues.entityId, entityId)
      ),
      include: {
        definition: true,
      },
      orderBy: [customFieldDefinitions.order],
    });

    const result = values.map(v => ({
      definition: v.definition,
      value: v.value,
    }));

    return { success: true, data: result };
  });
}
```

---

## **✅ CHECKLIST:**

- [ ] Create `custom-field-definition-actions.ts`
- [ ] Create `custom-field-value-actions.ts`
- [ ] Add type definitions to `lib/types/custom-field.ts`
- [ ] Test CRUD operations
- [ ] Test validation logic
- [ ] Test error handling
- [ ] Add unit tests

---

## **🧪 TESTING:**

```typescript
// Test in Next.js dev console or create test file

// 1. Create custom field
await createCustomFieldDefinition({
  entityType: 'AUDIT',
  fieldKey: 'certificationNumber',
  fieldType: 'text',
  label: 'Certification Number',
  required: true,
  order: 1,
});

// 2. Save values
await saveCustomFieldValues({
  entityType: 'AUDIT',
  entityId: 'audit-id-123',
  values: {
    certificationNumber: 'ISO9001-2024',
  },
});

// 3. Load values
const result = await getCustomFieldValues('AUDIT', 'audit-id-123');
console.log(result.data); // { certificationNumber: 'ISO9001-2024' }

// 4. Test validation
await saveCustomFieldValues({
  entityType: 'AUDIT',
  entityId: 'audit-id-123',
  values: {}, // Missing required field
});
// Should return validation error
```

---

**Status:** ✅ Actions implemented  
**Next:** [React Components](./03-REACT-COMPONENTS.md)
