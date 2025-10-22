"use client";

import { DataTable } from "@/components/ui/data-table/data-table";
import { DataTableToolbar } from "@/components/ui/data-table/data-table-toolbar";
import { useDataTable } from "@/hooks/use-data-table";
import { columns, type Finding } from "./columns";

interface FindingsTableClientProps {
  data: Finding[];
}

export function FindingsTableClient({ data }: FindingsTableClientProps) {
  const filterFields = [
    {
      label: "Durum",
      value: "status" as keyof Finding,
      options: [
        { label: "Yeni", value: "New" },
        { label: "Atandı", value: "Assigned" },
        { label: "İşlemde", value: "InProgress" },
        { label: "Onay Bekliyor", value: "PendingAuditorClosure" },
        { label: "Tamamlandı", value: "Completed" },
      ],
    },
    {
      label: "Risk",
      value: "riskType" as keyof Finding,
      options: [
        { label: "Kritik", value: "Kritik" },
        { label: "Yüksek", value: "Yüksek" },
        { label: "Orta", value: "Orta" },
        { label: "Düşük", value: "Düşük" },
      ],
    },
    {
      label: "Detay",
      value: "details" as keyof Finding,
      placeholder: "Bulgu ara...",
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
        title="Tüm Bulgular"
        description={`Toplam ${data.length} bulgu`}
      />
    </div>
  );
}
