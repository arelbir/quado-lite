"use server";

import { db } from "@/drizzle/db";
import {
  workflowDefinitions,
  workflowInstances,
  stepAssignments,
  workflowTimeline,
  workflowDelegations,
  user,
  userRoles,
  type WorkflowStep,
  type WorkflowTransition,
  type WorkflowCondition,
} from "@/drizzle/schema";
import { eq, and, lte, gte } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { withAuth } from "@/lib/helpers/auth-helpers";
import {
  createValidationError,
  createNotFoundError,
  createPermissionError,
} from "@/lib/helpers/error-helpers";
import { checkPermission } from "@/lib/permissions/unified-permission-checker";
import type { ActionResponse, User } from "@/lib/types/common";
import { getNextAssignee, type AssignmentStrategy } from "@/lib/workflow/auto-assignment";
import { escalateAssignment as escalateAssignmentInternal } from "@/lib/workflow/deadline-monitor";

/**
 * CONSTANTS
 */
const WORKFLOW_PATHS = {
  admin: "/admin/workflows",
  delegations: "/admin/delegations",
} as const;

const DEFAULT_DEADLINE_DAYS = 3;
const MS_PER_HOUR = 60 * 60 * 1000;
const MS_PER_DAY = 24 * MS_PER_HOUR;
const MS_PER_WEEK = 7 * MS_PER_DAY;

/**
 * TYPES
 */
type DeadlineUnit = "h" | "d" | "w";
type OperatorEvaluator = (fieldValue: any, targetValue: any) => boolean;

/**
 * =====================================================
 * HELPER FUNCTIONS (DRY)
 * =====================================================
 */

/**
 * Parse deadline string to Date
 */
function parseDeadline(deadlineStr: string | undefined): Date {
  const now = Date.now();
  
  if (!deadlineStr) {
    return new Date(now + DEFAULT_DEADLINE_DAYS * MS_PER_DAY);
  }

  const match = deadlineStr.match(/^(\d+)([hdw])$/);
  if (!match) {
    return new Date(now + DEFAULT_DEADLINE_DAYS * MS_PER_DAY);
  }

  const value = parseInt(match[1] || '3');
  const unit = match[2] as DeadlineUnit;

  const multipliers: Record<DeadlineUnit, number> = {
    h: MS_PER_HOUR,
    d: MS_PER_DAY,
    w: MS_PER_WEEK,
  };

  return new Date(now + value * multipliers[unit]);
}

/**
 * Get user roles (DRY - used in 2 places)
 */
async function getUserRoles(userId: string): Promise<string[]> {
  // Check if user exists
  const userRecord = await db.query.user.findFirst({
    where: eq(user.id, userId),
  });

  if (!userRecord) return [];

  // Fetch user roles separately for better type safety
  const userRolesList = await db.query.userRoles.findMany({
    where: and(
      eq(userRoles.userId, userId),
      eq(userRoles.isActive, true)
    ),
    with: {
      role: true,
    } as Record<string, any>,
  });

  return userRolesList.map((ur: any) => 
    ur.role.name.toLowerCase()
  );
}

/**
 * Check if user has veto authority
 */
async function hasVetoAuthority(
  userId: string,
  workflowDefId: string
): Promise<boolean> {
  const workflowDef = await db.query.workflowDefinitions.findFirst({
    where: eq(workflowDefinitions.id, workflowDefId),
  });

  if (!workflowDef) return false;

  const vetoRoles = (workflowDef.vetoRoles as string[]) || [];
  const userRoles = await getUserRoles(userId);

  return vetoRoles.some((vetoRole) =>
    userRoles.includes(vetoRole.toLowerCase())
  );
}

/**
 * Fetch workflow instance with relations (DRY - used in 2 places)
 */
async function fetchWorkflowInstance(
  instanceId: string,
  options: {
    includeAssignments?: boolean;
  } = {}
) {
  const withClause: any = {
    definition: true,
  };

  if (options.includeAssignments) {
    withClause.assignments = true;
  }

  return await db.query.workflowInstances.findFirst({
    where: eq(workflowInstances.id, instanceId),
    with: withClause,
  }) as any;
}

/**
 * Create timeline entry (DRY - used in 3 places)
 */
async function createTimelineEntry(data: {
  workflowInstanceId: string;
  stepId: string;
  action: string;
  performedBy: string;
  comment?: string;
}) {
  await db.insert(workflowTimeline).values({
    workflowInstanceId: data.workflowInstanceId,
    stepId: data.stepId,
    action: data.action as any,
    performedBy: data.performedBy,
    comment: data.comment,
  });
}

