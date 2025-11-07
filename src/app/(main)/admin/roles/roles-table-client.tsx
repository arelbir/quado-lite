"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createColumns } from "./columns";
import { DataTable } from "@/components/ui/data-table/data-table";
import { DataTableToolbar } from "@/components/ui/data-table/data-table-toolbar";
import { useDataTable } from "@/hooks/use-data-table";
import type { DataTableFilterField } from "@/types/data-table";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RoleDialog } from "@/components/admin/role-dialog";
import { RolesPermissionMatrix } from "@/components/admin/roles-permission-matrix";
import { deleteRole } from "@/server/actions/role-actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, Grid3x3 } from "lucide-react";
import type { roles, permissions } from "@/drizzle/schema/role-system";

type Role = typeof roles.$inferSelect;
type Permission = typeof permissions.$inferSelect;

// Extended type with permissions relation
type RoleWithPermissions = Role & {
  permissions?: { id: string }[];
};
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

interface RolesTableClientProps {
  roles: RoleWithPermissions[];
  permissions: Permission[];
}

export function RolesTableClient({ roles, permissions }: RolesTableClientProps) {
  const router = useRouter();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [deletingRole, setDeletingRole] = useState<Role | null>(null);

  const handleCreate = () => {
    setEditingRole(null);
    setEditDialogOpen(true);
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setEditDialogOpen(true);
  };

  const handleDelete = (role: Role) => {
    setDeletingRole(role);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingRole) return;

    try {
      const result = await deleteRole(deletingRole.id);
      
      if (result.success) {
        toast.success(result.message || `Role "${deletingRole.name}" deleted successfully`);
        setDeleteDialogOpen(false);
        setDeletingRole(null);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to delete role");
      }
    } catch (error) {
      toast.error("Failed to delete role");
      console.error(error);
    }
  };

  const filterFields: DataTableFilterField<Role>[] = [
    {
      label: "Search",
      value: "name" as keyof Role,
      placeholder: "Search roles...",
    },
  ];

  const columns = createColumns(handleEdit, handleDelete);

  const { table } = useDataTable({
    data: roles,
    columns,
    pageCount: -1, // Client-side pagination
    filterFields,
    defaultPerPage: 10,
  });

  return (
    <>
      <Tabs defaultValue="matrix" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="matrix" className="gap-2">
              <Grid3x3 className="h-4 w-4" />
              Matrix View
            </TabsTrigger>
            <TabsTrigger value="table" className="gap-2">
              <Table className="h-4 w-4" />
              Table View
            </TabsTrigger>
          </TabsList>
          <Button onClick={handleCreate}>
            Create New Role
          </Button>
        </div>

        <TabsContent value="matrix" className="space-y-4">
          <RolesPermissionMatrix roles={roles} permissions={permissions} />
        </TabsContent>

        <TabsContent value="table" className="space-y-4">
          <DataTableToolbar table={table} filterFields={filterFields} />
          <DataTable
            table={table}
            title="Roles & Permissions"
            description="Manage user roles and their permissions"
          />
        </TabsContent>
      </Tabs>

      {/* Role Dialog */}
      <RoleDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        role={editingRole}
        permissions={permissions}
        onSuccess={() => router.refresh()}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the role &quot;{deletingRole?.name}&quot;. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
