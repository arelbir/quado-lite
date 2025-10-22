import { Suspense } from "react";
import { getMyDofs } from "@/action/dof-actions";
import { DofsTableClient } from "./dofs-table-client";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DofsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">DÖF Kayıtlarım</h1>
        <p className="text-muted-foreground">
          Düzeltici ve Önleyici Faaliyet kayıtları (7 adımlı süreç)
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
