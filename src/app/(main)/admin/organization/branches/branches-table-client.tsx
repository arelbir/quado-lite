"use client";

import { useState } from "react";
import { createColumns, type Branch } from "./columns";
import { DataTable } from "@/components/ui/data-table/data-table";
import { DataTableToolbar } from "@/components/ui/data-table/data-table-toolbar";
import { useDataTable } from "@/hooks/use-data-table";
import type { DataTableFilterField } from "@/types/data-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { BranchDialog } from "@/features/organization/components/branch-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { deleteBranch } from "@/features/organization/actions/organization-actions";
import type { Company, BranchWithRelations } from "@/lib/types";

interface BranchesTableClientProps {
  branches: BranchWithRelations[];
  companies: Pick<Company, 'id' | 'name' | 'code'>[];
}

export function BranchesTableClient({ branches, companies }: BranchesTableClientProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingBranch, setDeletingBranch] = useState<Branch | null>(null);

  const handleEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setDialogOpen(true);
  };

  const handleDelete = (branch: Branch) => {
    setDeletingBranch(branch);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingBranch) return;

    const result = await deleteBranch(deletingBranch.id);
    
    if (result.success) {
      toast.success("Branch deleted successfully");
      setDeleteDialogOpen(false);
      setDeletingBranch(null);
      window.location.reload();
    } else {
      toast.error(result.error || "Failed to delete branch");
    }
  };

  const columns = createColumns(handleEdit, handleDelete);
  const filterFields: DataTableFilterField<Branch>[] = [
    {
      label: "Search",
      value: "name" as keyof Branch,
      placeholder: "Search branches...",
    },
    {
      label: "Type",
      value: "type" as keyof Branch,
      options: [
        { label: "Headquarters", value: "Headquarters" },
        { label: "Regional Office", value: "Regional Office" },
        { label: "Branch Office", value: "Branch Office" },
        { label: "Sales Office", value: "Sales Office" },
        { label: "Service Center", value: "Service Center" },
      ],
    },
    {
      label: "Status",
      value: "isActive" as keyof Branch,
      options: [
        { label: "Active", value: "true" },
        { label: "Inactive", value: "false" },
      ],
    },
  ];

  const { table } = useDataTable({
    data: branches,
    columns,
    pageCount: -1, // Client-side pagination
    filterFields,
    defaultPerPage: 10,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <DataTableToolbar table={table} filterFields={filterFields} />
        <Button
          onClick={() => {
            setEditingBranch(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Branch
        </Button>
      </div>
      <DataTable
        table={table}
        title="Branches"
        description="Manage your organization's branch offices and locations"
      />

      {/* Branch Dialog */}
      <BranchDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        branch={editingBranch}
        companies={companies}
        onSuccess={() => window.location.reload()}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Branch</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingBranch?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
