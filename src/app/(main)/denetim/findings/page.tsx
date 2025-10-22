import { Suspense } from "react";
import { getFindings } from "@/action/finding-actions";
import { ExportButton } from "@/components/export/export-button";
import { exportFindingsToExcel } from "@/action/export-actions";
import { FindingsTableClient } from "./findings-table-client";

export default function FindingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bulgular</h1>
          <p className="text-muted-foreground">
            Tüm denetim bulgularını görüntüleyin
          </p>
        </div>
        <div className="flex gap-2">
          <ExportButton
            onExport={exportFindingsToExcel}
            filename={`bulgular_${new Date().toISOString().split('T')[0]}.xlsx`}
          />
        </div>
      </div>

      <Suspense fallback={<div>Yükleniyor...</div>}>
        <FindingsTableServer />
      </Suspense>
    </div>
  );
}

async function FindingsTableServer() {
  const findings = await getFindings();
  return <FindingsTableClient data={findings} />;
}
