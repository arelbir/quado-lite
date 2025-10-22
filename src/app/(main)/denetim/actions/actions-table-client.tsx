"use client";

import { DataTable } from "@/components/ui/data-table/data-table";
import { DataTableToolbar } from "@/components/ui/data-table/data-table-toolbar";
import { useDataTable } from "@/hooks/use-data-table";
import { columns, type ActionRecord } from "./columns";

interface ActionsTableClientProps {
  data: ActionRecord[];
}

export function ActionsTableClient({ data }: ActionsTableClientProps) {
  const filterFields = [
    {
      label: "Durum",
      value: "status" as keyof ActionRecord,
      options: [
        { label: "Atandı", value: "Assigned" },
        { label: "Onay Bekliyor", value: "PendingManagerApproval" },
        { label: "Tamamlandı", value: "Completed" },
        { label: "Reddedildi", value: "Rejected" },
      ],
    },
    {
      label: "Aksiyon Ara",
      value: "details" as keyof ActionRecord,
      placeholder: "Aksiyon detayı ara...",
    },
  ];

  const { table } = useDataTable({
    data,
    columns,
    pageCount: Math.ceil(data.length / 10),
    filterFields,
  });

  return (
    <div className="space-y-4">
      <DataTableToolbar table={table} filterFields={filterFields} />
      <DataTable
        table={table}
        title="Aksiyonlarım"
        description={`Toplam ${data.length} aksiyon`}
      />
    </div>
  );
}