/**
 * Revalidate workflow paths (DRY - used in 4 places)
 */
function revalidateWorkflowPaths(options: {
  includeDelegations?: boolean;
} = {}) {
  revalidatePath(WORKFLOW_PATHS.admin);
  if (options.includeDelegations) {
    revalidatePath(WORKFLOW_PATHS.delegations);
  }
}

/**
 * Get workflow steps (DRY - used in 3 places)
 */
function getWorkflowSteps(definition: any): {
  steps: WorkflowStep[];
  transitions: WorkflowTransition[];
  conditions: WorkflowCondition[];
} {
  return {
    steps: definition.steps as WorkflowStep[],
    transitions: definition.transitions as WorkflowTransition[],
    conditions: (definition.conditions as WorkflowCondition[]) || [],
  };
}

/**
 * Operator evaluators (OCP - Open for extension)
 */
const OPERATORS: Record<string, OperatorEvaluator> = {
  "=": (field, target) => field === target,
  "!=": (field, target) => field !== target,
  ">": (field, target) => field > target,
  "<": (field, target) => field < target,
  ">=": (field, target) => field >= target,
  "<=": (field, target) => field <= target,
  "in": (field, target) => Array.isArray(target) && target.includes(field),
  "not_in": (field, target) => Array.isArray(target) && !target.includes(field),
};

/**
 * Evaluate condition (OCP compliant)
 */
function evaluateCondition(
  condition: WorkflowCondition,
  entityMetadata: any
): boolean {
  const fieldValue = entityMetadata[condition.field];
  const targetValue = condition.value;
  const evaluator = OPERATORS[condition.operator];

  return evaluator ? evaluator(fieldValue, targetValue) : false;
}

/**
 * Get active delegation
 */
async function getActiveDelegation(
  userId: string,
  role: string,
  entityType: string
) {
  const now = new Date();

  return await db.query.workflowDelegations.findFirst({
    where: and(
      eq(workflowDelegations.fromUserId, userId),
      eq(workflowDelegations.role, role),
      eq(workflowDelegations.isActive, true),
      lte(workflowDelegations.startDate, now),
      gte(workflowDelegations.endDate, now)
    ),
  });
}

/**
 * =====================================================
 * WORKFLOW VALIDATION (SRP)
 * =====================================================
 */

/**
 * Validate workflow definition
 */
async function validateWorkflowDefinition(workflowDefId: string) {
  const workflowDef = await db.query.workflowDefinitions.findFirst({
    where: eq(workflowDefinitions.id, workflowDefId),
  });

  if (!workflowDef) {
    return { isValid: false, error: createNotFoundError("Workflow Definition") };
  }

  if (!workflowDef.isActive) {
    return { isValid: false, error: createValidationError("Workflow is not active") };
  }

  const { steps } = getWorkflowSteps(workflowDef);
  const startStep = steps.find((s) => s.type === "start");

  if (!startStep) {
    return { isValid: false, error: createValidationError("Workflow has no start step") };
  }

  return { isValid: true, workflowDef, startStep };
}

/**
 * Validate transition
 */
function validateTransition(
  currentStepId: string,
  action: string,
  transitions: WorkflowTransition[]
) {
  const validTransition = transitions.find(
    (t) => t.from === currentStepId && t.action === action
  );

  if (!validTransition) {
    return { 
      isValid: false, 
      error: createValidationError(`Invalid action: ${action}`) 
    };
  }

  return { isValid: true, transition: validTransition };
}

/**
 * =====================================================
 * STEP ASSIGNMENT (SRP)
 * =====================================================
 */

/**
 * Create step assignment
 */
