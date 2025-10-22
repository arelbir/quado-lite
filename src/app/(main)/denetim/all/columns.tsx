"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Eye, Play, Edit } from "lucide-react";
import Link from "next/link";
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header";

export type UnifiedRecord = {
  id: string;
  type: "plan" | "audit";
  title: string;
  description: string | null;
  date: Date;
  status: string;
  scheduleType?: string;
  createdBy: {
    id: string;
    name: string | null;
    email?: string | null;
  } | null;
  template?: {
    id: string;
    name: string;
  } | null;
  createdAudit?: {
    id: string;
  } | null;
  createdAt: Date;
};

export const columns: ColumnDef<UnifiedRecord>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Başlık" />
    ),
    cell: ({ row }) => {
      const record = row.original;
      return (
        <div className="flex flex-col">
          <span className="font-medium">{record.title}</span>
          {record.description && (
            <span className="text-sm text-muted-foreground line-clamp-1">
              {record.description}
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tip" />
    ),
    cell: ({ row }) => {
      const record = row.original;
      return record.type === "plan" ? (
        <Badge variant="outline" className="text-xs">
          <Calendar className="h-3 w-3 mr-1" />
          {record.scheduleType === "Scheduled" ? "Planlı" : "Plansız"}
        </Badge>
      ) : (
        <Badge variant="default" className="text-xs">
          <Play className="h-3 w-3 mr-1" />
          Denetim
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Durum" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const colors: Record<string, string> = {
        Pending: "bg-yellow-100 text-yellow-800",
        Created: "bg-green-100 text-green-800",
        Cancelled: "bg-red-100 text-red-800",
        Active: "bg-blue-100 text-blue-800",
      };
      const labels: Record<string, string> = {
        Pending: "Plan Bekliyor",
        Created: "Oluşturuldu",
        Cancelled: "İptal",
        Active: "Aktif",
      };
      return (
        <Badge className={`text-xs ${colors[status] || ""}`}>
          {labels[status] || status}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tarih" />
    ),
    cell: ({ row }) => {
      const date = row.getValue("date") as Date;
      return (
        <span className="text-sm">
          {new Date(date).toLocaleDateString("tr-TR")}
        </span>
      );
    },
  },
  {
    accessorKey: "createdBy",
    header: "Oluşturan",
    cell: ({ row }) => {
      const createdBy = row.original.createdBy;
      return (
        <span className="text-sm">
          {createdBy?.name || createdBy?.email || "Bilinmiyor"}
        </span>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const record = row.original;

      if (record.type === "plan") {
        if (record.createdAudit) {
          return (
            <Button asChild size="sm" variant="outline">
              <Link href={`/denetim/audits/${record.createdAudit.id}`}>
                <Eye className="h-4 w-4 mr-2" />
                Denetimi Aç
              </Link>
            </Button>
          );
        } else if (record.status === "Pending") {
          return (
            <div className="flex gap-2">
              <Button asChild size="sm" variant="outline">
                <Link href={`/denetim/plans/${record.id}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Düzenle
                </Link>
              </Button>
              <Button asChild size="sm">
                <Link href={`/denetim/plans/${record.id}/start`}>
                  <Play className="h-4 w-4 mr-2" />
                  Başlat
                </Link>
              </Button>
            </div>
          );
        }
      } else {
        return (
          <Button asChild size="sm" variant="outline">
            <Link href={`/denetim/audits/${record.id}`}>
              <Eye className="h-4 w-4 mr-2" />
              Detaylar
            </Link>
          </Button>
        );
      }

      return null;
    },
  },
];
