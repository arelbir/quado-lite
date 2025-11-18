'use server';

import { db } from '@/core/database/client';
import { customFieldDefinitions } from '@/core/database/schema';
import { withAuth, createValidationError, createNotFoundError, createPermissionError } from '@/lib/helpers';
import { checkPermission } from '@/core/permissions/unified-permission-checker';
import { revalidatePath } from 'next/cache';
import type { ActionResponse, CustomFieldDefinition, EntityType } from '@/types/domain';
import { eq, and } from 'drizzle-orm';

/**
 * Get all custom field definitions for an entity type
 */
export async function getCustomFieldDefinitions(
  entityType: EntityType
): Promise<ActionResponse<CustomFieldDefinition[]>> {
  return withAuth(async (user: any) => {
    // ✅ UNIFIED PERMISSION CHECK
    const perm = await checkPermission({
      user,
      resource: "custom-field",
      action: "read",
    });

    if (!perm.allowed) {
      return createPermissionError(perm.reason || "Permission denied");
    }

    const fields = await db
      .select()
      .from(customFieldDefinitions)
      .where(
        and(
          eq(customFieldDefinitions.entityType, entityType),
          eq(customFieldDefinitions.status, 'ACTIVE')
        )
      )
      .orderBy(customFieldDefinitions.order, customFieldDefinitions.createdAt);

    return { success: true, data: fields as CustomFieldDefinition[] };
  });
}

/**
 * Create a new custom field definition
 */
export async function createCustomFieldDefinition(data: {
  entityType: EntityType;
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
  return withAuth(async (user: any) => {
    // ✅ UNIFIED PERMISSION CHECK
    const perm = await checkPermission({
      user,
      resource: "custom-field",
      action: "create",
    });

    if (!perm.allowed) {
      return createPermissionError(perm.reason || "Permission denied");
    }

    // Validate field key uniqueness
    const existing = await db
      .select()
      .from(customFieldDefinitions)
      .where(
        and(
          eq(customFieldDefinitions.entityType, data.entityType),
          eq(customFieldDefinitions.fieldKey, data.fieldKey)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return createValidationError(
        `Field with key "${data.fieldKey}" already exists for ${data.entityType}`
      );
    }

    // Create field
    const [field] = await db
      .insert(customFieldDefinitions)
      .values({
        entityType: data.entityType,
        fieldKey: data.fieldKey,
        fieldType: data.fieldType,
        label: data.label,
        placeholder: data.placeholder,
        helpText: data.helpText,
        required: data.required ?? false,
        validation: data.validation,
        options: data.options,
        section: data.section,
        order: data.order ?? 0,
        status: 'ACTIVE',
        createdBy: user.id,
      })
      .returning();

    revalidatePath(`/admin/custom-fields/${data.entityType}`);

    return { success: true, data: field as CustomFieldDefinition };
  });
}

/**
 * Update custom field definition
 */
export async function updateCustomFieldDefinition(
  id: string,
  data: Partial<CustomFieldDefinition>
): Promise<ActionResponse<CustomFieldDefinition>> {
  return withAuth(async (user: any) => {
    // ✅ UNIFIED PERMISSION CHECK
    const perm = await checkPermission({
      user,
      resource: "custom-field",
      action: "update",
    });

    if (!perm.allowed) {
      return createPermissionError(perm.reason || "Permission denied");
    }

    const [existing] = await db
      .select()
      .from(customFieldDefinitions)
      .where(eq(customFieldDefinitions.id, id))
      .limit(1);

    if (!existing) {
      return createNotFoundError('Custom field');
    }

    const [updated] = await db
      .update(customFieldDefinitions)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(customFieldDefinitions.id, id))
      .returning();

    revalidatePath(`/admin/custom-fields/${existing.entityType}`);

    return { success: true, data: updated as CustomFieldDefinition };
  });
}

/**
 * Delete (archive) custom field definition
 */
export async function deleteCustomFieldDefinition(
  id: string
): Promise<ActionResponse> {
  return withAuth(async (user: any) => {
    // ✅ UNIFIED PERMISSION CHECK
    const perm = await checkPermission({
      user,
      resource: "custom-field",
      action: "delete",
    });

    if (!perm.allowed) {
      return createPermissionError(perm.reason || "Permission denied");
    }

    const [existing] = await db
      .select()
      .from(customFieldDefinitions)
      .where(eq(customFieldDefinitions.id, id))
      .limit(1);

    if (!existing) {
      return createNotFoundError('Custom field');
    }

    // Soft delete (archive)
    await db
      .update(customFieldDefinitions)
      .set({
        status: 'ARCHIVED',
        updatedAt: new Date(),
      })
      .where(eq(customFieldDefinitions.id, id));

    revalidatePath(`/admin/custom-fields/${existing.entityType}`);

    return { success: true, data: undefined };
  });
}

/**
 * Reorder custom fields
 */
export async function reorderCustomFields(
  entityType: EntityType,
  fieldIds: string[]
): Promise<ActionResponse> {
  return withAuth(async (user: any) => {
    // ✅ UNIFIED PERMISSION CHECK
    const perm = await checkPermission({
      user,
      resource: "custom-field",
      action: "update",
    });

    if (!perm.allowed) {
      return createPermissionError(perm.reason || "Permission denied");
    }

    // Update order for each field
    for (let i = 0; i < fieldIds.length; i++) {
      const fieldId = fieldIds[i];
      if (!fieldId) continue;
      
      await db
        .update(customFieldDefinitions)
        .set({
          order: i,
          updatedAt: new Date(),
        })
        .where(eq(customFieldDefinitions.id, fieldId));
    }

    revalidatePath(`/admin/custom-fields/${entityType}`);

    return { success: true, data: undefined };
  });
}

/**
 * Get custom field definition by ID
 */
export async function getCustomFieldDefinitionById(
  id: string
): Promise<ActionResponse<CustomFieldDefinition>> {
  return withAuth(async (user: any) => {
    // ✅ UNIFIED PERMISSION CHECK
    const perm = await checkPermission({
      user,
      resource: "custom-field",
      action: "read",
    });

    if (!perm.allowed) {
      return createPermissionError(perm.reason || "Permission denied");
    }

    const [field] = await db
      .select()
      .from(customFieldDefinitions)
      .where(eq(customFieldDefinitions.id, id))
      .limit(1);

    if (!field) {
      return createNotFoundError('Custom field');
    }

    return { success: true, data: field as CustomFieldDefinition };
  });
}
