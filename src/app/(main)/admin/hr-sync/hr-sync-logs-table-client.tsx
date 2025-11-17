"use client";

import { columns, type HRSyncLog } from "./columns";
import { DataTable } from "@/components/ui/data-table/data-table";
import { DataTableToolbar } from "@/components/ui/data-table/data-table-toolbar";
import { useDataTable } from "@/hooks/use-data-table";
import type { DataTableFilterField } from "@/types/framework/data-table";

interface HRSyncLogsTableClientProps {
  data: HRSyncLog[];
}

export function HRSyncLogsTableClient({ data }: HRSyncLogsTableClientProps) {
  const filterFields: DataTableFilterField<HRSyncLog>[] = [
    {
      label: "Status",
      value: "status" as keyof HRSyncLog,
      options: [
        { label: "Completed", value: "Completed" },
        { label: "Failed", value: "Failed" },
        { label: "In Progress", value: "InProgress" },
        { label: "Partial Success", value: "PartialSuccess" },
      ],
    },
    {
      label: "Source",
      value: "sourceType" as keyof HRSyncLog,
      options: [
        { label: "LDAP", value: "LDAP" },
        { label: "CSV", value: "CSV" },
        { label: "REST API", value: "REST_API" },
        { label: "Manual", value: "MANUAL" },
      ],
    },
  ];

  // IMPORTANT: Hook returns { table } - must destructure!
  const { table } = useDataTable({
    data,
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
        title="Recent Sync Logs"
        description="Last 50 synchronization attempts with detailed status"
      />
    </div>
  );
}
