"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header";
import { Eye } from "lucide-react";
import Link from "next/link";
import { useTranslations } from 'next-intl';
import { useRiskTypeLabel } from "@/lib/i18n/status-helpers";

export type Finding = {
  id: string;
  details: string;
  status: string;
  riskType: string | null;
  createdAt: Date;
  audit: {
    id: string;
    title: string;
  } | null;
  assignedTo: {
    id: string;
    name: string | null;
  } | null;
};

export function useFindingColumns(): ColumnDef<Finding>[] {
  const t = useTranslations('finding');
  const tCommon = useTranslations('common');
  const tAudit = useTranslations('audit');
  const getRiskLabel = useRiskTypeLabel();

  return [
    {
      accessorKey: "details",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('fields.details')} />
      ),
    cell: ({ row }) => {
      return (
        <div className="max-w-[500px]">
          <p className="line-clamp-2">{row.getValue("details")}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "audit",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={tAudit('singular')} />
    ),
    cell: ({ row }) => {
      const audit = row.original.audit;
      return audit ? (
        <span className="text-sm">{audit.title}</span>
      ) : (
        <span className="text-sm text-muted-foreground">-</span>
      );
    },
  },
  {
    accessorKey: "riskType",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('fields.riskType')} />
    ),
    cell: ({ row }) => {
      const risk = row.getValue("riskType") as string | null;
      if (!risk) return <span className="text-sm text-muted-foreground">-</span>;
      return (
        <span className="text-sm">{getRiskLabel(risk as any)}</span>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('fields.status')} />
    ),
    cell: ({ row }) => {
      return <StatusBadge status={row.getValue("status")} type="finding" />;
    },
  },
  {
    accessorKey: "assignedTo",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('fields.responsiblePerson')} />
    ),
    cell: ({ row }) => {
      const assignedTo = row.original.assignedTo;
      return assignedTo ? (
        <span className="text-sm">{assignedTo.name}</span>
      ) : (
        <span className="text-sm text-muted-foreground">-</span>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <Button asChild size="sm" variant="ghost">
          <Link href={`/denetim/findings/${row.original.id}`}>
            <Eye className="h-4 w-4 mr-2" />
            {tCommon('actions.view')}
          </Link>
        </Button>
      );
    },
  },
];
}
