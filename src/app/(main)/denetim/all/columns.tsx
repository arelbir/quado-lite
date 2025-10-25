"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar, Eye, Play, Edit, MoreVertical, Trash2, Ban, Archive, ArchiveRestore } from "lucide-react";
import Link from "next/link";
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header";
import { startPlanManually, deletePlan } from "@/server/actions/audit-plan-actions";
import { archiveAudit, reactivateAudit, deleteAudit } from "@/server/actions/audit-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { 
  AUDIT_STATUS_LABELS, 
  AUDIT_STATUS_COLORS, 
  PLAN_STATUS_LABELS, 
  PLAN_STATUS_COLORS 
} from "@/lib/constants/status-labels";

export type UnifiedRecord = {
  id: string;
  type: "plan" | "audit";
  title: string;
  description: string | null;
  date: Date;
  status: string;
  scheduleType?: string;
  auditorId?: string | null; // 🔥 FIX: Denetçi kontrolü için
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
      
      // Merge audit and plan status configs
      const allColors = { ...AUDIT_STATUS_COLORS, ...PLAN_STATUS_COLORS };
      const allLabels = { ...AUDIT_STATUS_LABELS, ...PLAN_STATUS_LABELS };
      
      const colorClass = allColors[status as keyof typeof allColors] || "bg-gray-100 text-gray-800";
      const label = allLabels[status as keyof typeof allLabels] || status;
      
      return (
        <Badge className={`text-xs ${colorClass}`}>
          {label}
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
    filterFn: (row, columnId, filterValue) => {
      if (!filterValue) return true;
      
      const rowDate = new Date(row.getValue(columnId) as Date);
      const { from, to } = filterValue as { from?: Date; to?: Date };
      
      if (!from && !to) return true;
      if (from && !to) return rowDate >= from;
      if (!from && to) return rowDate <= to;
      
      return from && to ? rowDate >= from && rowDate <= to : true;
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
    cell: function ActionsCell({ row }) {
      const record = row.original;
      const router = useRouter();

      const handleStartPlan = async () => {
        const result = await startPlanManually(record.id);
        if (result.success) {
          toast.success("Denetim başlatıldı!");
          router.refresh();
        } else {
          toast.error(result.error);
        }
      };

      const handleDeletePlan = async () => {
        const result = await deletePlan(record.id);
        if (result.success) {
          toast.success("Plan silindi!");
          router.refresh();
        } else {
          toast.error(result.error);
        }
      };

      const handleArchiveAudit = async () => {
        const result = await archiveAudit(record.id);
        if (result.success) {
          toast.success("Denetim arşivlendi!");
          router.refresh();
        } else {
          toast.error(result.error);
        }
      };

      const handleReactivateAudit = async () => {
        const result = await reactivateAudit(record.id);
        if (result.success) {
          toast.success("Denetim aktif edildi!");
          router.refresh();
        } else {
          toast.error(result.error);
        }
      };

      const handleDeleteAudit = async () => {
        const result = await deleteAudit(record.id);
        if (result.success) {
          toast.success("Denetim silindi!");
          router.refresh();
        } else {
          toast.error(result.error);
        }
      };

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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  onClick={handleStartPlan}
                  disabled={!record.auditorId}
                >
                  <Play className="h-4 w-4 mr-2" />
                  {!record.auditorId ? "Denetçi Atamalısınız" : "Hemen Başlat"}
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/denetim/plans/${record.id}/edit`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Düzenle
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDeletePlan} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Sil
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        }
      } else {
        // Audit
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/denetim/audits/${record.id}`}>
                  <Eye className="h-4 w-4 mr-2" />
                  Detaylar
                </Link>
              </DropdownMenuItem>
              {record.status === "Active" && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleArchiveAudit}>
                    <Archive className="h-4 w-4 mr-2" />
                    Pasife Al
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDeleteAudit} className="text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Sil
                  </DropdownMenuItem>
                </>
              )}
              {record.status === "Archived" && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleReactivateAudit}>
                    <ArchiveRestore className="h-4 w-4 mr-2" />
                    Aktife Al
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDeleteAudit} className="text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Sil
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      }

      return null;
    },
  },
];