async function createStepAssignment(data: {
  workflowInstanceId: string;
  step: WorkflowStep;
  entityMetadata: any;
}) {
  let assignedUserId: string | null = null;
  let assignedRole: string | null = null;
  let assignmentType: "role" | "user" | "auto" = data.step.assignmentType || "role";

  if (assignmentType === "role" && data.step.assignedRole) {
    assignedRole = data.step.assignedRole;
    
    // Check for active delegation for this role
    // If delegation exists, assign to delegated user instead
    const delegation = await getActiveDelegation(
      "", // We don't know the user yet for role-based
      data.step.assignedRole,
      "" // Entity type not strictly needed here
    );
    
    // For role-based assignments, we'll let it stay role-based
    // Delegation will be checked when user tries to act on it
  } else if (assignmentType === "user" && data.step.assignedUser) {
    assignedUserId = data.step.assignedUser;
    
    // Check if this user has delegated their authority
    const delegation = await getActiveDelegation(
      data.step.assignedUser,
      data.step.assignedRole || "manager",
      ""
    );
    
    if (delegation) {
      // Redirect to delegated user
      assignedUserId = delegation.toUserId;
    }
  } else if (assignmentType === "auto") {
    // Auto-assignment: workload-based strategy
    const autoAssignedUserId = await getNextAssignee(
      data.step.assignedRole || "manager",
      "workload"
    );
    
    if (autoAssignedUserId) {
      assignedUserId = autoAssignedUserId;
      assignmentType = "user"; // Convert to user assignment
      
      // Check delegation for auto-assigned user
      const delegation = await getActiveDelegation(
        autoAssignedUserId,
        data.step.assignedRole || "manager",
        ""
      );
      
      if (delegation) {
        assignedUserId = delegation.toUserId;
      }
    } else {
      // Fallback to role-based
      assignedRole = data.step.assignedRole || "manager";
      assignmentType = "role";
    }
  }

  const deadline = data.step.deadline ? parseDeadline(data.step.deadline) : null;

  await db.insert(stepAssignments).values({
    workflowInstanceId: data.workflowInstanceId,
    stepId: data.step.id,
    assignmentType,
    assignedRole,
    assignedUserId,
    status: "pending",
    deadline,
  });
}

/**
 * Complete current assignment
 */
async function completeCurrentAssignment(
  instance: any,
  action: string,
  userId: string,
  comment?: string
) {
  const currentAssignment = instance.assignments?.find(
    (a: any) => a.stepId === instance.currentStepId && a.status === "pending"
  );

  if (!currentAssignment) return;

  const isCompleted = action === "approve" || action === "complete";

  await db
    .update(stepAssignments)
    .set({
      status: isCompleted ? "completed" : "rejected",
      completedAt: new Date(),
      completedBy: userId,
      action: action as any,
      comment,
    })
    .where(eq(stepAssignments.id, currentAssignment.id));
}

/**
 * =====================================================
 * WORKFLOW STATE MANAGEMENT (SRP)
 * =====================================================
 */

/**
 * Determine next step (with conditional routing)
 */
function determineNextStep(
  currentStepId: string,
  action: string,
  transitions: WorkflowTransition[],
  conditions: WorkflowCondition[],
  entityMetadata: any
): string {
  const validTransition = transitions.find(
    (t) => t.from === currentStepId && t.action === action
  );

  if (!validTransition) return currentStepId;

  let nextStepId = validTransition.to;

  // Check conditions (for conditional routing)
  const applicableConditions = conditions.filter((c) => c.stepId === currentStepId);

  for (const condition of applicableConditions) {
    if (evaluateCondition(condition, entityMetadata)) {
      nextStepId = condition.nextStep;
      break;
    }
  }

  return nextStepId;
}

/**
 * Update workflow instance status
 */
