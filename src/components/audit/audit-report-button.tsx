"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { toast } from "sonner";
import { downloadAuditReport } from "@/action/report-actions";

interface AuditReportButtonProps {
  auditId: string;
}

export function AuditReportButton({ auditId }: AuditReportButtonProps) {
  const [format, setFormat] = useState<"excel" | "pdf">("excel");
  const [isPending, startTransition] = useTransition();

  const handleDownload = async () => {
    startTransition(async () => {
      try {
        // Get base64 string from server
        const base64String = await downloadAuditReport(auditId, format);

        // Decode base64 to binary
        const binaryString = atob(base64String);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        // Create blob and download
        const blob = new Blob([bytes], {
          type:
            format === "excel"
              ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              : "application/pdf",
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `denetim-raporu-${auditId}.${format === "excel" ? "xlsx" : "pdf"}`;
        link.click();

        // Cleanup
        URL.revokeObjectURL(url);

        toast.success("Rapor indirildi!");
      } catch (error) {
        console.error("Report download error:", error);
        toast.error("Rapor oluşturulurken hata oluştu.");
      }
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={format} onValueChange={(v) => setFormat(v as "excel" | "pdf")}>
        <SelectTrigger className="w-[140px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="excel">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-green-600" />
              <span>Excel</span>
            </div>
          </SelectItem>
          <SelectItem value="pdf">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-red-600" />
              <span>PDF</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>

      <Button onClick={handleDownload} disabled={isPending}>
        <Download className="mr-2 h-4 w-4" />
        {isPending ? "Oluşturuluyor..." : "Rapor İndir"}
      </Button>
    </div>
  );
}
