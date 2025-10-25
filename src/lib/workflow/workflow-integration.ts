/**
 * WORKFLOW INTEGRATION HELPERS
 * Helper functions for integrating workflow system with modules
 * 
 * Created: 2025-01-25
 */

import { db } from "@/drizzle/db";
import { workflowDefinitions } from "@/drizzle/schema";
import { eq, and } from "drizzle-orm";

/**
 * Cache for workflow definition IDs (to avoid repeated DB queries)
 */
const workflowIdCache = new Map<string, string>();

/**
 * Get workflow definition ID by name
 */
async function getWorkflowDefinitionId(name: string): Promise<string | null> {
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
 * AUDIT MODULE INTEGRATION
 */

/**
 * Determine which audit workflow to use based on audit properties
 */
export async function getAuditWorkflowId(auditData: {
  riskLevel?: string;
  totalScore?: number;
  departmentId?: string;
  findingsCount?: number;
}): Promise<string | null> {
  // High-risk audits or many findings use critical flow (manager approval required)
  if (
    auditData.riskLevel === "high" || 
    (auditData.totalScore && auditData.totalScore > 80) ||
    (auditData.findingsCount && auditData.findingsCount > 5)
  ) {
    return await getWorkflowDefinitionId("Audit Critical Flow");
  }

  // Normal audits use normal flow (simple review)
  return await getWorkflowDefinitionId("Audit Normal Flow");
}

/**
 * Build audit workflow metadata
 */
export function buildAuditMetadata(audit: any) {
  return {
    riskLevel: audit.riskLevel || "medium",
    department: audit.departmentId,
    auditor: audit.auditorId || audit.createdById,
    templateId: audit.templateId,
    totalScore: audit.totalScore || 0,
    findingsCount: audit.findingsCount || 0,
    completedDate: audit.updatedAt,
  };
}

/**
 * Get audit completion workflow ID (for closure approval)
 */
export async function getAuditCompletionWorkflowId(): Promise<string | null> {
  return await getWorkflowDefinitionId("Audit Completion Flow");
}

/**
 * ACTION MODULE INTEGRATION
 */

/**
 * Determine which action workflow to use
 */
export async function getActionWorkflowId(actionData: {
  priority?: string;
  type?: string;
  findingId?: string;
}): Promise<string | null> {
  // High priority or corrective actions use complex flow (4 steps)
  if (actionData.priority === "high" || actionData.type === "Corrective") {
    return await getWorkflowDefinitionId("Action Complex Flow");
  }

  // Normal actions use quick flow (2 steps)
  return await getWorkflowDefinitionId("Action Quick Flow");
}

/**
 * Build action workflow metadata
 */
export function buildActionMetadata(action: any) {
  return {
    priority: action.priority || "medium",
    type: action.type,
    findingId: action.findingId,
    assignedTo: action.assignedToId,
    dueDate: action.dueDate,
  };
}

/**
 * DOF MODULE INTEGRATION
 */

/**
 * Get DOF workflow ID (always uses standard CAPA flow)
 */
export async function getDofWorkflowId(): Promise<string | null> {
  return await getWorkflowDefinitionId("DOF Standard CAPA Flow");
}

/**
 * Build DOF workflow metadata
 */
export function buildDofMetadata(dof: any) {
  return {
    findingId: dof.findingId,
    currentStep: dof.currentStep || 1,
    assignedTo: dof.assignedToId,
    managerId: dof.managerId,
  };
}

/**
 * FINDING MODULE INTEGRATION
 */

/**
 * Get finding workflow ID (closure flow)
 */
export async function getFindingWorkflowId(): Promise<string | null> {
  return await getWorkflowDefinitionId("Finding Closure Flow");
}

/**
 * Build finding workflow metadata
 */
export function buildFindingMetadata(finding: any) {
  return {
    severity: finding.severity,
    riskLevel: finding.riskLevel,
    hasActions: finding.actions?.length > 0,
    assignedTo: finding.assignedToId,
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
