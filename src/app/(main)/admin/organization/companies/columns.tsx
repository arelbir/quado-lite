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
import { Building, MoreHorizontal, Eye, Edit, Trash } from "lucide-react";
import Link from "next/link";
import type { Company } from "@/types/domain";

// Re-export for local usage
export type { Company };

export const createColumns = (
  onEdit: (company: Company) => void,
  onDelete: (company: Company) => void
): ColumnDef<Company>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Company Name" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <Building className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium">{row.getValue("name")}</span>
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
    accessorKey: "city",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="City" />
    ),
    cell: ({ row }) => {
      return <span>{row.getValue("city") || "-"}</span>;
    },
  },
  {
    accessorKey: "country",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Country" />
    ),
    cell: ({ row }) => {
      return <span>{row.getValue("country") || "-"}</span>;
    },
  },
  {
    accessorKey: "address",
    header: "Address",
    cell: ({ row }) => {
      const address = row.getValue("address") as string | null;
      return <span className="text-sm text-muted-foreground">{address || "-"}</span>;
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
      const company = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/admin/organization/companies/company-detail?id=${company.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(company)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(company)}
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
