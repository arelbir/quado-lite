'use server';

/**
 * FORM SUBMISSION ACTIONS
 * Handle form submissions and responses
 */

import { db } from '@/core/database/client';
import { formSubmissions, formDefinitions } from '@/core/database/schema/forms';
import { eq, desc, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { withAuth, createPermissionError } from '@/lib/helpers';
import { validateFormData } from '../lib/validation-engine';

/**
 * Create submission (save draft or submit)
 */
export async function createSubmission(data: {
  formId: string;
  data: Record<string, any>;
  status?: 'draft' | 'submitted';
  workflowInstanceId?: string;
  workflowStepId?: string;
  attachments?: any[];
}): Promise<any> {
  return withAuth<any>(async (user: any) => {
    try {
      // Get form definition
      const form = await db.query.formDefinitions.findFirst({
        where: eq(formDefinitions.id, data.formId),
      });

      if (!form) {
        return { success: false, error: 'Form not found' };
      }

      // Validate if submitting (not draft)
      if (data.status === 'submitted') {
        const validation = validateFormData(form.schema as any, data.data);
        if (!validation.valid) {
          return {
            success: false,
            error: 'Validation failed',
            validationErrors: validation.errors,
          };
        }
      }

      const [submission] = await db
        .insert(formSubmissions)
        .values({
          formId: data.formId,
          formVersion: form.version,
          data: data.data as any,
          status: data.status || 'draft',
          submittedBy: data.status === 'submitted' ? user.id : undefined,
          submittedAt: data.status === 'submitted' ? new Date() : undefined,
          workflowInstanceId: data.workflowInstanceId,
          workflowStepId: data.workflowStepId,
          attachments: data.attachments as any,
        })
        .returning();

      revalidatePath('/admin/forms');
      return { success: true, data: submission };
    } catch (error) {
      console.error('[createSubmission] Error:', error);
      return { success: false, error: 'Failed to create submission' };
    }
  });
}

/**
 * Update submission (update draft)
 */
export async function updateSubmission(
  id: string,
  data: {
    data?: Record<string, any>;
    status?: 'draft' | 'submitted' | 'approved' | 'rejected';
    attachments?: any[];
  }
): Promise<any> {
  return withAuth<any>(async (user: any) => {
    try {
      const existing = await db.query.formSubmissions.findFirst({
        where: eq(formSubmissions.id, id),
      });

      if (!existing) {
        return { success: false, error: 'Submission not found' };
      }

      // Validate if changing to submitted
      if (data.status === 'submitted' && existing.status === 'draft') {
        const form = await db.query.formDefinitions.findFirst({
          where: eq(formDefinitions.id, existing.formId),
        });

        if (form) {
          const validation = validateFormData(
            form.schema as any,
            data.data || existing.data
          );
          if (!validation.valid) {
            return {
              success: false,
              error: 'Validation failed',
              validationErrors: validation.errors,
            };
          }
        }
      }

      await db
        .update(formSubmissions)
        .set({
          ...data,
          data: data.data as any,
          submittedBy: data.status === 'submitted' ? user.id : existing.submittedBy,
          submittedAt: data.status === 'submitted' ? new Date() : existing.submittedAt,
          updatedAt: new Date(),
        })
        .where(eq(formSubmissions.id, id));

      revalidatePath('/admin/forms');
      return { success: true, data: null };
    } catch (error) {
      console.error('[updateSubmission] Error:', error);
      return { success: false, error: 'Failed to update submission' };
    }
  });
}

/**
 * Get submission by ID
 */
export async function getSubmissionById(id: string): Promise<any> {
  return withAuth<any>(async (user: any) => {
    try {
      const submission = await db.query.formSubmissions.findFirst({
        where: eq(formSubmissions.id, id),
        with: {
          form: true,
          submittedBy: {
            columns: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!submission) {
        return { success: false, error: 'Submission not found' };
      }

      return { success: true, data: submission };
    } catch (error) {
      console.error('[getSubmissionById] Error:', error);
      return { success: false, error: 'Failed to load submission' };
    }
  });
}

/**
 * List submissions for a form
 */
export async function listSubmissions(formId: string, options?: {
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<any> {
  return withAuth<any>(async (user: any) => {
    try {
      const conditions = [eq(formSubmissions.formId, formId)];

      if (options?.status) {
        conditions.push(eq(formSubmissions.status, options.status as any));
      }

      const submissions = await db.query.formSubmissions.findMany({
        where: and(...conditions),
        orderBy: desc(formSubmissions.createdAt),
        limit: options?.limit || 50,
        offset: options?.offset || 0,
        with: {
          submittedBy: {
            columns: {
              id: true,
              name: true,
            },
          },
        },
      });

      return { success: true, data: submissions };
    } catch (error) {
      console.error('[listSubmissions] Error:', error);
      return { success: false, error: 'Failed to load submissions' };
    }
  });
}

/**
 * Delete submission
 */
export async function deleteSubmission(id: string): Promise<any> {
  return withAuth<any>(async (user: any) => {
    try {
      await db.delete(formSubmissions).where(eq(formSubmissions.id, id));
      revalidatePath('/admin/forms');
      return { success: true, data: null };
    } catch (error) {
      console.error('[deleteSubmission] Error:', error);
      return { success: false, error: 'Failed to delete submission' };
    }
  });
}

/**
 * Approve/Reject submission
 */
export async function updateSubmissionStatus(
  id: string,
  status: 'approved' | 'rejected',
  comment?: string
): Promise<any> {
  return updateSubmission(id, { status });
}
