'use server';

import { db } from '@/core/database/client';
import { customFieldDefinitions, customFieldValues } from '@/core/database/schema';
import { withAuth, createValidationError } from '@/lib/helpers';
import type { ActionResponse, EntityType, CustomFieldWithValue } from '@/types/domain';
import { eq, and } from 'drizzle-orm';

/**
 * Save custom field values for an entity
 */
export async function saveCustomFieldValues(params: {
  entityType: EntityType;
  entityId: string;
  values: Record<string, any>;
}): Promise<ActionResponse> {
  return withAuth(async (user) => {
    // Get active field definitions
    const definitions = await db
      .select()
      .from(customFieldDefinitions)
      .where(
        and(
          eq(customFieldDefinitions.entityType, params.entityType),
          eq(customFieldDefinitions.status, 'ACTIVE')
        )
      );

    // Validate required fields
    for (const def of definitions) {
      if (def.required && !params.values[def.fieldKey]) {
        return createValidationError(`${def.label} is required`);
      }
    }

    // Validate field values against validation rules
    for (const def of definitions) {
      const value = params.values[def.fieldKey];
      if (!value && value !== 0 && value !== false) continue;

      // Type-specific validation
      if (def.fieldType === 'number' && def.validation) {
        const validation = def.validation as any;
        const num = Number(value);
        if (validation.min !== undefined && num < validation.min) {
          return createValidationError(
            `${def.label} must be at least ${validation.min}`
          );
        }
        if (validation.max !== undefined && num > validation.max) {
          return createValidationError(
            `${def.label} must be at most ${validation.max}`
          );
        }
      }

      if ((def.fieldType === 'text' || def.fieldType === 'textarea') && def.validation) {
        const validation = def.validation as any;
        const str = String(value);
        if (validation.minLength && str.length < validation.minLength) {
          return createValidationError(
            `${def.label} must be at least ${validation.minLength} characters`
          );
        }
        if (validation.maxLength && str.length > validation.maxLength) {
          return createValidationError(
            `${def.label} must be at most ${validation.maxLength} characters`
          );
        }
        if (validation.pattern) {
          const regex = new RegExp(validation.pattern);
          if (!regex.test(str)) {
            return createValidationError(`${def.label} format is invalid`);
          }
        }
      }
    }

    // Save values (upsert)
    for (const def of definitions) {
      const value = params.values[def.fieldKey];
      
      // Skip if no value and not required
      if ((value === undefined || value === null) && !def.required) {
        continue;
      }

      // Check if value exists
      const [existing] = await db
        .select()
        .from(customFieldValues)
        .where(
          and(
            eq(customFieldValues.definitionId, def.id),
            eq(customFieldValues.entityId, params.entityId)
          )
        )
        .limit(1);

      if (existing) {
        // Update
        await db
          .update(customFieldValues)
          .set({
            value,
            updatedAt: new Date(),
          })
          .where(eq(customFieldValues.id, existing.id));
      } else {
        // Insert
        await db.insert(customFieldValues).values({
          definitionId: def.id,
          entityType: params.entityType,
          entityId: params.entityId,
          value,
        });
      }
    }

    return { success: true, data: undefined };
  });
}

/**
 * Get custom field values for an entity
 */
export async function getCustomFieldValues(
  entityType: EntityType,
  entityId: string
): Promise<ActionResponse<Record<string, any>>> {
  return withAuth(async (user) => {
    const values = await db
      .select({
        fieldKey: customFieldDefinitions.fieldKey,
        value: customFieldValues.value,
      })
      .from(customFieldValues)
      .innerJoin(
        customFieldDefinitions,
        eq(customFieldValues.definitionId, customFieldDefinitions.id)
      )
      .where(
        and(
          eq(customFieldValues.entityType, entityType),
          eq(customFieldValues.entityId, entityId)
        )
      );

    // Convert to key-value object
    const result: Record<string, any> = {};
    for (const v of values) {
      result[v.fieldKey] = v.value;
    }

    return { success: true, data: result };
  });
}

/**
 * Delete custom field values for an entity
 */
export async function deleteCustomFieldValues(
  entityType: EntityType,
  entityId: string
): Promise<ActionResponse> {
  return withAuth(async (user) => {
    await db
      .delete(customFieldValues)
      .where(
        and(
          eq(customFieldValues.entityType, entityType),
          eq(customFieldValues.entityId, entityId)
        )
      );

    return { success: true, data: undefined };
  });
}

/**
 * Get custom field values with definitions (for display)
 */
export async function getCustomFieldValuesWithDefinitions(
  entityType: EntityType,
  entityId: string
): Promise<ActionResponse<CustomFieldWithValue[]>> {
  return withAuth(async (user) => {
    const results = await db
      .select({
        definition: customFieldDefinitions,
        value: customFieldValues.value,
      })
      .from(customFieldValues)
      .innerJoin(
        customFieldDefinitions,
        eq(customFieldValues.definitionId, customFieldDefinitions.id)
      )
      .where(
        and(
          eq(customFieldValues.entityType, entityType),
          eq(customFieldValues.entityId, entityId),
          eq(customFieldDefinitions.status, 'ACTIVE')
        )
      )
      .orderBy(customFieldDefinitions.order);

    const data: CustomFieldWithValue[] = results.map((r) => ({
      definition: r.definition as any,
      value: r.value,
    }));

    return { success: true, data };
  });
}

/**
 * Bulk update custom field values
 */
export async function bulkUpdateCustomFieldValues(
  updates: Array<{
    entityType: EntityType;
    entityId: string;
    fieldKey: string;
    value: any;
  }>
): Promise<ActionResponse> {
  return withAuth(async (user) => {
    for (const update of updates) {
      // Get definition
      const [definition] = await db
        .select()
        .from(customFieldDefinitions)
        .where(
          and(
            eq(customFieldDefinitions.entityType, update.entityType),
            eq(customFieldDefinitions.fieldKey, update.fieldKey)
          )
        )
        .limit(1);

      if (!definition) continue;

      // Upsert value
      const [existing] = await db
        .select()
        .from(customFieldValues)
        .where(
          and(
            eq(customFieldValues.definitionId, definition.id),
            eq(customFieldValues.entityId, update.entityId)
          )
        )
        .limit(1);

      if (existing) {
        await db
          .update(customFieldValues)
          .set({ value: update.value, updatedAt: new Date() })
          .where(eq(customFieldValues.id, existing.id));
      } else {
        await db.insert(customFieldValues).values({
          definitionId: definition.id,
          entityType: update.entityType,
          entityId: update.entityId,
          value: update.value,
        });
      }
    }

    return { success: true, data: undefined };
  });
}
