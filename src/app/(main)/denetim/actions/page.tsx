import { Suspense } from "react";
import { getMyActions } from "@/action/action-actions";
import { ActionsTableClient } from "./actions-table-client";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getTranslations } from 'next-intl/server';

export default async function ActionsPage() {
  const t = await getTranslations('action');
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">
          {t('sections.details')}
        </p>
      </div>

      <Suspense fallback={<ActionsTableSkeleton />}>
        <ActionsTableServer />
      </Suspense>
    </div>
  );
}

async function ActionsTableServer() {
  const actions = await getMyActions();
  return <ActionsTableClient data={actions} />;
}

function ActionsTableSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}
