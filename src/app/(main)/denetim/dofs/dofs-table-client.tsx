"use client";

import { DataTable } from "@/components/ui/data-table/data-table";
import { DataTableToolbar } from "@/components/ui/data-table/data-table-toolbar";
import { useDataTable } from "@/hooks/use-data-table";
import { columns, type DofRecord } from "./columns";

interface DofsTableClientProps {
  data: DofRecord[];
}

export function DofsTableClient({ data }: DofsTableClientProps) {
  const filterFields = [
    {
      label: "Durum",
      value: "status" as keyof DofRecord,
      options: [
        { label: "1. Problem Tanımı", value: "Step1_Problem" },
        { label: "2. Geçici Önlemler", value: "Step2_TempMeasures" },
        { label: "3. Kök Neden", value: "Step3_RootCause" },
        { label: "4. Faaliyetler", value: "Step4_Activities" },
        { label: "5. Uygulama", value: "Step5_Implementation" },
        { label: "6. Etkinlik Kontrolü", value: "Step6_EffectivenessCheck" },
        { label: "Yönetici Onayı", value: "PendingManagerApproval" },
        { label: "Tamamlandı", value: "Completed" },
        { label: "Reddedildi", value: "Rejected" },
      ],
    },
    {
      label: "Problem Ara",
      value: "problemTitle" as keyof DofRecord,
      placeholder: "Problem başlığı ara...",
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
        title="DÖF Kayıtlarım"
        description={`Toplam ${data.length} DÖF kaydı`}
      />
    </div>
  );
}
