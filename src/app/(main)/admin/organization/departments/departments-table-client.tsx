"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/ui/data-table/data-table";
import { DataTableToolbar } from "@/components/ui/data-table/data-table-toolbar";
import { useDataTable } from "@/hooks/use-data-table";
import type { DataTableFilterField } from "@/types/framework/data-table";
import { createColumns, type Department } from "./columns";
import { DepartmentDialog } from "@/features/organization/components/department-dialog";
import { deleteDepartment } from "@/features/organization/actions/department-actions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
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

interface DepartmentsTableClientProps {
  data: Department[];
  branches: any[];
  users: any[];
}

export function DepartmentsTableClient({ data, branches, users }: DepartmentsTableClientProps) {
  const router = useRouter();
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [deletingDepartment, setDeletingDepartment] = useState<Department | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDepartmentDialog, setShowDepartmentDialog] = useState(false);

  const handleEdit = (department: Department) => {
    setEditingDepartment(department);
    setShowDepartmentDialog(true);
  };

  const handleDelete = (department: Department) => {
    setDeletingDepartment(department);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!deletingDepartment) return;

    try {
      const result = await deleteDepartment(deletingDepartment.id);
      
      if (result.success) {
        toast.success(`Department "${deletingDepartment.name}" deleted successfully`);
        setShowDeleteDialog(false);
        setDeletingDepartment(null);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to delete department");
      }
    } catch (error) {
      toast.error("Failed to delete department");
    }
  };

  const columns = createColumns(handleEdit, handleDelete);

  const filterFields: DataTableFilterField<Department>[] = [
    {
      label: "Search",
      value: "name" as keyof Department,
      placeholder: "Search departments...",
    },
    {
      label: "Status",
      value: "isActive" as keyof Department,
      options: [
        { label: "Active", value: "true" },
        { label: "Inactive", value: "false" },
      ],
    },
  ];

  const { table } = useDataTable({
    data,
    columns,
    pageCount: -1, // Client-side pagination
    filterFields,
  });

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <DataTableToolbar table={table} filterFields={filterFields} />
          <Button
            onClick={() => {
              setEditingDepartment(null);
              setShowDepartmentDialog(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Department
          </Button>
        </div>
        <DataTable
          table={table}
          title="Departments"
          description="Manage your organization's department hierarchy"
        />
      </div>

      {/* Department Dialog (Create/Edit) */}
      <DepartmentDialog
        open={showDepartmentDialog}
        onOpenChange={setShowDepartmentDialog}
        department={editingDepartment}
        departments={data}
        branches={branches}
        users={users}
        onSuccess={() => {
          router.refresh();
        }}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the department &quot;{deletingDepartment?.name}&quot;.
              This action cannot be undone.
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
    </>
  );
}
