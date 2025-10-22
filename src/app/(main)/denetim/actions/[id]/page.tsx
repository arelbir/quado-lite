import { Suspense } from "react";
import { notFound } from "next/navigation";
import { db } from "@/drizzle/db";
import { actions } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, User, Clock, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { ActionDetailActions } from "@/components/actions/action-detail-actions";
import { ActionTimeline } from "@/components/actions/action-timeline";

interface PageProps {
  params: { id: string };
}

export default async function ActionDetailPage({ params }: PageProps) {
  const action = await db.query.actions.findFirst({
    where: eq(actions.id, params.id),
    with: {
      finding: true,
      assignedTo: {
        columns: {
          id: true,
          name: true,
          email: true,
        },
      },
      manager: {
        columns: {
          id: true,
          name: true,
          email: true,
        },
      },
      createdBy: {
        columns: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!action) {
    notFound();
  }

  const statusConfig = {
    Assigned: {
      label: "Atandı",
      color: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
      icon: Clock,
    },
    PendingManagerApproval: {
      label: "Onay Bekliyor",
      color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
      icon: Clock,
    },
    Completed: {
      label: "Tamamlandı",
      color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
      icon: CheckCircle2,
    },
    Rejected: {
      label: "Reddedildi",
      color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
      icon: XCircle,
    },
  };

  const currentStatus = statusConfig[action.status];
  const StatusIcon = currentStatus.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/denetim/actions">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl md:text-2xl font-bold">Aksiyon Detayı</h1>
            <p className="text-sm text-muted-foreground">#{action.id.substring(0, 8)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={currentStatus.color}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {currentStatus.label}
          </Badge>
          <Suspense fallback={<div />}>
            <ActionDetailActions actionId={action.id} status={action.status} />
          </Suspense>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sol: Detaylar */}
        <div className="lg:col-span-2 space-y-6">
          {/* Aksiyon Detayı */}
          <Card>
            <CardHeader>
              <CardTitle>Aksiyon Açıklaması</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{action.details}</p>
            </CardContent>
          </Card>

          {/* Tamamlama Notları */}
          {action.completionNotes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  Yapılan İş
                </CardTitle>
                <CardDescription>
                  Sorumlu tarafından yazılan tamamlama açıklaması
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {action.completionNotes}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Red Nedeni */}
          {action.rejectionReason && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-600" />
                  Red Nedeni
                </CardTitle>
                <CardDescription>
                  Yönetici tarafından yazılan ret açıklaması
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {action.rejectionReason}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Bağlı Bulgu */}
          {action.finding && (
            <Card>
              <CardHeader>
                <CardTitle>Bağlı Bulgu</CardTitle>
              </CardHeader>
              <CardContent>
                <Link
                  href={`/denetim/findings/${action.finding.id}`}
                  className="block p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <p className="font-medium mb-2">{action.finding.details}</p>
                  <p className="text-xs text-muted-foreground">
                    Bulgu detaylarını görüntülemek için tıklayın →
                  </p>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          <ActionTimeline action={action} />
        </div>

        {/* Sağ: Bilgiler */}
        <div className="space-y-6">
          {/* Atama Bilgileri */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Atama Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Sorumlu</p>
                  <p className="text-sm text-muted-foreground">
                    {action.assignedTo?.name || action.assignedTo?.email || "-"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Yönetici</p>
                  <p className="text-sm text-muted-foreground">
                    {action.manager?.name || action.manager?.email || "-"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Oluşturan</p>
                  <p className="text-sm text-muted-foreground">
                    {action.createdBy?.name || action.createdBy?.email || "-"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tarihler */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tarihler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Oluşturulma</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(action.createdAt).toLocaleString("tr-TR")}
                  </p>
                </div>
              </div>

              {action.completedAt && (
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Tamamlanma</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(action.completedAt).toLocaleString("tr-TR")}
                    </p>
                  </div>
                </div>
              )}

              {action.updatedAt && (
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Son Güncelleme</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(action.updatedAt).toLocaleString("tr-TR")}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
