'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/shared/icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  publishVisualWorkflow,
  archiveVisualWorkflow,
  restoreVisualWorkflow,
  deleteVisualWorkflow,
} from '@/features/workflows/actions/visual-workflow-actions';
import { toast } from 'sonner';

interface Workflow {
  id: string;
  name: string;
  description: string | null;
  module: string;
  status: string;
  version: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
  createdBy?: { name: string | null };
}

interface Props {
  workflows: Workflow[];
}

export function WorkflowsTable({ workflows }: Props) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return <Badge variant="secondary">Draft</Badge>;
      case 'ACTIVE':
        return <Badge variant="default" className="bg-green-500">Active</Badge>;
      case 'ARCHIVED':
        return <Badge variant="outline">Archived</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getModuleBadge = (module: string) => {
    const colors: Record<string, string> = {
      DOF: 'bg-purple-500',
      ACTION: 'bg-blue-500',
      FINDING: 'bg-orange-500',
      AUDIT: 'bg-cyan-500',
    };
    return (
      <Badge className={colors[module] || 'bg-gray-500'}>
        {module}
      </Badge>
    );
  };

  const handlePublish = async (id: string) => {
    const result = await publishVisualWorkflow(id);
    if (result.success) {
      toast.success('Workflow published successfully');
      router.refresh();
    } else {
      toast.error(result.error || 'Failed to publish');
    }
  };

  const handleArchive = async (id: string) => {
    const result = await archiveVisualWorkflow(id);
    if (result.success) {
      toast.success('Workflow archived');
      router.refresh();
    } else {
      toast.error(result.error || 'Failed to archive');
    }
  };

  const handleRestore = async (id: string) => {
    const result = await restoreVisualWorkflow(id);
    if (result.success) {
      toast.success('Workflow restored to draft');
      router.refresh();
    } else {
      toast.error(result.error || 'Failed to restore');
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;

    const result = await deleteVisualWorkflow(deletingId);
    if (result.success) {
      toast.success('Workflow deleted');
      setDeletingId(null);
      router.refresh();
    } else {
      toast.error(result.error || 'Failed to delete');
    }
  };

  if (workflows.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <Icons.Workflow className="mx-auto size-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">No workflows yet</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Create your first visual workflow to get started
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Module</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Version</TableHead>
              <TableHead>Created By</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workflows.map((workflow) => (
              <TableRow key={workflow.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{workflow.name}</div>
                    {workflow.description && (
                      <div className="text-sm text-muted-foreground line-clamp-1">
                        {workflow.description}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>{getModuleBadge(workflow.module)}</TableCell>
                <TableCell>{getStatusBadge(workflow.status)}</TableCell>
                <TableCell>
                  <code className="text-xs">{workflow.version}</code>
                </TableCell>
                <TableCell>
                  <div className="text-sm">{workflow.createdBy?.name || 'Unknown'}</div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-muted-foreground">
                    {new Date(workflow.updatedAt).toLocaleDateString()}
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Icons.Menu className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => router.push(`/admin/workflows/builder?id=${workflow.id}`)}
                      >
                        <Icons.Eye className="size-4 mr-2" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => router.push(`/admin/workflows/builder?id=${workflow.id}`)}
                      >
                        <Icons.Edit className="size-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {workflow.status === 'DRAFT' && (
                        <DropdownMenuItem onClick={() => handlePublish(workflow.id)}>
                          <Icons.CheckCircle2 className="size-4 mr-2" />
                          Publish
                        </DropdownMenuItem>
                      )}
                      {workflow.status === 'ACTIVE' && (
                        <DropdownMenuItem onClick={() => handleArchive(workflow.id)}>
                          <Icons.Ban className="size-4 mr-2" />
                          Archive
                        </DropdownMenuItem>
                      )}
                      {workflow.status === 'ARCHIVED' && (
                        <DropdownMenuItem onClick={() => handleRestore(workflow.id)}>
                          <Icons.Edit className="size-4 mr-2" />
                          Restore to Draft
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setDeletingId(workflow.id)}
                        className="text-red-600"
                      >
                        <Icons.Trash className="size-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Workflow?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the workflow
              and all its version history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
