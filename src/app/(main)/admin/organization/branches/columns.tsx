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
import { Building2, MapPin, User, MoreHorizontal, Eye, Edit, Trash } from "lucide-react";
import Link from "next/link";
import type { BranchWithRelations } from "@/types/domain";

export type Branch = BranchWithRelations;

export const createColumns = (
  onEdit: (branch: Branch) => void,
  onDelete: (branch: Branch) => void
): ColumnDef<Branch>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Branch Name" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-muted-foreground" />
          <div className="flex flex-col">
            <span className="font-medium">{row.getValue("name")}</span>
            <span className="text-xs text-muted-foreground">
              {row.original.type}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "code",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Code" />
    ),
    cell: ({ row }) => {
      return <Badge variant="outline">{row.getValue("code")}</Badge>;
    },
  },
  {
    accessorKey: "location",
    header: "Location",
    cell: ({ row }) => {
      const city = row.original.city;
      const country = row.original.country;
      const location = [city, country].filter(Boolean).join(", ");
      
      return (
        <div className="flex items-center gap-2">
          <MapPin className="w-3 h-3 text-muted-foreground" />
          <span className="text-sm">{location || "-"}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "manager",
    header: "Manager",
    cell: ({ row }) => {
      const manager = row.original.manager;
      
      if (!manager) {
        return <span className="text-sm text-muted-foreground">Unassigned</span>;
      }

      return (
        <div className="flex items-center gap-2">
          <User className="w-3 h-3 text-muted-foreground" />
          <span className="text-sm">{manager.name || manager.email}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "departments",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Departments" />
    ),
    cell: ({ row }) => {
      const count = row.original._count?.departments || 0;
      return (
        <Badge variant="secondary" className="font-mono">
          {count}
        </Badge>
      );
    },
  },
  {
    accessorKey: "isActive",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const isActive = row.getValue("isActive");
      return isActive ? (
        <Badge className="bg-green-100 text-green-800">Active</Badge>
      ) : (
        <Badge variant="secondary">Inactive</Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const branch = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/admin/organization/branches/branch-detail?id=${branch.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(branch)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(branch)}
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
