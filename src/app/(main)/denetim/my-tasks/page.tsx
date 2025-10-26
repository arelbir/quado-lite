import { redirect } from "next/navigation";

/**
 * My Tasks - Workflow Management
 * 
 * All task management (Actions, DOFs, Findings) is centralized 
 * in the workflow system for better organization and tracking.
 * 
 * Route: /admin/workflows/my-tasks
 */

export default function MyTasksPage() {
  redirect("/admin/workflows/my-tasks");
}
