import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Zap } from "lucide-react";
import Link from "next/link";
import { UnifiedAuditsTable } from "./unified-table";

export default function UnifiedAuditsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Denetimler & Planlar</h1>
          <p className="text-muted-foreground">
            Tüm denetim ve planlarınızı tek yerden yönetin
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/denetim/plans/new?type=scheduled">
              <Calendar className="h-4 w-4 mr-2" />
              Planlı Denetim
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/denetim/plans/new?type=adhoc">
              <Zap className="h-4 w-4 mr-2" />
              Hemen Başlat
            </Link>
          </Button>
        </div>
      </div>

      <Suspense fallback={<div>Yükleniyor...</div>}>
        <UnifiedAuditsTable />
      </Suspense>
    </div>
  );
}
