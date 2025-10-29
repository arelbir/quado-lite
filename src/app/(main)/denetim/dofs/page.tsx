import { Suspense } from "react";
import { db } from "@/drizzle/db";
import { dofs } from "@/drizzle/schema";
import { count, eq, or } from "drizzle-orm";
import { DofsTableClient } from "./dofs-table-client";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getTranslations } from 'next-intl/server';
import { requireUser, requireAdmin } from "@/lib/helpers/auth-helpers";
import { paginate } from "@/lib/pagination-helper";

interface PageProps {
  searchParams: {
    page?: string
    per_page?: string
  }
}

export default async function DofsPage({ searchParams }: PageProps) {
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
        <DofsTableServer searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function DofsTableServer({ searchParams }: PageProps) {
  const authResult = await requireUser();
  if ('error' in authResult) {
    return <div>Please login</div>;
  }
  const user = authResult.user as any;

  // ✅ SERVER-SIDE PAGINATION
  // Check if user is admin using requireAdmin helper
  const isAdmin = requireAdmin(user);

  const result = await paginate(
    // Query: Only fetch one page
    async (limit, offset) => {
      // Admin görür tüm DÖF'leri, normal user sadece kendisine atananları
      if (isAdmin) {
        return db.query.dofs.findMany({
          limit,
          offset,
          with: {
            finding: { columns: { id: true, details: true } },
            assignedTo: { columns: { id: true, name: true, email: true } },
            manager: { columns: { id: true, name: true, email: true } },
          } as any,
          orderBy: (dofs, { desc }) => [desc(dofs.createdAt)],
        });
      } else {
        return db.query.dofs.findMany({
          limit,
          offset,
          where: or(
            eq(dofs.assignedToId, user.id),
            eq(dofs.managerId, user.id)
          ),
          with: {
            finding: { columns: { id: true, details: true } },
            assignedTo: { columns: { id: true, name: true, email: true } },
            manager: { columns: { id: true, name: true, email: true } },
          } as any,
          orderBy: (dofs, { desc }) => [desc(dofs.createdAt)],
        });
      }
    },
    // Count: Total dofs for this user
    async () => {
      if (isAdmin) {
        const result = await db.select({ value: count() }).from(dofs);
        return result[0]?.value ?? 0;
      } else {
        const result = await db
          .select({ value: count() })
          .from(dofs)
          .where(or(
            eq(dofs.assignedToId, user.id),
            eq(dofs.managerId, user.id)
          ));
        return result[0]?.value ?? 0;
      }
    },
    searchParams
  );

  return <DofsTableClient data={result.data as any} pageCount={result.pageCount} />;
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
