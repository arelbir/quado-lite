import { Suspense } from "react";
import { db } from "@/drizzle/db";
import { findings } from "@/drizzle/schema";
import { count } from "drizzle-orm";
import { ExportButton } from "@/components/export/export-button";
import { exportFindingsToExcel } from "@/server/actions/export-actions";
import { FindingsTableClient } from "./findings-table-client";
import { getTranslations } from 'next-intl/server';
import { paginate } from "@/lib/pagination-helper";

interface PageProps {
  searchParams: {
    page?: string
    per_page?: string
  }
}

export default async function FindingsPage({ searchParams }: PageProps) {
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
        <FindingsTableServer searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function FindingsTableServer({ searchParams }: PageProps) {
  // ✅ SERVER-SIDE PAGINATION
  const result = await paginate(
    // Query: Only fetch one page
    async (limit, offset) => {
      return db.query.findings.findMany({
        limit,
        offset,
        with: {
          audit: { columns: { id: true, title: true } },
          assignedTo: { columns: { id: true, name: true } },
        },
        orderBy: (findings, { desc }) => [desc(findings.createdAt)],
      });
    },
    // Count: Total findings
    async () => {
      const result = await db.select({ value: count() }).from(findings);
      return result[0]?.value ?? 0;
    },
    searchParams
  );

  return <FindingsTableClient data={result.data as any} pageCount={result.pageCount} />;
}
