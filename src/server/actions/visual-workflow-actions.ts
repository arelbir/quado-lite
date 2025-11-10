'use server';

import { db } from '@/drizzle/db';
import { visualWorkflow, visualWorkflowVersion } from '@/drizzle/schema';
import { eq, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { withAuth, createPermissionError } from '@/lib/helpers';
import { checkPermission } from '@/lib/permissions/unified-permission-checker';

/**
 * Create new visual workflow
 */
export async function createVisualWorkflow(data: {
  name: string;
  description?: string;
  module: 'DOF' | 'ACTION' | 'FINDING' | 'AUDIT';
  nodes: any[];
  edges: any[];
}): Promise<any> {
  return withAuth<any>(async (user: any) => {
    // ✅ UNIFIED PERMISSION CHECK
    const perm = await checkPermission({
      user,
      resource: "workflow",
      action: "create",
    });

    if (!perm.allowed) {
      return createPermissionError(perm.reason || "Permission denied");
    }

    try {

    const [workflow] = await db
      .insert(visualWorkflow)
      .values({
        name: data.name,
        description: data.description,
        module: data.module,
        nodes: data.nodes,
        edges: data.edges,
        status: 'DRAFT',
        version: '1.0',
        createdById: user.id,
      })
      .returning();

      revalidatePath('/admin/workflows');
      return { success: true, data: workflow };
    } catch (error) {
      console.error('[createVisualWorkflow] Error:', error);
      return { success: false, error: 'Failed to create workflow' };
    }
  });
}

/**
 * Update visual workflow
 */
export async function updateVisualWorkflow(
  id: string,
  data: {
    name?: string;
    description?: string;
    nodes?: any[];
    edges?: any[];
    version?: string;
  }
): Promise<any> {
  return withAuth<any>(async (user: any) => {
    // ✅ UNIFIED PERMISSION CHECK
    const perm = await checkPermission({
      user,
      resource: "workflow",
      action: "update",
    });

    if (!perm.allowed) {
      return createPermissionError(perm.reason || "Permission denied");
    }

    try {

    const [workflow] = await db
      .update(visualWorkflow)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(visualWorkflow.id, id))
      .returning();

    if (!workflow) {
      return { success: false, error: 'Workflow not found' };
    }

      revalidatePath('/admin/workflows');
      revalidatePath(`/admin/workflows/${id}`);
      return { success: true, data: workflow };
    } catch (error) {
      console.error('[updateVisualWorkflow] Error:', error);
      return { success: false, error: 'Failed to update workflow' };
    }
  });
}

/**
 * Save workflow version
 */
export async function saveWorkflowVersion(
  workflowId: string,
  data: {
    version: string;
    changeNotes?: string;
    nodes: any[];
    edges: any[];
  }
): Promise<any> {
  return withAuth<any>(async (user: any) => {
    // ✅ UNIFIED PERMISSION CHECK
    const perm = await checkPermission({
      user,
      resource: "workflow",
      action: "create",
    });

    if (!perm.allowed) {
      return createPermissionError(perm.reason || "Permission denied");
    }

    try {

    const [version] = await db
      .insert(visualWorkflowVersion)
      .values({
        workflowId,
        version: data.version,
        changeNotes: data.changeNotes,
        nodes: data.nodes,
        edges: data.edges,
        createdById: user.id,
      })
      .returning();

      revalidatePath(`/admin/workflows/${workflowId}`);
      return { success: true, data: version };
    } catch (error) {
      console.error('[saveWorkflowVersion] Error:', error);
      return { success: false, error: 'Failed to save version' };
    }
  });
}

/**
 * Publish workflow (make it ACTIVE)
 */
export async function publishVisualWorkflow(id: string): Promise<any> {
  return withAuth<any>(async (user: any) => {
    // ✅ UNIFIED PERMISSION CHECK
    const perm = await checkPermission({
      user,
      resource: "workflow",
      action: "update",
    });

    if (!perm.allowed) {
      return createPermissionError(perm.reason || "Permission denied");
    }

    try {

    const [workflow] = await db
      .update(visualWorkflow)
      .set({
        status: 'ACTIVE',
        publishedAt: new Date(),
        publishedById: user.id,
        updatedAt: new Date(),
      })
      .where(eq(visualWorkflow.id, id))
      .returning();

    if (!workflow) {
      return { success: false, error: 'Workflow not found' };
    }

      revalidatePath('/admin/workflows');
      revalidatePath(`/admin/workflows/${id}`);
      return { success: true, data: workflow };
    } catch (error) {
      console.error('[publishVisualWorkflow] Error:', error);
      return { success: false, error: 'Failed to publish workflow' };
    }
  });
}

/**
 * Archive workflow
 */
