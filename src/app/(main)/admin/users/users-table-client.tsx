"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createColumns, type User } from "./columns";
import { DataTable } from "@/components/ui/data-table/data-table";
import { DataTableToolbar } from "@/components/ui/data-table/data-table-toolbar";
import { useDataTable } from "@/hooks/use-data-table";
import type { DataTableFilterField } from "@/types/framework/data-table";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { UserDialog } from "@/features/users/components/user-dialog";
import { useTranslations } from 'next-intl';
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
import { deleteUser } from "@/features/users/actions/user-actions";
import { BulkRoleAssignment } from "@/features/roles/components/bulk-role-assignment";
import { Users } from "lucide-react";

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
  const t = useTranslations('users');
  const tCommon = useTranslations('common');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkRoleDialogOpen, setBulkRoleDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [availableRoles, setAvailableRoles] = useState<any[]>([]);

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
    toast.success(t('messages.updated'));
  };

  const confirmDelete = async () => {
    if (!deletingUser) return;

    try {
      const result = await deleteUser(deletingUser.id);
      
      if (result.success) {
        toast.success(result.message || t('messages.deleted'));
        setDeleteDialogOpen(false);
        setDeletingUser(null);
        router.refresh();
      } else {
        toast.error(result.error || t('messages.deleteError'));
      }
    } catch (error) {
      toast.error(t('messages.deleteError'));
      console.error(error);
    }
  };

  const columns = createColumns(handleEdit, handleDelete);

  const filterFields: DataTableFilterField<User>[] = [
    {
      label: "Search",
      value: "name" as keyof User,
      placeholder: "Search by name or email...",
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

  const { table } = useDataTable<User, any>({
    data: users,
    columns,
    pageCount: pageCount ?? -1, // Server-side pagination
    filterFields,
    defaultPerPage: 10,
    // ✅ CRITICAL: Use database ID as row ID (not index)
    getRowId: (row: User) => row.id,
  });

  // Fetch available roles when bulk dialog opens
  useEffect(() => {
    if (bulkRoleDialogOpen && availableRoles.length === 0) {
      fetch('/api/roles')
        .then(res => res.json())
        .then(data => setAvailableRoles(data as any))
        .catch(err => {
          console.error('Failed to fetch roles:', err);
          toast.error('Failed to fetch roles');
        });
    }
  }, [bulkRoleDialogOpen, availableRoles.length]);

  // ✅ SMART FIX: Only clear selection on page change (not on filter/search)
  // Database ID'ler sayesinde filter değişse bile selection güvenli
  const prevPageRef = React.useRef<string | null>(null);
  
  useEffect(() => {
    const currentPage = searchParams?.get('page');
    
    // Only reset when page changes (not on filter/search)
    if (prevPageRef.current !== null && prevPageRef.current !== currentPage) {
      table.resetRowSelection();
    }
    
    prevPageRef.current = currentPage;
  }, [searchParams, table]);

  // Get selected users from rowSelection state
  const rowSelection = table.getState().rowSelection;
  
  // Get ALL selected user IDs (even if not in current page/filter)
  const selectedUserIds = Object.keys(rowSelection).filter(id => rowSelection[id]);
  const selectedCount = selectedUserIds.length;
  
  // Get user data for display (only for visible users)
  // For bulk operation, we'll use ALL selected IDs
  const selectedUsersForDisplay = selectedUserIds
    .map(id => {
      const user = users.find(u => u.id === id);
      return user ? {
        id: user.id,
        name: user.name || 'No Name',
        email: user.email,
      } : {
        id: id,
        name: 'Unknown User',
        email: '(not in current view)',
      };
    });

  const handleBulkRoleAssignment = () => {
    if (selectedCount === 0) {
      toast.error('Please select at least one user');
      return;
    }
    
    setBulkRoleDialogOpen(true);
  };

  const handleBulkComplete = () => {
    table.resetRowSelection();
    router.refresh();
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <DataTableToolbar table={table as any} filterFields={filterFields} />
          <div className="flex gap-2">
            {selectedCount > 0 && (
              <Button
                onClick={handleBulkRoleAssignment}
                variant="outline"
                size="sm"
              >
                <Users className="h-4 w-4 mr-2" />
                Assign Role to {selectedCount} User(s)
              </Button>
            )}
            <Button onClick={handleCreate}>
              Create New User
            </Button>
          </div>
        </div>
        <DataTable
          table={table as any}
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

      {/* Bulk Role Assignment Dialog */}
      <BulkRoleAssignment
        selectedUsers={selectedUsersForDisplay}
        availableRoles={availableRoles}
        open={bulkRoleDialogOpen}
        onOpenChange={setBulkRoleDialogOpen}
        onComplete={handleBulkComplete}
      />
    </>
  );
}
