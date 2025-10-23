"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTaskCategories } from "@/hooks/use-task-categories";
import { VirtualTaskList } from "@/components/tasks/virtual-task-list";
import { TaskSummary } from "@/types/my-tasks";

/**
 * SOLID - Orchestration Component:
 * - Coordinates between different components
 * - Delegates rendering to specialized components
 * - Single responsibility: Layout and composition
 */

interface TaskDashboardProps {
  data: {
    actions: any[];
    dofs: any[];
    approvals: {
      actions: any[];
      dofs: any[];
    };
    findings: any[];
    summary: TaskSummary;
  };
}

export function TaskDashboard({ data }: TaskDashboardProps) {
  const categories = useTaskCategories(data);
  
  // Extract icons for proper JSX rendering
  const ActionsIcon = categories[0]?.icon;
  const DofsIcon = categories[1]?.icon;
  const ApprovalsCategory = categories.find((c) => c.id === "approvals");
  const FindingsCategory = categories.find((c) => c.id === "findings");

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aksiyonlarım</CardTitle>
            {ActionsIcon && <ActionsIcon className="h-4 w-4 text-muted-foreground" />}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.totalActions}</div>
            <p className="text-xs text-muted-foreground">
              {data.summary.pendingActions} bekliyor
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">DÖF'lerim</CardTitle>
            {DofsIcon && <DofsIcon className="h-4 w-4 text-muted-foreground" />}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.totalDofs}</div>
            <p className="text-xs text-muted-foreground">
              Devam eden CAPA süreçleri
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Onaylarım</CardTitle>
            {ApprovalsCategory && <ApprovalsCategory.icon className="h-4 w-4 text-muted-foreground" />}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.totalApprovals}</div>
            <p className="text-xs text-muted-foreground">
              Onay bekleyen işler
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bulgularım</CardTitle>
            {FindingsCategory && <FindingsCategory.icon className="h-4 w-4 text-muted-foreground" />}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.totalFindings}</div>
            <p className="text-xs text-muted-foreground">
              Açık bulgular
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Virtual Scrolling Lists - DRY: Same component for all */}
      <div className="grid gap-6 md:grid-cols-2">
        {categories.map((category) => {
          const CategoryIcon = category.icon;
          return (
            <Card key={category.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CategoryIcon className="h-5 w-5" />
                  {category.title}
                </CardTitle>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <VirtualTaskList
                  tasks={category.tasks}
                  emptyMessage={category.emptyMessage}
                  estimateSize={85}
                  overscan={5}
                />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
