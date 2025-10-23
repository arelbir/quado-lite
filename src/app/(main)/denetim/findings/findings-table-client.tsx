"use client";

import { DataTable } from "@/components/ui/data-table/data-table";
import { DataTableToolbar } from "@/components/ui/data-table/data-table-toolbar";
import { useDataTable } from "@/hooks/use-data-table";
import { useFindingColumns, type Finding } from "./columns";
import { useTranslations } from 'next-intl';
import { useFindingStatusLabel, useRiskTypeLabel } from "@/lib/i18n/status-helpers";

interface FindingsTableClientProps {
  data: Finding[];
}

export function FindingsTableClient({ data }: FindingsTableClientProps) {
  const t = useTranslations('finding');
  const tCommon = useTranslations('common');
  const columns = useFindingColumns();
  const getStatusLabel = useFindingStatusLabel();
  const getRiskLabel = useRiskTypeLabel();

  const statusOptions = [
    { label: getStatusLabel('New'), value: 'New' },
    { label: getStatusLabel('Assigned'), value: 'Assigned' },
    { label: getStatusLabel('InProgress'), value: 'InProgress' },
    { label: getStatusLabel('PendingAuditorClosure'), value: 'PendingAuditorClosure' },
    { label: getStatusLabel('Completed'), value: 'Completed' },
  ];

  const riskOptions = [
    { label: getRiskLabel('Kritik'), value: 'Kritik' },
    { label: getRiskLabel('Yüksek'), value: 'Yüksek' },
    { label: getRiskLabel('Orta'), value: 'Orta' },
    { label: getRiskLabel('Düşük'), value: 'Düşük' },
  ];

  const filterFields = [
    {
      label: t('fields.status'),
      value: "status" as keyof Finding,
      options: statusOptions,
    },
    {
      label: t('fields.riskType'),
      value: "riskType" as keyof Finding,
      options: riskOptions,
    },
    {
      label: t('fields.details'),
      value: "details" as keyof Finding,
      placeholder: t('placeholders.searchFinding'),
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
        title={t('title')}
        description={`${tCommon('total')} ${data.length} ${t('singular').toLowerCase()}`}
      />
    </div>
  );
}
