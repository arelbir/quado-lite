import { Suspense } from "react";
import { getFindings } from "@/action/finding-actions";
import { ExportButton } from "@/components/export/export-button";
import { exportFindingsToExcel } from "@/action/export-actions";
import { FindingsTableClient } from "./findings-table-client";
import { getTranslations } from 'next-intl/server';

export default async function FindingsPage() {
  const t = await getTranslations('finding');
  const tCommon = await getTranslations('common');
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">
            {t('description')}
          </p>
        </div>
        <div className="flex gap-2">
          <ExportButton
            onExport={exportFindingsToExcel}
            filename={`${t('title').toLowerCase()}_${new Date().toISOString().split('T')[0]}.xlsx`}
          />
        </div>
      </div>

      <Suspense fallback={<div>{tCommon('status.loading')}</div>}>
        <FindingsTableServer />
      </Suspense>
    </div>
  );
}

async function FindingsTableServer() {
  const findings = await getFindings();
  return <FindingsTableClient data={findings} />;
}
