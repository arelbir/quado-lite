"use server";

/**
 * DEPRECATED: Old task management system
 * 
 * This entire file is deprecated and will be removed in a future version.
 * All task management is now handled through the workflow system.
 * 
 * Use instead: /admin/workflows/my-tasks
 * Backend: workflow-actions.ts
 * 
 * @deprecated Use workflow system instead
 */

/**
 * DEPRECATED: Use workflow system instead
 * @deprecated
 */
export async function getMyPendingTasks() {
  console.warn('⚠️ getMyPendingTasks() is deprecated. Use workflow tasks instead.');
  return { 
    success: false, 
    error: "This function is deprecated. Use /admin/workflows/my-tasks" 
  };
}

/**
 * DEPRECATED: Use workflow system instead
 * @deprecated
 */
export async function getMyTasksCount() {
  console.warn('⚠️ getMyTasksCount() is deprecated. Use workflow analytics instead.');
  return { 
    actions: 0, 
    dofs: 0, 
    approvals: 0, 
    findings: 0 
  };
}
