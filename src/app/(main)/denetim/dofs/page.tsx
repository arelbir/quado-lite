import { Suspense } from "react";
import { getMyDofs } from "@/action/dof-actions";
import { DofsTableClient } from "./dofs-table-client";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getTranslations } from 'next-intl/server';

export default async function DofsPage() {
  const t = await getTranslations('dof');
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">
          {t('description')}
        </p>
      </div>

      <Suspense fallback={<DofsTableSkeleton />}>
        <DofsTableServer />
      </Suspense>
    </div>
  );
}

async function DofsTableServer() {
  const dofs = await getMyDofs();
  return <DofsTableClient data={dofs} />;
}

function DofsTableSkeleton() {
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
