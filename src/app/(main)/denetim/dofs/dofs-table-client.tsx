"use client";

import { DataTable } from "@/components/ui/data-table/data-table";
import { DataTableToolbar } from "@/components/ui/data-table/data-table-toolbar";
import { useDataTable } from "@/hooks/use-data-table";
import { useDofColumns, type DofRecord } from "./columns";
import { useTranslations } from 'next-intl';
import { useDofStatusLabel } from "@/lib/i18n/status-helpers";

interface DofsTableClientProps {
  data: DofRecord[];
}

export function DofsTableClient({ data }: DofsTableClientProps) {
  const t = useTranslations('dof');
  const tCommon = useTranslations('common');
  const columns = useDofColumns();
  const getStatusLabel = useDofStatusLabel();

  const statusOptions = [
    { label: getStatusLabel('Step1_Problem'), value: 'Step1_Problem' },
    { label: getStatusLabel('Step2_TempMeasures'), value: 'Step2_TempMeasures' },
    { label: getStatusLabel('Step3_RootCause'), value: 'Step3_RootCause' },
    { label: getStatusLabel('Step4_Activities'), value: 'Step4_Activities' },
    { label: getStatusLabel('Step5_Implementation'), value: 'Step5_Implementation' },
    { label: getStatusLabel('Step6_EffectivenessCheck'), value: 'Step6_EffectivenessCheck' },
    { label: getStatusLabel('PendingManagerApproval'), value: 'PendingManagerApproval' },
    { label: getStatusLabel('Completed'), value: 'Completed' },
    { label: getStatusLabel('Rejected'), value: 'Rejected' },
  ];

  const filterFields = [
    {
      label: t('fields.status'),
      value: "status" as keyof DofRecord,
      options: statusOptions,
    },
    {
      label: t('fields.problemTitle'),
      value: "problemTitle" as keyof DofRecord,
      placeholder: t('placeholders.searchProblem'),
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
