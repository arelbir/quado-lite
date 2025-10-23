import { getMyPendingTasks } from "@/action/my-tasks-actions";
import { TaskDashboard } from "./task-dashboard";

/**
 * SOLID Architecture - Server Component
 * 
 * Responsibilities:
 * - Data fetching (Server Side)
 * - Page metadata
 * - Header section
 * 
 * Delegates:
 * - UI rendering to TaskDashboard (Client Component)
 * - Virtual scrolling to VirtualTaskList
 * - Individual task rendering to TaskCard
 */

export default async function MyTasksPage() {
  const data = await getMyPendingTasks();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bekleyen İşlerim</h1>
        <p className="text-muted-foreground">
          Üzerime atanmış tüm görevler ve onay bekleyen işler
        </p>
      </div>

      {/* Dashboard with Virtual Scrolling */}
      <TaskDashboard data={data} />
    </div>
  );
}
