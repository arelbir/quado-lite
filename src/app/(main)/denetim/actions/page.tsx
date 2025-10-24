import { Suspense } from "react";
import { db } from "@/drizzle/db";
import { actions } from "@/drizzle/schema";
import { count, eq, or } from "drizzle-orm";
import { ActionsTableClient } from "./actions-table-client";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getTranslations } from 'next-intl/server';
import { requireUser } from "@/lib/helpers/auth-helpers";
import { paginate, getPaginationInfo } from "@/lib/pagination-helper";

interface PageProps {
  searchParams: {
    page?: string
    per_page?: string
  }
}

export default async function ActionsPage({ searchParams }: PageProps) {
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
        <ActionsTableServer searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function ActionsTableServer({ searchParams }: PageProps) {
  const authResult = await requireUser();
  if ('error' in authResult) {
    return <div>Please login</div>;
  }
  const user = authResult.user as any; // Type fix needed

  // ✅ SERVER-SIDE PAGINATION
  const result = await paginate(
    // Query: Only fetch one page
    async (limit, offset) => {
      // Admin görür tüm aksiyonları, normal user sadece kendisine atananları
      if (user.role === "admin" || user.role === "superAdmin") {
        return db.query.actions.findMany({
          limit,
          offset,
          with: {
            assignedTo: { columns: { id: true, name: true, email: true } },
            manager: { columns: { id: true, name: true, email: true } },
            finding: { columns: { id: true, details: true } },
          },
          orderBy: (actions, { desc }) => [desc(actions.createdAt)],
        });
      } else {
        return db.query.actions.findMany({
          limit,
          offset,
          where: or(
            eq(actions.assignedToId, user.id),
            eq(actions.managerId, user.id)
          ),
          with: {
            assignedTo: { columns: { id: true, name: true, email: true } },
            manager: { columns: { id: true, name: true, email: true } },
            finding: { columns: { id: true, details: true } },
          },
          orderBy: (actions, { desc }) => [desc(actions.createdAt)],
        });
      }
    },
    // Count: Total actions for this user
    async () => {
      if (user.role === "admin" || user.role === "superAdmin") {
        const result = await db.select({ value: count() }).from(actions);
        return result[0]?.value ?? 0;
      } else {
        const result = await db
          .select({ value: count() })
          .from(actions)
          .where(or(
            eq(actions.assignedToId, user.id),
            eq(actions.managerId, user.id)
          ));
        return result[0]?.value ?? 0;
      }
    },
    searchParams
  );

  return <ActionsTableClient data={result.data as any} pageCount={result.pageCount} />;
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
