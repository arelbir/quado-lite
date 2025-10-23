/**
 * Revalidation Helpers
 * DRY: Consistent path revalidation across all action files
 */

import { revalidatePath } from "next/cache";

/**
 * HELPER: Revalidate audit-related paths
 */
export function revalidateAuditPaths(options: {
  plans?: boolean;
  audits?: boolean;
  all?: boolean;
  specificPlan?: string;
  specificAudit?: string;
}) {
  if (options.plans) revalidatePath("/denetim/plans");
  if (options.audits) revalidatePath("/denetim/audits");
  if (options.all) revalidatePath("/denetim/all");
  if (options.specificPlan) revalidatePath(`/denetim/plans/${options.specificPlan}`);
  if (options.specificAudit) revalidatePath(`/denetim/audits/${options.specificAudit}`);
}

/**
 * HELPER: Revalidate action-related paths
 */
export function revalidateActionPaths(options: {
  list?: boolean;
  specific?: string;
  myTasks?: boolean;
}) {
  if (options.list) revalidatePath("/denetim/actions");
  if (options.specific) revalidatePath(`/denetim/actions/${options.specific}`);
  if (options.myTasks) revalidatePath("/denetim/my-tasks");
}

/**
 * HELPER: Revalidate finding-related paths
 */
export function revalidateFindingPaths(options: {
  list?: boolean;
  specific?: string;
  myTasks?: boolean;
}) {
  if (options.list) revalidatePath("/denetim/findings");
  if (options.specific) revalidatePath(`/denetim/findings/${options.specific}`);
  if (options.myTasks) revalidatePath("/denetim/my-tasks");
}

/**
 * HELPER: Revalidate DOF-related paths
 */
export function revalidateDOFPaths(options: {
  list?: boolean;
  specific?: string;
  myTasks?: boolean;
}) {
  if (options.list) revalidatePath("/denetim/dofs");
  if (options.specific) revalidatePath(`/denetim/dofs/${options.specific}`);
  if (options.myTasks) revalidatePath("/denetim/my-tasks");
}

/**
 * HELPER: Revalidate all common paths
 */
export function revalidateCommonPaths() {
  revalidatePath("/denetim");
  revalidatePath("/denetim/my-tasks");
  revalidatePath("/denetim/all");
}
