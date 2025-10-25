"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header";
import { CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";
import { format } from "date-fns";

export interface HRSyncLog {
  id: string;
  status: string;
  sourceType: string;
  startedAt: Date;
  completedAt: Date | null;
  totalRecords: number | null;
  successCount: number | null;
  failedCount: number | null;
  skippedCount: number | null;
  config: {
    id: string;
    name: string;
    sourceType: string;
  } | null;
}

export const columns: ColumnDef<HRSyncLog>[] = [
  {
    accessorKey: "config.name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Config" />
    ),
    cell: ({ row }) => {
      const configName = row.original.config?.name || "Manual Sync";
      return <span className="font-medium">{configName}</span>;
    },
  },
  {
    accessorKey: "config.sourceType",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Source" />
    ),
    cell: ({ row }) => {
      const sourceType = row.original.config?.sourceType || row.original.sourceType || "MANUAL";
      const icons: Record<string, string> = {
        LDAP: "🔐",
        CSV: "📄",
        REST_API: "🌐",
        "REST API": "🌐",
        MANUAL: "👤",
      };
      return (
        <div className="flex items-center gap-2">
          <span>{icons[sourceType] || "📊"}</span>
          <span>{sourceType}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      
      const statusConfig: Record<string, { label: string; icon: any; className: string }> = {
        Completed: {
          label: "Completed",
          icon: CheckCircle2,
          className: "bg-green-100 text-green-800",
        },
        Failed: {
          label: "Failed",
          icon: XCircle,
          className: "bg-red-100 text-red-800",
        },
        InProgress: {
          label: "In Progress",
          icon: Clock,
          className: "bg-blue-100 text-blue-800",
        },
        PartialSuccess: {
          label: "Partial",
          icon: AlertCircle,
          className: "bg-orange-100 text-orange-800",
        },
      };

      const config = statusConfig[status] || statusConfig.InProgress;
      const Icon = config?.icon || Clock;

      return (
        <Badge className={config?.className || "bg-gray-100 text-gray-800"}>
          <Icon className="w-3 h-3 mr-1" />
          {config?.label || status}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "startedAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Started" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("startedAt"));
      return (
        <span suppressHydrationWarning>
          {format(date, "MMM dd, yyyy HH:mm")}
        </span>
      );
    },
  },
  {
    id: "duration",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Duration" />
    ),
    cell: ({ row }) => {
      const startedAt = new Date(row.original.startedAt);
      const completedAt = row.original.completedAt ? new Date(row.original.completedAt) : new Date();
      const durationMs = completedAt.getTime() - startedAt.getTime();
      const seconds = Math.floor(durationMs / 1000);
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      
      if (minutes > 0) {
        return <span>{minutes}m {remainingSeconds}s</span>;
      }
      return <span>{seconds}s</span>;
    },
  },
  {
    accessorKey: "totalRecords",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Records" />
    ),
    cell: ({ row }) => {
      return <span>{row.getValue("totalRecords") || "0"}</span>;
    },
  },
  {
    accessorKey: "successCount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Success" />
    ),
    cell: ({ row }) => {
      return (
        <span className="text-green-600 font-medium">
          {row.getValue("successCount") || "0"}
        </span>
      );
    },
  },
  {
    accessorKey: "failedCount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Failed" />
    ),
    cell: ({ row }) => {
      const failed = row.getValue("failedCount") as number;
      return failed > 0 ? (
        <span className="text-red-600 font-medium">{failed}</span>
      ) : (
        <span className="text-muted-foreground">0</span>
      );
    },
  },
];
