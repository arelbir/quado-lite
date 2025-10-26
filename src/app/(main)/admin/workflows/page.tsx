import { Suspense } from 'react';
import { getVisualWorkflows } from '@/server/actions/visual-workflow-actions';
import { WorkflowsTable } from './workflows-table';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import Link from 'next/link';

export const metadata = {
  title: 'Workflows | Admin',
  description: 'Manage visual workflow definitions',
};

export default async function WorkflowsPage() {
  const result = await getVisualWorkflows();
  const workflows = (result.success && result.data ? result.data : []) as any[];

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Workflow Designer</h1>
          <p className="text-muted-foreground">
            Visual workflow definitions for your processes
          </p>
        </div>
        <Link href="/admin/workflows/builder">
          <Button>
            <Icons.Plus className="size-4 mr-2" />
            New Workflow
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-2">
            <Icons.Workflow className="size-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Total</span>
          </div>
          <p className="mt-2 text-3xl font-bold">{workflows.length}</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-2">
            <Icons.Edit className="size-4 text-blue-500" />
            <span className="text-sm font-medium text-muted-foreground">Draft</span>
          </div>
          <p className="mt-2 text-3xl font-bold">
            {workflows.filter(w => w.status === 'DRAFT').length}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-2">
            <Icons.CheckCircle2 className="size-4 text-green-500" />
            <span className="text-sm font-medium text-muted-foreground">Active</span>
          </div>
          <p className="mt-2 text-3xl font-bold">
            {workflows.filter(w => w.status === 'ACTIVE').length}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-2">
            <Icons.Ban className="size-4 text-gray-500" />
            <span className="text-sm font-medium text-muted-foreground">Archived</span>
          </div>
          <p className="mt-2 text-3xl font-bold">
            {workflows.filter(w => w.status === 'ARCHIVED').length}
          </p>
        </div>
      </div>

      {/* Table */}
      <Suspense fallback={<div>Loading workflows...</div>}>
        <WorkflowsTable workflows={workflows} />
      </Suspense>
    </div>
  );
}
