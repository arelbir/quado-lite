"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ExportButtonProps {
  onExport: () => Promise<Buffer>;
  filename: string;
  label?: string;
  variant?: "default" | "outline" | "ghost";
}

export function ExportButton({ 
  onExport, 
  filename, 
  label = "Excel İndir",
  variant = "outline" 
}: ExportButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleExport = () => {
    startTransition(async () => {
      try {
        const buffer = await onExport();
        
        // Create blob and download
        const blob = new Blob([buffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        toast.success("Excel dosyası indirildi!");
      } catch (error) {
        console.error("Export error:", error);
        toast.error("Excel oluşturulurken hata oluştu");
      }
    });
  };

  return (
    <Button
      variant={variant}
      onClick={handleExport}
      disabled={isPending}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Download className="h-4 w-4 mr-2" />
      )}
      {label}
    </Button>
  );
}
