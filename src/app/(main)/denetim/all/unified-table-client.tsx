"use client";

import { DataTable } from "@/components/ui/data-table/data-table";
import { DataTableToolbar } from "@/components/ui/data-table/data-table-toolbar";
import { useDataTable } from "@/hooks/use-data-table";
import { columns, type UnifiedRecord } from "./columns";
import { useTranslations } from 'next-intl';
import { useAuditStatusLabel, usePlanStatusLabel } from "@/lib/i18n/status-helpers";

interface UnifiedTableClientProps {
  data: UnifiedRecord[];
  type: "audit" | "plan";
}

export function UnifiedTableClient({ data, type }: UnifiedTableClientProps) {
  const t = useTranslations('audit');
  const tPlan = useTranslations('audit.plans');
  const tCommon = useTranslations('common');
  const getAuditStatusLabel = useAuditStatusLabel();
  const getPlanStatusLabel = usePlanStatusLabel();
  
  // Status options based on type
  const statusOptions = type === "plan" 
    ? [
        { label: getPlanStatusLabel('Pending'), value: 'Pending' },
        { label: getPlanStatusLabel('Created'), value: 'Created' },
        { label: getPlanStatusLabel('Cancelled'), value: 'Cancelled' },
      ]
    : [
        { label: getAuditStatusLabel('Active'), value: 'Active' },
        { label: getAuditStatusLabel('Closed'), value: 'Closed' },
        { label: getAuditStatusLabel('Archived'), value: 'Archived' },
      ];
  
  const filterFields = [
    {
      label: t('fields.status'),
      value: "status" as keyof UnifiedRecord,
      options: statusOptions,
    },
    {
      label: tCommon('date'),
      value: "date" as keyof UnifiedRecord,
      type: "date" as const,
      placeholder: t('placeholders.selectDateRange'),
    },
    {
      label: t('fields.title'),
      value: "title" as keyof UnifiedRecord,
      placeholder: t('placeholders.searchTitle'),
    },
  ];

  const { table } = useDataTable({
    data,
    columns,
    pageCount: Math.ceil(data.length / 10),
    filterFields,
  });

  // Title ve description type'a göre
  const title = type === "plan" ? tPlan('title') : t('active');
  const description = type === "plan" 
    ? `${tCommon('total')} ${data.length} ${tPlan('singular').toLowerCase()}`
    : `${tCommon('total')} ${data.length} ${t('singular').toLowerCase()}`;

  return (
    <div className="space-y-4">
      <DataTableToolbar table={table} filterFields={filterFields} />
      <DataTable
        table={table}
        title={title}
        description={description}
      />
    </div>
  );
}
