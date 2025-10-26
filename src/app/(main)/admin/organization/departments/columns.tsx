"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header";
import { Building2, MoreHorizontal, Eye, Edit, Trash } from "lucide-react";
import Link from "next/link";

export type Department = {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  branchId: string | null;
  parentDepartmentId: string | null;
  managerId: string | null;
  description?: string | null;
  costCenter?: string | null;
  branch?: { id: string; name: string } | null;
  parent?: { id: string; name: string } | null;
  manager?: { id: string; name: string; email: string } | null;
};

export const createColumns = (
  onEdit: (department: Department) => void,
  onDelete: (department: Department) => void
): ColumnDef<Department>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Department Name" />
    ),
    cell: ({ row }) => {
      const department = row.original;
      return (
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="font-medium">{department.name}</div>
            <div className="text-sm text-muted-foreground">{department.code}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "branch",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Branch" />
    ),
    cell: ({ row }) => {
      const branch = row.original.branch;
      return branch ? (
        <span className="text-sm">{branch.name}</span>
      ) : (
        <span className="text-sm text-muted-foreground">-</span>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "parent",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Parent Department" />
    ),
    cell: ({ row }) => {
      const parent = row.original.parent;
      return parent ? (
        <span className="text-sm">{parent.name}</span>
      ) : (
        <span className="text-sm text-muted-foreground">Root</span>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "manager",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Manager" />
    ),
    cell: ({ row }) => {
      const manager = row.original.manager;
      return manager ? (
        <div>
          <div className="text-sm font-medium">{manager.name}</div>
          <div className="text-xs text-muted-foreground">{manager.email}</div>
        </div>
      ) : (
        <span className="text-sm text-muted-foreground">No manager</span>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "isActive",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const isActive = row.original.isActive;
      return (
        <Badge variant={isActive ? "default" : "secondary"}>
          {isActive ? "Active" : "Inactive"}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const department = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/admin/organization/departments/department-detail?id=${department.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(department)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(department)}
              className="text-destructive"
            >
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