async function updateWorkflowStatus(
  instanceId: string,
  nextStepId: string,
  isCompleted: boolean
) {
  await db
    .update(workflowInstances)
    .set({
      currentStepId: nextStepId,
      status: isCompleted ? "completed" : "active",
      completedAt: isCompleted ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(eq(workflowInstances.id, instanceId));
}

/**
 * =====================================================
 * PUBLIC API FUNCTIONS
 * =====================================================
 */

/**
 * START WORKFLOW
 */
export async function startWorkflow(data: {
  workflowDefinitionId: string;
  entityType: "Audit" | "Finding" | "Action" | "DOF";
  entityId: string;
  entityMetadata?: any;
}): Promise<ActionResponse<any>> {
  return withAuth(async (currentUser: User) => {
    // ✅ UNIFIED PERMISSION CHECK
    const perm = await checkPermission({
      user: currentUser as any,
      resource: "workflow",
      action: "start",
    });

    if (!perm.allowed) {
      return createPermissionError(perm.reason || "Permission denied");
    }

    // Validate workflow definition
    const validation = await validateWorkflowDefinition(data.workflowDefinitionId);
    if (!validation.isValid) return validation.error!;

    const { workflowDef, startStep } = validation;

    // Create workflow instance
    const [instance] = await db
      .insert(workflowInstances)
      .values({
        workflowDefinitionId: data.workflowDefinitionId,
        entityType: data.entityType as any, // Generic - supports any entity type
        entityId: data.entityId,
        currentStepId: startStep!.id,
        status: "active",
        entityMetadata: data.entityMetadata || {},
      })
      .returning();

    if (!instance) {
      return createValidationError("Failed to create workflow instance");
    }

    // Create timeline entry
    await createTimelineEntry({
      workflowInstanceId: instance.id,
      stepId: startStep!.id,
      action: "submit",
      performedBy: currentUser.id,
      comment: "Workflow started",
    });

    revalidateWorkflowPaths();

    return {
      success: true,
      message: "Workflow started successfully",
      data: instance,
    };
  });
}

/**
 * TRANSITION TO NEXT STEP (Refactored - SRP compliant)
 */
export async function transitionWorkflow(data: {
  workflowInstanceId: string;
  action: "submit" | "approve" | "reject" | "complete";
  comment?: string;
}): Promise<ActionResponse> {
  return withAuth(async (currentUser: User): Promise<ActionResponse> => {
    // ✅ UNIFIED PERMISSION CHECK
    const perm = await checkPermission({
      user: currentUser as any,
      resource: "workflow",
      action: "transition",
    });

    if (!perm.allowed) {
      return createPermissionError(perm.reason || "Permission denied");
    }

    // Fetch workflow instance
    const instance = await fetchWorkflowInstance(data.workflowInstanceId, {
      includeAssignments: true,
    });

    if (!instance) {
      return createNotFoundError("Workflow Instance");
    }

    if (!instance.definition) {
      return createValidationError("Workflow definition not found");
    }

    if (instance.status !== "active") {
      return createValidationError("Workflow is not active");
    }

    // Get workflow configuration
    const { steps, transitions, conditions } = getWorkflowSteps(instance.definition);

    const currentStep = steps.find((s) => s.id === instance.currentStepId);
    if (!currentStep) {
      return createValidationError("Current step not found");
    }

    // Validate transition
    const transitionValidation = validateTransition(
      instance.currentStepId,
      data.action,
      transitions
    );
    if (!transitionValidation.isValid) {
      return transitionValidation.error!;
    }

    // Determine next step (with conditional routing)
    const nextStepId = determineNextStep(
      instance.currentStepId,
      data.action,
      transitions,
      conditions,
      instance.entityMetadata
    );

    const nextStep = steps.find((s) => s.id === nextStepId);
    if (!nextStep) {
      return createValidationError("Next step not found");
    }

    // Complete current assignment
    await completeCurrentAssignment(
      instance,
      data.action,
      currentUser.id,
      data.comment
    );

    // Update workflow status
    const isEndStep = nextStep.type === "end";
    await updateWorkflowStatus(instance.id, nextStepId, isEndStep);

    // Create timeline entry
    await createTimelineEntry({
      workflowInstanceId: instance.id,
      stepId: nextStepId,
      action: data.action,
      performedBy: currentUser.id,
      comment: data.comment,
    });

    // Create next assignment (if not end step)
    if (!isEndStep) {
      await createStepAssignment({
        workflowInstanceId: instance.id,
        step: nextStep,
        entityMetadata: instance.entityMetadata as any,
      });
    }

    revalidateWorkflowPaths();

    return {
      success: true,
      message: `Workflow ${isEndStep ? "completed" : "transitioned"} successfully`,
      data: { nextStep: nextStep.name, isComplete: isEndStep },
    } as unknown as ActionResponse;
  });
}

/**
 * VETO WORKFLOW
 */
export async function vetoWorkflow(data: {
  workflowInstanceId: string;
  comment: string;
}): Promise<ActionResponse> {
  return withAuth(async (currentUser: User) => {
    const instance = await fetchWorkflowInstance(data.workflowInstanceId);

    if (!instance) {
      return createNotFoundError("Workflow Instance");
    }

    if (!instance.definition) {
      return createValidationError("Workflow definition not found");
    }

    // ✅ UNIFIED PERMISSION CHECK
    const perm = await checkPermission({
      user: currentUser as any,
      resource: "workflow",
      action: "veto",
    });

    if (!perm.allowed) {
      return createPermissionError(perm.reason || "Permission denied");
    }

    const { steps } = getWorkflowSteps(instance.definition);
    const endStep = steps.find((s) => s.type === "end");

    if (!endStep) {
      return createValidationError("Workflow has no end step");
    }

    // Update workflow to completed
    await updateWorkflowStatus(instance.id, endStep.id, true);

    // Create timeline entry
    await createTimelineEntry({
      workflowInstanceId: instance.id,
      stepId: endStep.id,
      action: "veto",
      performedBy: currentUser.id,
      comment: data.comment || "Vetoed by authorized user",
    });

    revalidateWorkflowPaths();

    return {
      success: true,
      message: "Workflow vetoed and completed",
      data: undefined,
    };
  });
}

/**
 * CREATE DELEGATION
 */
export async function createDelegation(data: {
  toUserId: string;
  role: string;
  entityType?: "Audit" | "Finding" | "Action" | "DOF";
  startDate: Date;
  endDate: Date;
  reason: string;
}): Promise<ActionResponse> {
  return withAuth(async (currentUser: User) => {
    // ✅ UNIFIED PERMISSION CHECK
    const perm = await checkPermission({
      user: currentUser as any,
      resource: "workflow",
      action: "delegate",
    });

    if (!perm.allowed) {
      return createPermissionError(perm.reason || "Permission denied");
    }

    // Validate dates
    if (data.startDate >= data.endDate) {
      return createValidationError("End date must be after start date");
    }

    // Check if target user exists
    const targetUser = await db.query.user.findFirst({
      where: eq(user.id, data.toUserId),
    });

    if (!targetUser) {
      return createNotFoundError("Target User");
    }

    // Create delegation
    await db.insert(workflowDelegations).values({
      fromUserId: currentUser.id,
      toUserId: data.toUserId,
      role: data.role,
      entityType: (data.entityType as any) || null, // Generic - supports any entity type
      startDate: data.startDate,
      endDate: data.endDate,
      reason: data.reason,
      isActive: true,
      createdById: currentUser.id,
    });

    revalidateWorkflowPaths({ includeDelegations: true });

    return {
      success: true,
      message: "Delegation created successfully",
      data: undefined,
    };
  });
}

/**
 * GET MY WORKFLOW TASKS
 */
export async function getMyWorkflowTasks(): Promise<ActionResponse<any>> {
  return withAuth(async (currentUser: User) => {
    // ✅ UNIFIED PERMISSION CHECK
    const perm = await checkPermission({
      user: currentUser as any,
      resource: "workflow",
      action: "read",
    });

    if (!perm.allowed) {
      return createPermissionError(perm.reason || "Permission denied");
    }

    // Get user's roles
    const userRoles = await getUserRoles(currentUser.id);

    if (userRoles.length === 0 && !currentUser.id) {
      return createNotFoundError("User");
    }

    // Get assignments (direct or via role)
    const assignments = await db.query.stepAssignments.findMany({
      where: and(eq(stepAssignments.status, "pending")),
      with: {
        instance: {
          with: {
            definition: true,
          },
        },
      },
    });

    // Filter assignments for this user
    const myAssignments = assignments.filter((a: any) => {
      if (a.assignedUserId === currentUser.id) return true;
      if (a.assignedRole && userRoles.includes(a.assignedRole.toLowerCase())) return true;
      return false;
    });

    return {
      success: true,
      data: myAssignments,
    };
  });
}

/**
 * MANUAL ESCALATE WORKFLOW
 * Allow managers to manually escalate workflow tasks
 */
export async function manualEscalateWorkflow(data: {
  assignmentId: string;
  reason: string;
}): Promise<ActionResponse<any>> {
  return withAuth(async (currentUser: User) => {
    // Get assignment
    const assignment = await db.query.stepAssignments.findFirst({
      where: eq(stepAssignments.id, data.assignmentId),
    });

    if (!assignment) {
      return createNotFoundError("Assignment");
    }

    // ✅ UNIFIED PERMISSION CHECK
    const perm = await checkPermission({
      user: currentUser as any,
      resource: "workflow",
      action: "escalate",
    });

    if (!perm.allowed) {
      return createPermissionError(perm.reason || "Permission denied");
    }
    
    // Escalate using internal function
    const result = await escalateAssignmentInternal(data.assignmentId);

    if (!result.success) {
      return createValidationError(result.error || "Escalation failed");
    }

    // Create timeline entry
    await createTimelineEntry({
      workflowInstanceId: assignment.workflowInstanceId,
      stepId: assignment.stepId,
      action: "escalate",
      performedBy: currentUser.id,
      comment: data.reason || "Manually escalated by manager",
    });

    revalidateWorkflowPaths();

    return {
      success: true,
      message: "Assignment escalated successfully",
      data: { escalatedTo: result.escalatedTo },
    };
  });
}

/**
 * CANCEL WORKFLOW
 * Cancel active workflow
 */
export async function cancelWorkflow(data: {
  workflowInstanceId: string;
  reason: string;
}): Promise<ActionResponse> {
  return withAuth(async (currentUser: User) => {
    // ✅ UNIFIED PERMISSION CHECK
    const perm = await checkPermission({
      user: currentUser as any,
      resource: "workflow",
      action: "cancel",
    });

    if (!perm.allowed) {
      return createPermissionError(perm.reason || "Permission denied");
    }

    const instance = await fetchWorkflowInstance(data.workflowInstanceId);

    if (!instance) {
      return createNotFoundError("Workflow Instance");
    }

    if (instance.status !== "active") {
      return createValidationError("Workflow is not active");
    }

    // Update workflow to cancelled
    await db
      .update(workflowInstances)
      .set({
        status: "cancelled",
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(workflowInstances.id, instance.id));

    // Create timeline entry
    await createTimelineEntry({
      workflowInstanceId: instance.id,
      stepId: instance.currentStepId,
      action: "cancel",
      performedBy: currentUser.id,
      comment: data.reason || "Workflow cancelled",
    });

    revalidateWorkflowPaths();

    return {
      success: true,
      message: "Workflow cancelled successfully",
      data: undefined,
    };
  });
}

/**
 * UPDATE DELEGATION
 */
export async function updateDelegation(data: {
  delegationId: string;
  startDate?: Date;
  endDate?: Date;
  reason?: string;
}): Promise<ActionResponse> {
  return withAuth(async (currentUser: User) => {
    const delegation = await db.query.workflowDelegations.findFirst({
      where: eq(workflowDelegations.id, data.delegationId),
    });

    if (!delegation) {
      return createNotFoundError("Delegation");
    }

    // ✅ UNIFIED PERMISSION CHECK
    const perm = await checkPermission({
      user: currentUser as any,
      resource: "workflow",
      action: "delegate",
      entity: {
        id: delegation.id,
        createdById: delegation.fromUserId,
      },
    });

    if (!perm.allowed) {
      return createPermissionError(perm.reason || "Permission denied");
    }

    await db
      .update(workflowDelegations)
      .set({
        startDate: data.startDate || delegation.startDate,
        endDate: data.endDate || delegation.endDate,
        reason: data.reason || delegation.reason,
        updatedAt: new Date(),
      })
      .where(eq(workflowDelegations.id, data.delegationId));

    revalidateWorkflowPaths({ includeDelegations: true });

    return {
      success: true,
      message: "Delegation updated successfully",
      data: undefined,
    };
  });
}

/**
 * DEACTIVATE DELEGATION
 */
export async function deactivateDelegation(delegationId: string): Promise<ActionResponse> {
  return withAuth(async (currentUser: User) => {
    const delegation = await db.query.workflowDelegations.findFirst({
      where: eq(workflowDelegations.id, delegationId),
    });

    if (!delegation) {
      return createNotFoundError("Delegation");
    }

    // ✅ UNIFIED PERMISSION CHECK
    const perm = await checkPermission({
      user: currentUser as any,
      resource: "workflow",
      action: "delegate",
      entity: {
        id: delegation.id,
        createdById: delegation.fromUserId,
      },
    });

    if (!perm.allowed) {
      return createPermissionError(perm.reason || "Permission denied");
    }

    await db
      .update(workflowDelegations)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(workflowDelegations.id, delegationId));

    revalidateWorkflowPaths({ includeDelegations: true });

    return {
      success: true,
      message: "Delegation deactivated successfully",
      data: undefined,
    };
  });
}

/**
 * GET MY DELEGATIONS
 */
export async function getMyDelegations(): Promise<ActionResponse<any>> {
  return withAuth(async (currentUser: User) => {
    // ✅ UNIFIED PERMISSION CHECK
    const perm = await checkPermission({
      user: currentUser as any,
      resource: "workflow",
      action: "read",
    });

    if (!perm.allowed) {
      return createPermissionError(perm.reason || "Permission denied");
    }

    const delegations = await db.query.workflowDelegations.findMany({
      where: eq(workflowDelegations.fromUserId, currentUser.id),
    });

    return {
      success: true,
      data: delegations,
    };
  });
}
