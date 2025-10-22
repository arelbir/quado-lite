import { Suspense } from "react";
import { getFindings } from "@/action/finding-actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { closeFinding, rejectFinding } from "@/action/finding-actions";

export default function ClosuresPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Kapanış Onayı</h1>
        <p className="text-muted-foreground">
          Denetçi onayı bekleyen bulguları görüntüleyin
        </p>
      </div>

      <Suspense fallback={<div>Yükleniyor...</div>}>
        <PendingClosures />
      </Suspense>
    </div>
  );
}

async function PendingClosures() {
  const findings = await getFindings();
  const pendingFindings = findings.filter(f => f.status === "PendingAuditorClosure");

  if (pendingFindings.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Onay bekleyen bulgu yok</h3>
          <p className="text-sm text-muted-foreground">
            Tüm bulgular işlendi
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Onay Bekleyen Bulgular</CardTitle>
        <CardDescription>
          {pendingFindings.length} bulgu denetçi onayı bekliyor
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pendingFindings.map((finding) => (
            <div
              key={finding.id}
              className="flex items-start justify-between p-4 border rounded-lg"
            >
              <div className="flex-1">
                <Link 
                  href={`/denetim/findings/${finding.id}`}
                  className="font-medium hover:underline"
                >
                  {finding.details}
                </Link>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span>Denetim: {finding.audit?.title}</span>
                  <span>Sorumlu: {finding.assignedTo?.name || "Atanmadı"}</span>
                  {finding.riskType && (
                    <span className="font-medium text-orange-600">
                      {finding.riskType} Risk
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <form action={async () => {
                  "use server";
                  await rejectFinding(finding.id);
                }}>
                  <Button type="submit" size="sm" variant="outline">
                    <XCircle className="h-4 w-4 mr-2" />
                    Reddet
                  </Button>
                </form>
                <form action={async () => {
                  "use server";
                  await closeFinding(finding.id);
                }}>
                  <Button type="submit" size="sm">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Onayla
                  </Button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
