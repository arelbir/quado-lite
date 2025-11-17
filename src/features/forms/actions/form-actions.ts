'use server';

/**
 * FORM CRUD ACTIONS
 * Server actions for form builder management
 */

import { db } from '@/core/database/client';
import { formDefinitions, formVersions, formSubmissions } from '@/core/database/schema/forms';
import { eq, desc, and, or, ilike } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { withAuth, createPermissionError } from '@/lib/helpers';
import { checkPermission } from '@/core/permissions/unified-permission-checker';
import { FormSchema } from '../types/json-schema';

/**
 * Create new form
 */
export async function createForm(data: {
  name: string;
  description?: string;
  schema: FormSchema;
  category?: string;
  tags?: string[];
  workflowId?: string;
}): Promise<any> {
  return withAuth<any>(async (user: any) => {
    const perm = await checkPermission({
      user,
      resource: 'form',
      action: 'create',
    });

    if (!perm.allowed) {
      return createPermissionError(perm.reason || 'Permission denied');
    }

    try {
      const [form] = await db
        .insert(formDefinitions)
        .values({
          name: data.name,
          description: data.description,
          schema: data.schema as any,
          category: data.category,
          tags: data.tags,
          workflowId: data.workflowId,
          version: 1,
          status: 'draft',
          createdById: user.id,
        })
        .returning();

      // Create initial version
      if (form) {
        await db.insert(formVersions).values({
          formId: form.id,
          version: 1,
          schema: data.schema as any,
          changeDescription: 'Initial version',
          createdById: user.id,
        });
      }

      revalidatePath('/admin/forms');
      return { success: true, data: form };
    } catch (error) {
      console.error('[createForm] Error:', error);
      return { success: false, error: 'Failed to create form' };
    }
  });
}

/**
 * Update form
 */
export async function updateForm(
  id: string,
  data: {
    name?: string;
    description?: string;
    schema?: FormSchema;
    category?: string;
    tags?: string[];
    status?: 'draft' | 'published' | 'archived';
  },
  createNewVersion: boolean = false
): Promise<any> {
  return withAuth<any>(async (user: any) => {
    const perm = await checkPermission({
      user,
      resource: 'form',
      action: 'update',
    });

    if (!perm.allowed) {
      return createPermissionError(perm.reason || 'Permission denied');
    }

    try {
      const existingForm = await db.query.formDefinitions.findFirst({
        where: eq(formDefinitions.id, id),
      });

      if (!existingForm) {
        return { success: false, error: 'Form not found' };
      }

      // If schema changed and versioning enabled
      if (data.schema && createNewVersion) {
        const newVersion = existingForm.version + 1;

        // Create new version
        await db.insert(formVersions).values({
          formId: id,
          version: newVersion,
          schema: data.schema as any,
          changeDescription: 'Updated version',
          createdById: user.id,
        });

        // Update form with new version
        await db
          .update(formDefinitions)
          .set({
            schema: data.schema as any,
            version: newVersion,
            updatedAt: new Date(),
            updatedById: user.id,
          })
          .where(eq(formDefinitions.id, id));
      } else {
        // Regular update
        await db
          .update(formDefinitions)
          .set({
            ...data,
            schema: data.schema as any,
            updatedAt: new Date(),
            updatedById: user.id,
          })
          .where(eq(formDefinitions.id, id));
      }

      revalidatePath('/admin/forms');
      revalidatePath(`/admin/forms/${id}`);
      return { success: true, data: null };
    } catch (error) {
      console.error('[updateForm] Error:', error);
      return { success: false, error: 'Failed to update form' };
    }
  });
}

/**
 * Delete form
 */
export async function deleteForm(id: string): Promise<any> {
  return withAuth<any>(async (user: any) => {
    const perm = await checkPermission({
      user,
      resource: 'form',
      action: 'delete',
    });

    if (!perm.allowed) {
      return createPermissionError(perm.reason || 'Permission denied');
    }

    try {
      // Soft delete - archive it
      await db
        .update(formDefinitions)
        .set({
          status: 'archived',
          updatedAt: new Date(),
          updatedById: user.id,
        })
        .where(eq(formDefinitions.id, id));

      revalidatePath('/admin/forms');
      return { success: true, data: null };
    } catch (error) {
      console.error('[deleteForm] Error:', error);
      return { success: false, error: 'Failed to delete form' };
    }
  });
}

