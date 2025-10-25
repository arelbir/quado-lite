import { redirect } from "next/navigation";

/**
 * DEPRECATED: Old task management page
 * 
 * This page has been replaced by the centralized workflow task management.
 * All tasks (Actions, DOFs, Findings) are now managed through the workflow system.
 * 
 * Redirecting to: /admin/workflows/my-tasks
 */

export default function MyTasksPage() {
  // Redirect to new workflow-based task management
  redirect("/admin/workflows/my-tasks");
}
