"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header";
import { Eye, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

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

const statusConfig: Record<string, { label: string; color: string; icon: any; step?: string }> = {
  Step1_Problem: {
    label: "1. Problem Tanımı",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
    icon: AlertCircle,
    step: "1/7",
  },
  Step2_TempMeasures: {
    label: "2. Geçici Önlemler",
    color: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-400",
    icon: Clock,
    step: "2/7",
  },
  Step3_RootCause: {
    label: "3. Kök Neden",
    color: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
    icon: AlertCircle,
    step: "3/7",
  },
  Step4_Activities: {
    label: "4. Faaliyetler",
    color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400",
    icon: Clock,
    step: "4/7",
  },
  Step5_Implementation: {
    label: "5. Uygulama",
    color: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400",
    icon: Clock,
    step: "5/7",
  },
  Step6_EffectivenessCheck: {
    label: "6. Etkinlik Kontrolü",
    color: "bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400",
    icon: Clock,
    step: "6/7",
  },
  PendingManagerApproval: {
    label: "Yönetici Onayı",
    color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
    icon: Clock,
    step: "7/7",
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

// Progress hesaplama
function getProgress(status: string): number {
  const stepMap: Record<string, number> = {
    Step1_Problem: 14,
    Step2_TempMeasures: 28,
    Step3_RootCause: 42,
    Step4_Activities: 57,
    Step5_Implementation: 71,
    Step6_EffectivenessCheck: 85,
    PendingManagerApproval: 95,
    Completed: 100,
    Rejected: 0,
  };
  return stepMap[status] || 0;
}

export const columns: ColumnDef<DofRecord>[] = [
  {
    accessorKey: "problemTitle",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Problem" />
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
      const status = row.getValue("status") as string;
      const config = statusConfig[status] ?? statusConfig.Step1_Problem;
      const Icon = config?.icon ?? Clock;
      const progress = getProgress(status);

      return (
        <div className="space-y-1">
          <Badge className={config?.color ?? "bg-gray-100 text-gray-800"}>
            <Icon className="h-3 w-3 mr-1" />
            {config?.step && <span className="mr-1">{config.step}</span>}
            {config?.label ?? "Bilinmeyen"}
          </Badge>
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
            <div
              className="bg-primary h-1.5 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
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
          <Link href={`/denetim/dofs/${row.original.id}`}>
            <Eye className="h-4 w-4 mr-2" />
            Detay
          </Link>
        </Button>
      );
    },
  },
];
