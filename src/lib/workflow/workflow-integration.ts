/**
 * GENERIC WORKFLOW INTEGRATION HELPERS - FRAMEWORK CORE
 * Entity-agnostic helpers for integrating workflows with any domain module
 * 
 * Usage:
 * 1. Use getWorkflowDefinitionId() to find workflows by name
 * 2. Use buildEntityMetadata() to prepare metadata for workflow
 * 3. Domain modules should create their own specific helpers
 * 
 * Created: 2025-01-25
 * Refactored: 2025-11-17 (Framework Core)
 */

import { db } from "@/drizzle/db";
import { workflowDefinitions } from "@/drizzle/schema";
import { eq, and } from "drizzle-orm";
import { getCustomFieldValues } from "@/server/actions/custom-field-value-actions";

/**
 * Cache for workflow definition IDs (to avoid repeated DB queries)
 */
const workflowIdCache = new Map<string, string>();

/**
 * CORE HELPERS - Generic, reusable across all modules
 */

/**
 * Get workflow definition ID by name
 * Generic helper - works for any workflow
 */
export async function getWorkflowDefinitionId(name: string): Promise<string | null> {
  // Check cache first
  if (workflowIdCache.has(name)) {
    return workflowIdCache.get(name)!;
  }

  // Query database
  const definition = await db.query.workflowDefinitions.findFirst({
    where: and(
      eq(workflowDefinitions.name, name),
      eq(workflowDefinitions.isActive, true)
    ),
  });

  if (definition) {
    workflowIdCache.set(name, definition.id);
    return definition.id;
  }

  return null;
}

/**
 * GENERIC ENTITY WORKFLOW HELPERS
 * These helpers work for any entity type
 */

/**
 * Get workflow definition by entity type
 * Generic helper - finds default workflow for an entity type
 */
export async function getWorkflowByEntityType(entityType: string): Promise<string | null> {
  const definition = await db.query.workflowDefinitions.findFirst({
    where: and(
      eq(workflowDefinitions.entityType, entityType),
      eq(workflowDefinitions.isActive, true)
    ),
  });

  return definition?.id || null;
}

/**
 * Build generic entity metadata for workflows
 * Includes custom fields automatically
 * 
 * @param entityType - The type of entity (e.g., 'User', 'Order', 'Invoice')
 * @param entityId - The ID of the entity
 * @param coreFields - Core fields from your entity
 * @returns Metadata object ready for workflow
 * 
 * @example
 * const metadata = await buildEntityMetadata('ORDER', orderId, {
 *   priority: order.priority,
 *   amount: order.total,
 *   customerId: order.customerId
 * });
 */
export async function buildEntityMetadata(
  entityType: string,
  entityId: string,
  coreFields: Record<string, any> = {}
) {
  // Load custom fields if defined for this entity
  let customFields = {};
  try {
    const customFieldsResult = await getCustomFieldValues(entityType, entityId);
    if (customFieldsResult.success && customFieldsResult.data) {
      customFields = customFieldsResult.data;
    }
  } catch (error) {
    console.warn(`No custom fields found for ${entityType}:${entityId}`);
  }

  return {
    entityType,
    entityId,
    ...coreFields,
    customFields,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Clear workflow ID cache (for testing or when definitions change)
 */
export function clearWorkflowIdCache() {
  workflowIdCache.clear();
}

/**
 * Get all workflow definition IDs (for debugging)
 */
export async function getAllWorkflowDefinitions() {
  const definitions = await db.query.workflowDefinitions.findMany({
    where: eq(workflowDefinitions.isActive, true),
  });

  return definitions.map((d) => ({
    id: d.id,
    name: d.name,
    entityType: d.entityType,
  }));
}
