"use client";

import { columns, type Role } from "./columns";
import { DataTable } from "@/components/ui/data-table/data-table";
import { DataTableToolbar } from "@/components/ui/data-table/data-table-toolbar";
import { useDataTable } from "@/hooks/use-data-table";
import type { DataTableFilterField } from "@/types/data-table";

interface RolesTableClientProps {
  roles: Role[];
}

export function RolesTableClient({ roles }: RolesTableClientProps) {
  const filterFields: DataTableFilterField<Role>[] = [
    {
      label: "Search",
      value: "name" as keyof Role,
      placeholder: "Search roles...",
    },
  ];

  const { table } = useDataTable({
    data: roles,
    columns,
    pageCount: -1, // Client-side pagination
    filterFields,
    defaultPerPage: 10,
  });

  return (
    <div className="space-y-4">
      <DataTableToolbar table={table} filterFields={filterFields} />
      <DataTable
        table={table}
        title="Roles & Permissions"
        description="Manage user roles and their permissions"
      />
    </div>
  );
}
