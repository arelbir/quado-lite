"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, MoreHorizontal, Eye } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";

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

export const columns: ColumnDef<Finding>[] = [
  {
    accessorKey: "details",
    header: "Bulgu Detayı",
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
    header: "Denetim",
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
    header: "Risk",
    cell: ({ row }) => {
      const risk = row.getValue("riskType") as string | null;
      const colors: Record<string, string> = {
        "Kritik": "text-red-600",
        "Yüksek": "text-orange-600",
        "Orta": "text-yellow-600",
        "Düşük": "text-green-600",
      };
      return risk ? (
        <span className={`text-sm font-medium ${colors[risk]}`}>{risk}</span>
      ) : (
        <span className="text-sm text-muted-foreground">-</span>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Durum",
    cell: ({ row }) => {
      return <StatusBadge status={row.getValue("status")} type="finding" />;
    },
  },
  {
    accessorKey: "assignedTo",
    header: "Sorumlu",
    cell: ({ row }) => {
      const assignedTo = row.original.assignedTo;
      return assignedTo ? (
        <span className="text-sm">{assignedTo.name}</span>
      ) : (
        <span className="text-sm text-muted-foreground">Atanmadı</span>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const finding = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Menüyü aç</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/denetim/findings/${finding.id}`} className="cursor-pointer">
                <Eye className="mr-2 h-4 w-4" />
                Detayları Görüntüle
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
