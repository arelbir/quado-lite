"use client";

import { DataTable } from "@/components/ui/data-table/data-table";
import { DataTableToolbar } from "@/components/ui/data-table/data-table-toolbar";
import { useDataTable } from "@/hooks/use-data-table";
import { columns, type UnifiedRecord } from "./columns";

interface UnifiedTableClientProps {
  data: UnifiedRecord[];
}

export function UnifiedTableClient({ data }: UnifiedTableClientProps) {
  const filterFields = [
    {
      label: "Tip",
      value: "type" as keyof UnifiedRecord,
      options: [
        { label: "Plan", value: "plan" },
        { label: "Denetim", value: "audit" },
      ],
    },
    {
      label: "Durum",
      value: "status" as keyof UnifiedRecord,
      options: [
        { label: "Plan Bekliyor", value: "Pending" },
        { label: "Oluşturuldu", value: "Created" },
        { label: "İptal", value: "Cancelled" },
        { label: "Aktif", value: "Active" },
      ],
    },
    {
      label: "Başlık",
      value: "title" as keyof UnifiedRecord,
      placeholder: "Başlık ara...",
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
        title="Denetimler & Planlar"
        description={`Toplam ${data.length} kayıt`}
      />
    </div>
  );
}
