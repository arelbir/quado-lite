"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header";
import { Eye } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { useTranslations } from 'next-intl';
import { StatusBadge } from "@/components/ui/status-badge";

export type ActionRecord = {
  id: string;
  details: string;
  status: "Assigned" | "PendingManagerApproval" | "Completed" | "Rejected" | "Cancelled";
  type: "Simple" | "Corrective" | "Preventive";
  createdAt: Date;
  updatedAt: Date | null;
  completedAt: Date | null;
  assignedToId: string | null;
  managerId: string | null;
  findingId: string | null;
  dofId: string | null;
  finding?: {
    id: string;
    details: string;
  } | null;
  assignedTo?: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
  manager?: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
};

export function useActionColumns(): ColumnDef<ActionRecord>[] {
  const t = useTranslations('action');
  const tCommon = useTranslations('common');
  const tFinding = useTranslations('finding');

  return [
    {
      accessorKey: "details",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('fields.details')} />
      ),
    cell: ({ row }) => {
      const details = row.getValue("details") as string;
      return (
        <div className="max-w-[400px]">
          <p className="font-medium line-clamp-2">{details}</p>
          {row.original.finding && (
            <Link 
              href={`/denetim/findings/${row.original.finding.id}`}
              className="text-xs text-muted-foreground hover:text-primary mt-1 inline-flex items-center gap-1"
            >
              {tFinding('singular')}: {row.original.finding.details.substring(0, 40)}...
            </Link>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('fields.status')} />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as "Assigned" | "PendingManagerApproval" | "Completed" | "Rejected" | "Cancelled";
      return <StatusBadge status={status} type="action" />;
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "assignedTo",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('fields.responsiblePerson')} />
    ),
    cell: ({ row }) => {
      const assignedTo = row.original.assignedTo;
      if (!assignedTo) return <span className="text-muted-foreground">-</span>;
      return (
        <div className="text-sm">
          <p className="font-medium">{assignedTo.name || assignedTo.email}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "manager",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={tCommon('manager')} />
    ),
    cell: ({ row }) => {
      const manager = row.original.manager;
      if (!manager) return <span className="text-muted-foreground">-</span>;
      return (
        <div className="text-sm">
          <p className="font-medium">{manager.name || manager.email}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={tCommon('createdAt')} />
    ),
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date;
      return (
        <div className="text-sm text-muted-foreground">
          {formatDistanceToNow(new Date(date), { addSuffix: true, locale: tr })}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <Button asChild size="sm" variant="ghost">
          <Link href={`/denetim/actions/${row.original.id}`}>
            <Eye className="h-4 w-4 mr-2" />
            {tCommon('view')}
          </Link>
        </Button>
      );
    },
  },
];
}
