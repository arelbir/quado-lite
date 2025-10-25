"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createColumns, type User } from "./columns";
import { DataTable } from "@/components/ui/data-table/data-table";
import { DataTableToolbar } from "@/components/ui/data-table/data-table-toolbar";
import { useDataTable } from "@/hooks/use-data-table";
import type { DataTableFilterField } from "@/types/data-table";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { UserDialog } from "@/components/admin/user-dialog";
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
import { deleteUser } from "@/server/actions/user-actions";

interface Company {
  id: string;
  name: string;
}

interface Branch {
  id: string;
  name: string;
}

interface Department {
  id: string;
  name: string;
}

interface Position {
  id: string;
  name: string;
}

interface Manager {
  id: string;
  name: string | null;
  email: string;
}

interface UsersTableClientProps {
  users: User[];
  companies: Company[];
  branches: Branch[];
  departments: Department[];
  positions: Position[];
  managers: Manager[];
  pageCount?: number;
}

export function UsersTableClient({ users, companies, branches, departments, positions, managers, pageCount }: UsersTableClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  // Check URL params for edit mode
  useEffect(() => {
    const editUserId = searchParams?.get('edit');
    if (editUserId) {
      const userToEdit = users.find(u => u.id === editUserId);
      if (userToEdit) {
        setEditingUser(userToEdit);
        setEditDialogOpen(true);
        // Clean URL after opening dialog
        router.replace('/admin/users');
      }
    }
  }, [searchParams, users, router]);

  const handleCreate = () => {
    setEditingUser(null);
    setEditDialogOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setEditDialogOpen(true);
  };

  const handleDelete = (user: User) => {
    setDeletingUser(user);
    setDeleteDialogOpen(true);
  };

  const handleEditSuccess = () => {
    router.refresh();
    toast.success("User updated successfully");
  };

  const confirmDelete = async () => {
    if (!deletingUser) return;

    try {
      const result = await deleteUser(deletingUser.id);
      
      if (result.success) {
        toast.success(result.message || "User deleted successfully");
        setDeleteDialogOpen(false);
        setDeletingUser(null);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to delete user");
      }
    } catch (error) {
      toast.error("Failed to delete user");
      console.error(error);
    }
  };

  const columns = createColumns(handleEdit, handleDelete);

  const filterFields: DataTableFilterField<User>[] = [
    {
      label: "Search",
      value: "name" as keyof User,
      placeholder: "Search users...",
    },
    {
      label: "Status",
      value: "status" as keyof User,
      options: [
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
        { label: "Pending", value: "pending" },
      ],
    },
  ];

  const { table } = useDataTable({
    data: users,
    columns,
    pageCount: pageCount ?? -1, // Server-side if provided, else client-side
    filterFields,
    defaultPerPage: 10,
  });

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <DataTableToolbar table={table} filterFields={filterFields} />
          <Button onClick={handleCreate}>
            Create New User
          </Button>
        </div>
        <DataTable
          table={table}
          title="Users"
          description="Manage system users and their access"
        />
      </div>

      {/* Edit Dialog */}
      <UserDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        user={editingUser}
        companies={companies}
        branches={branches}
        departments={departments}
        positions={positions}
        managers={managers}
        onSuccess={handleEditSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete user <strong>{deletingUser?.name || deletingUser?.email}</strong>?
              This action cannot be undone.
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