export async function archiveVisualWorkflow(id: string): Promise<any> {
  return withAuth<any>(async (user: any) => {
    // ✅ UNIFIED PERMISSION CHECK
    const perm = await checkPermission({
      user,
      resource: "workflow",
      action: "update",
    });

    if (!perm.allowed) {
      return createPermissionError(perm.reason || "Permission denied");
    }

    try {

    const [workflow] = await db
      .update(visualWorkflow)
      .set({
        status: 'ARCHIVED',
        updatedAt: new Date(),
      })
      .where(eq(visualWorkflow.id, id))
      .returning();

    if (!workflow) {
      return { success: false, error: 'Workflow not found' };
    }

      revalidatePath('/admin/workflows');
      revalidatePath(`/admin/workflows/${id}`);
      return { success: true, data: workflow };
    } catch (error) {
      console.error('[archiveVisualWorkflow] Error:', error);
      return { success: false, error: 'Failed to archive workflow' };
    }
  });
}

/**
 * Get all workflows
 */
export async function getVisualWorkflows(): Promise<any> {
  return withAuth<any>(async (user: any) => {
    // ✅ UNIFIED PERMISSION CHECK
    const perm = await checkPermission({
      user,
      resource: "workflow",
      action: "read",
    });

    if (!perm.allowed) {
      return createPermissionError(perm.reason || "Permission denied");
    }

    try {
      const workflows = await db.query.visualWorkflow.findMany({
      with: {
        createdBy: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: [desc(visualWorkflow.updatedAt)],
    });

      return { success: true, data: workflows };
    } catch (error) {
      console.error('[getVisualWorkflows] Error:', error);
      return { success: false, error: 'Failed to fetch workflows' };
    }
  });
}

/**
 * Get workflow by ID
 */
export async function getVisualWorkflowById(id: string): Promise<any> {
  return withAuth<any>(async (user: any) => {
    // ✅ UNIFIED PERMISSION CHECK
    const perm = await checkPermission({
      user,
      resource: "workflow",
      action: "read",
    });

    if (!perm.allowed) {
      return createPermissionError(perm.reason || "Permission denied");
    }

    try {
      const workflow = await db.query.visualWorkflow.findFirst({
      where: eq(visualWorkflow.id, id),
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

    if (!workflow) {
      return { success: false, error: 'Workflow not found' };
    }

      return { success: true, data: workflow };
    } catch (error) {
      console.error('[getVisualWorkflowById] Error:', error);
      return { success: false, error: 'Failed to fetch workflow' };
    }
  });
}

/**
 * Get workflow versions
 */
export async function getWorkflowVersions(workflowId: string): Promise<any> {
  return withAuth<any>(async (user: any) => {
    // ✅ UNIFIED PERMISSION CHECK
    const perm = await checkPermission({
      user,
      resource: "workflow",
      action: "read",
    });

    if (!perm.allowed) {
      return createPermissionError(perm.reason || "Permission denied");
    }

    try {
      const versions = await db.query.visualWorkflowVersion.findMany({
      where: eq(visualWorkflowVersion.workflowId, workflowId),
      with: {
        createdBy: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: [desc(visualWorkflowVersion.createdAt)],
    });

      return { success: true, data: versions };
    } catch (error) {
      console.error('[getWorkflowVersions] Error:', error);
      return { success: false, error: 'Failed to fetch versions' };
    }
  });
}

/**
 * Restore archived workflow (make it DRAFT)
 */
export async function restoreVisualWorkflow(id: string): Promise<any> {
  return withAuth<any>(async (user: any) => {
    // ✅ UNIFIED PERMISSION CHECK
    const perm = await checkPermission({
      user,
      resource: "workflow",
      action: "update",
    });

    if (!perm.allowed) {
      return createPermissionError(perm.reason || "Permission denied");
    }

    try {

    const [workflow] = await db
      .update(visualWorkflow)
      .set({
        status: 'DRAFT',
        updatedAt: new Date(),
      })
      .where(eq(visualWorkflow.id, id))
      .returning();

    if (!workflow) {
      return { success: false, error: 'Workflow not found' };
    }

      revalidatePath('/admin/workflows');
      revalidatePath(`/admin/workflows/${id}`);
      return { success: true, data: workflow };
    } catch (error) {
      console.error('[restoreVisualWorkflow] Error:', error);
      return { success: false, error: 'Failed to restore workflow' };
    }
  });
}

/**
 * Delete workflow
 */
export async function deleteVisualWorkflow(id: string): Promise<any> {
  return withAuth<any>(async (user: any) => {
    // ✅ UNIFIED PERMISSION CHECK
    const perm = await checkPermission({
      user,
      resource: "workflow",
      action: "delete",
    });

    if (!perm.allowed) {
      return createPermissionError(perm.reason || "Permission denied");
    }

    try {

    await db.delete(visualWorkflow).where(eq(visualWorkflow.id, id));

      revalidatePath('/admin/workflows');
      return { success: true, data: undefined };
    } catch (error) {
      console.error('[deleteVisualWorkflow] Error:', error);
      return { success: false, error: 'Failed to delete workflow' };
    }
  });
}