/**
 * Get form by ID
 */
export async function getFormById(id: string): Promise<any> {
  return withAuth<any>(async (user: any) => {
    try {
      const form = await db.query.formDefinitions.findFirst({
        where: eq(formDefinitions.id, id),
        with: {
          createdBy: {
            columns: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!form) {
        return { success: false, error: 'Form not found' };
      }

      return { success: true, data: form };
    } catch (error) {
      console.error('[getFormById] Error:', error);
      return { success: false, error: 'Failed to load form' };
    }
  });
}

/**
 * List forms
 */
export async function listForms(options?: {
  category?: string;
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<any> {
  return withAuth<any>(async (user: any) => {
    try {
      const conditions = [];

      if (options?.category) {
        conditions.push(eq(formDefinitions.category, options.category));
      }

      if (options?.status) {
        conditions.push(eq(formDefinitions.status, options.status as any));
      }

      if (options?.search) {
        conditions.push(
          or(
            ilike(formDefinitions.name, `%${options.search}%`),
            ilike(formDefinitions.description, `%${options.search}%`)
          )
        );
      }

      const forms = await db.query.formDefinitions.findMany({
        where: conditions.length > 0 ? and(...conditions) : undefined,
        orderBy: desc(formDefinitions.createdAt),
        limit: options?.limit || 50,
        offset: options?.offset || 0,
        with: {
          createdBy: {
            columns: {
              id: true,
              name: true,
            },
          },
        },
      });

      return { success: true, data: forms };
    } catch (error) {
      console.error('[listForms] Error:', error);
      return { success: false, error: 'Failed to load forms' };
    }
  });
}

/**
 * Publish form
 */
export async function publishForm(id: string): Promise<any> {
  return updateForm(id, { status: 'published' }, false);
}

/**
 * Duplicate form
 */
export async function duplicateForm(id: string, newName: string): Promise<any> {
  return withAuth<any>(async (user: any) => {
    try {
      const original = await db.query.formDefinitions.findFirst({
        where: eq(formDefinitions.id, id),
      });

      if (!original) {
        return { success: false, error: 'Form not found' };
      }

      return createForm({
        name: newName,
        description: original.description || undefined,
        schema: original.schema as FormSchema,
        category: original.category || undefined,
        tags: (original.tags as string[]) || undefined,
      });
    } catch (error) {
      console.error('[duplicateForm] Error:', error);
      return { success: false, error: 'Failed to duplicate form' };
    }
  });
}

/**
 * Get form versions
 */
export async function getFormVersions(formId: string): Promise<any> {
  return withAuth<any>(async (user: any) => {
    try {
      const versions = await db.query.formVersions.findMany({
        where: eq(formVersions.formId, formId),
        orderBy: desc(formVersions.version),
        with: {
          createdBy: {
            columns: {
              id: true,
              name: true,
            },
          },
        },
      });

      return { success: true, data: versions };
    } catch (error) {
      console.error('[getFormVersions] Error:', error);
      return { success: false, error: 'Failed to load versions' };
    }
  });
}

/**
 * Restore form version
 */
export async function restoreFormVersion(formId: string, version: number): Promise<any> {
  return withAuth<any>(async (user: any) => {
    try {
      const versionData = await db.query.formVersions.findFirst({
        where: and(
          eq(formVersions.formId, formId),
          eq(formVersions.version, version)
        ),
      });

      if (!versionData) {
        return { success: false, error: 'Version not found' };
      }

      return updateForm(
        formId,
        { schema: versionData.schema as FormSchema },
        true
      );
    } catch (error) {
      console.error('[restoreFormVersion] Error:', error);
      return { success: false, error: 'Failed to restore version' };
    }
  });
}
