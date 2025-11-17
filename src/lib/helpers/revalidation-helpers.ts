/**
 * Revalidation Helpers - Generic Framework
 * DRY: Consistent path revalidation across all action files
 */

import { revalidatePath } from "next/cache";

/**
 * HELPER: Revalidate user-related paths
 */
export function revalidateUserPaths(options: {
  list?: boolean;
  specific?: string;
  profile?: boolean;
}) {
  if (options.list) revalidatePath("/admin/users");
  if (options.specific) revalidatePath(`/admin/users/${options.specific}`);
  if (options.profile) revalidatePath("/profile");
}

/**
 * HELPER: Revalidate role-related paths
 */
export function revalidateRolePaths(options: {
  list?: boolean;
  specific?: string;
}) {
  if (options.list) revalidatePath("/admin/roles");
  if (options.specific) revalidatePath(`/admin/roles/${options.specific}`);
}

/**
 * HELPER: Revalidate organization-related paths
 */
export function revalidateOrganizationPaths(options: {
  companies?: boolean;
  branches?: boolean;
  departments?: boolean;
  positions?: boolean;
  specificCompany?: string;
  specificBranch?: string;
  specificDepartment?: string;
  specificPosition?: string;
}) {
  if (options.companies) revalidatePath("/admin/organization/companies");
  if (options.branches) revalidatePath("/admin/organization/branches");
  if (options.departments) revalidatePath("/admin/organization/departments");
  if (options.positions) revalidatePath("/admin/organization/positions");
  if (options.specificCompany) revalidatePath(`/admin/organization/companies/${options.specificCompany}`);
  if (options.specificBranch) revalidatePath(`/admin/organization/branches/${options.specificBranch}`);
  if (options.specificDepartment) revalidatePath(`/admin/organization/departments/${options.specificDepartment}`);
  if (options.specificPosition) revalidatePath(`/admin/organization/positions/${options.specificPosition}`);
}

/**
 * HELPER: Revalidate team-related paths
 */
export function revalidateTeamPaths(options: {
  list?: boolean;
  specific?: string;
}) {
  if (options.list) revalidatePath("/admin/teams");
  if (options.specific) revalidatePath(`/admin/teams/${options.specific}`);
}

/**
 * HELPER: Revalidate common/shared paths
 */
export function revalidateCommonPaths() {
  revalidatePath("/dashboard");
  revalidatePath("/admin");
}

/**
 * HELPER: Revalidate action-related paths
 */
export function revalidateActionPaths() {
  revalidatePath("/admin/actions");
}

/**
 * HELPER: Revalidate audit-related paths
 */
export function revalidateAuditPaths() {
  revalidatePath("/admin/audit");
}

/**
 * HELPER: Revalidate DOF-related paths
 */
export function revalidateDOFPaths() {
  revalidatePath("/admin/dof");
}

/**
 * HELPER: Revalidate Finding-related paths
 */
export function revalidateFindingPaths() {
  revalidatePath("/admin/findings");
}

/**
 * HELPER: Revalidate admin paths
 */
export function revalidateAdminPaths() {
  revalidatePath("/admin");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/users");
  revalidatePath("/admin/roles");
}

/**
 * HELPER: Revalidate dashboard
 */
export function revalidateDashboard() {
  revalidatePath("/");
  revalidatePath("/admin/dashboard");
}
