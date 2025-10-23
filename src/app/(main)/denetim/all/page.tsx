import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Zap, ClipboardList, Play } from "lucide-react";
import Link from "next/link";
import { UnifiedAuditsTable } from "./unified-table";
import { getTranslations } from 'next-intl/server';

export default async function UnifiedAuditsPage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const activeTab = searchParams.tab || "audits";
  const t = await getTranslations('audit');
  const tCommon = await getTranslations('common');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('title')} & {t('plans.title')}</h1>
          <p className="text-muted-foreground">
            {t('description')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/denetim/plans/new?type=scheduled">
              <Calendar className="h-4 w-4 mr-2" />
              {t('plans.scheduled')}
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/denetim/plans/new?type=adhoc">
              <Zap className="h-4 w-4 mr-2" />
              {t('plans.adhoc')}
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue={activeTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="audits" asChild>
            <Link href="/denetim/all?tab=audits" className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              {t('title')}
            </Link>
          </TabsTrigger>
          <TabsTrigger value="plans" asChild>
            <Link href="/denetim/all?tab=plans" className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              {t('plans.title')}
            </Link>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="audits" className="mt-6">
          <Suspense fallback={<div>{tCommon('status.loading')}</div>}>
            <UnifiedAuditsTable type="audit" />
          </Suspense>
        </TabsContent>

        <TabsContent value="plans" className="mt-6">
          <Suspense fallback={<div>{tCommon('status.loading')}</div>}>
            <UnifiedAuditsTable type="plan" />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
