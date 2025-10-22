"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header";
import { Eye, CheckCircle2, XCircle, Clock } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

export type ActionRecord = {
  id: string;
  details: string;
  status: "Assigned" | "PendingManagerApproval" | "Completed" | "Rejected";
  createdAt: Date;
  updatedAt: Date | null;
  completedAt: Date | null;
  assignedToId: string | null;
  managerId: string | null;
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

const statusConfig = {
  Assigned: {
    label: "Atandı",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
    icon: Clock,
  },
  PendingManagerApproval: {
    label: "Onay Bekliyor",
    color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
    icon: Clock,
  },
  Completed: {
    label: "Tamamlandı",
    color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
    icon: CheckCircle2,
  },
  Rejected: {
    label: "Reddedildi",
    color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
    icon: XCircle,
  },
};

export const columns: ColumnDef<ActionRecord>[] = [
  {
    accessorKey: "details",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Aksiyon" />
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
              Bulgu: {row.original.finding.details.substring(0, 40)}...
            </Link>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Durum" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as keyof typeof statusConfig;
      const config = statusConfig[status];
      const Icon = config.icon;

      return (
        <Badge className={config.color}>
          <Icon className="h-3 w-3 mr-1" />
          {config.label}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "assignedTo",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Sorumlu" />
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
      <DataTableColumnHeader column={column} title="Yönetici" />
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
      <DataTableColumnHeader column={column} title="Oluşturulma" />
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
            Detay
          </Link>
        </Button>
      );
    },
  },
];
