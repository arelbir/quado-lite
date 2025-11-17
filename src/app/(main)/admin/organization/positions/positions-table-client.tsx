"use client";

import { useState } from "react";
import { createColumns, type Position } from "./columns";
import { DataTable } from "@/components/ui/data-table/data-table";
import { DataTableToolbar } from "@/components/ui/data-table/data-table-toolbar";
import { useDataTable } from "@/hooks/use-data-table";
import type { DataTableFilterField } from "@/types/framework/data-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PositionDialog } from "@/features/organization/components/position-dialog";
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
import { deletePosition } from "@/features/organization/actions/organization-actions";

interface PositionsTableClientProps {
  positions: Position[];
}

export function PositionsTableClient({ positions }: PositionsTableClientProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingPosition, setDeletingPosition] = useState<Position | null>(null);

  const handleEdit = (position: Position) => {
    setEditingPosition(position);
    setDialogOpen(true);
  };

  const handleDelete = (position: Position) => {
    setDeletingPosition(position);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingPosition) return;

    const result = await deletePosition(deletingPosition.id);
    
    if (result.success) {
      toast.success("Position deleted successfully");
      setDeleteDialogOpen(false);
      setDeletingPosition(null);
      window.location.reload();
    } else {
      toast.error(result.error || "Failed to delete position");
    }
  };

  const columns = createColumns(handleEdit, handleDelete);
  const filterFields: DataTableFilterField<Position>[] = [
    {
      label: "Search",
      value: "name" as keyof Position,
      placeholder: "Search positions...",
    },
    {
      label: "Level",
      value: "level" as keyof Position,
      options: [
        { label: "Executive", value: "Executive" },
        { label: "Director", value: "Director" },
        { label: "Manager", value: "Manager" },
        { label: "Lead", value: "Lead" },
        { label: "Senior", value: "Senior" },
        { label: "Mid", value: "Mid" },
        { label: "Junior", value: "Junior" },
      ],
    },
  ];

  const { table } = useDataTable({
    data: positions,
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
            setEditingPosition(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Position
        </Button>
      </div>
      <DataTable
        table={table}
        title="Positions & Career Levels"
        description="Manage job positions across your organization"
      />

      {/* Position Dialog */}
      <PositionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        position={editingPosition}
        onSuccess={() => window.location.reload()}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Position</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingPosition?.name}"? This action cannot be undone.
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
