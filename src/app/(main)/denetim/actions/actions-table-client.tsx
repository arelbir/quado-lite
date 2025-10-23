"use client";

import { DataTable } from "@/components/ui/data-table/data-table";
import { DataTableToolbar } from "@/components/ui/data-table/data-table-toolbar";
import { useDataTable } from "@/hooks/use-data-table";
import { useActionColumns, type ActionRecord } from "./columns";
import { useTranslations } from 'next-intl';
import { useActionStatusLabel } from "@/lib/i18n/status-helpers";

interface ActionsTableClientProps {
  data: ActionRecord[];
}

export function ActionsTableClient({ data }: ActionsTableClientProps) {
  const t = useTranslations('action');
  const tCommon = useTranslations('common');
  const columns = useActionColumns();
  const getStatusLabel = useActionStatusLabel();

  const statusOptions = [
    { label: getStatusLabel('Assigned'), value: 'Assigned' },
    { label: getStatusLabel('PendingManagerApproval'), value: 'PendingManagerApproval' },
    { label: getStatusLabel('Completed'), value: 'Completed' },
    { label: getStatusLabel('Cancelled'), value: 'Cancelled' },
  ];

  const filterFields = [
    {
      label: t('fields.status'),
      value: "status" as keyof ActionRecord,
      options: statusOptions,
    },
    {
      label: t('placeholders.searchAction'),
      value: "details" as keyof ActionRecord,
      placeholder: t('placeholders.enterDetails'),
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
        description={`${tCommon('total')} ${data.length} ${t('title').toLowerCase()}`}
      />
    </div>
  );
}
