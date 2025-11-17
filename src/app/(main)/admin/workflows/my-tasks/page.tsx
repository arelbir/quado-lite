import { getMyWorkflowTasks } from "@/features/workflows/actions/workflow-actions";
import { WorkflowTasksClient } from "./tasks-client";

export default async function MyWorkflowTasksPage() {
  const result = await getMyWorkflowTasks();

  if (!result.success) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">My Workflow Tasks</h1>
        <p className="text-red-500">Error loading tasks: {result.error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">My Workflow Tasks</h1>
      <WorkflowTasksClient tasks={result.data || []} />
    </div>
  );
}
