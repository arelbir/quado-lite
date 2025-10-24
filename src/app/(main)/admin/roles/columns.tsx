"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header";
import { ShieldCheck } from "lucide-react";

export interface Role {
  id: string;
  name: string;
  description: string | null;
  permissions: { id: string }[];
}

export const columns: ColumnDef<Role>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Role Name" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium">{row.getValue("name")}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      const desc = row.getValue("description") as string | null;
      return <span className="text-sm text-muted-foreground">{desc || "-"}</span>;
    },
  },
  {
    id: "permissionCount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Permissions" />
    ),
    cell: ({ row }) => {
      const count = row.original.permissions?.length || 0;
      return (
        <Badge variant="outline" className="font-mono">
          {count} permissions
        </Badge>
      );
    },
  },
];
