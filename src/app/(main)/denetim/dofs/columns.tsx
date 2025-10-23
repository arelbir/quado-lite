"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header";
import { Eye } from "lucide-react";
import Link from "next/link";
import { useTranslations } from 'next-intl';
import { StatusBadge } from "@/components/ui/status-badge";

export type DofRecord = {
  id: string;
  problemTitle: string;
  status: string;
  createdAt: Date;
  updatedAt: Date | null;
  findingId: string | null;
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

export function useDofColumns(): ColumnDef<DofRecord>[] {
  const t = useTranslations('dof');
  const tCommon = useTranslations('common');
  const tFinding = useTranslations('finding');

  return [
    {
      accessorKey: "problemTitle",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('fields.problemTitle')} />
      ),
      cell: ({ row }) => {
        const title = row.getValue("problemTitle") as string;
        return (
          <div className="max-w-[300px]">
            <p className="font-medium line-clamp-2">{title}</p>
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
        const status = row.getValue("status") as any;
        return <StatusBadge status={status} type="dof" />;
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "assignedTo",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('fields.assignedTo')} />
      ),
      cell: ({ row }) => {
        const assignedTo = row.original.assignedTo;
        return assignedTo ? (
          <span className="text-sm">{assignedTo.name || assignedTo.email}</span>
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
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
        return manager ? (
          <span className="text-sm">{manager.name || manager.email}</span>
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
            <Link href={`/denetim/dofs/${row.original.id}`}>
              <Eye className="h-4 w-4 mr-2" />
              {tCommon('view')}
            </Link>
          </Button>
        );
      },
    },
  ];
}
