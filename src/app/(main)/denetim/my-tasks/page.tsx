import { getMyPendingTasks } from "@/action/my-tasks-actions";
import { TaskDashboard } from "./task-dashboard";
import { getTranslations } from 'next-intl/server';

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
  const t = await getTranslations('myTasks');
  const data = await getMyPendingTasks();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">
          {t('description')}
        </p>
      </div>

      {/* Dashboard with Virtual Scrolling */}
      <TaskDashboard data={data} />
    </div>
  );
}
