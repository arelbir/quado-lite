import { Suspense } from "react";
import { notFound } from "next/navigation";
import { db } from "@/drizzle/db";
import { actions } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Calendar, User, Clock, CheckCircle2, XCircle, FileText, TrendingUp, History } from "lucide-react";
import Link from "next/link";
import { ActionDetailActions } from "@/components/actions/action-detail-actions";
import { ActionTimeline } from "@/components/actions/action-timeline";
import { ActionProgressForm } from "@/components/actions/action-progress-form";

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
      progressNotes: {
        with: {
          createdBy: {
            columns: {
              id: true,
              name: true,
              email: true,
            },
          },
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
    Cancelled: {
      label: "İptal Edildi",
      color: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400",
      icon: XCircle,
    },
  };

  const currentStatus = statusConfig[action.status];
  const StatusIcon = currentStatus.icon;

  return (
    <div className="space-y-4">
      {/* Compact Sticky Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/denetim/actions">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-lg font-bold">Aksiyon</h1>
              <p className="text-xs text-muted-foreground">#{action.id.substring(0, 8)}</p>
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
      </div>

      {/* Main Layout: Tabs + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Main Content: Tabs */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">
                <FileText className="h-4 w-4 mr-2" />
                Genel
              </TabsTrigger>
              <TabsTrigger value="progress">
                <TrendingUp className="h-4 w-4 mr-2" />
                İlerleme
              </TabsTrigger>
            </TabsList>

            {/* Tab 1: Overview */}
            <TabsContent value="overview" className="space-y-4 mt-4">
              {/* Aksiyon Detayı */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Aksiyon Açıklaması</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed">{action.details}</p>
                </CardContent>
              </Card>

              {/* Tamamlama Notları */}
              {action.completionNotes && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      Yapılan İş
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900">
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
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-600" />
                      Red Nedeni
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900">
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
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Bağlı Bulgu</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Link
                      href={`/denetim/findings/${action.finding.id}`}
                      className="block p-3 border rounded-lg hover:bg-accent transition-colors"
                    >
                      <p className="text-sm font-medium mb-1">{action.finding.details}</p>
                      <p className="text-xs text-muted-foreground">
                        Detayları görüntüle →
                      </p>
                    </Link>
                  </CardContent>
                </Card>
              )}

              {/* Tarihler */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Tarihler</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Oluşturulma</p>
                      <p className="text-sm">
                        {new Date(action.createdAt).toLocaleString("tr-TR", { 
                          day: '2-digit', 
                          month: 'short', 
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>

                    {action.completedAt && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Tamamlanma</p>
                        <p className="text-sm">
                          {new Date(action.completedAt).toLocaleString("tr-TR", { 
                            day: '2-digit', 
                            month: 'short', 
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    )}

                    {action.updatedAt && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Son Güncelleme</p>
                        <p className="text-sm">
                          {new Date(action.updatedAt).toLocaleString("tr-TR", { 
                            day: '2-digit', 
                            month: 'short', 
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 2: Progress */}
            <TabsContent value="progress" className="space-y-4 mt-4">
              <ActionProgressForm 
                actionId={action.id}
                actionStatus={action.status}
              />
            </TabsContent>

          </Tabs>
        </div>

        {/* Sidebar: Timeline + Atama */}
        <div className="lg:col-span-1 space-y-4">
          {/* Timeline - Always Visible */}
          <ActionTimeline action={action as any} />

          {/* Atama Bilgileri - Kompakt */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Atama</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Sorumlu</p>
                <p className="text-sm">
                  {action.assignedTo?.name || action.assignedTo?.email || "-"}
                </p>
              </div>
              <Separator />
              <div>
                <p className="text-xs font-medium text-muted-foreground">Yönetici</p>
                <p className="text-sm">
                  {action.manager?.name || action.manager?.email || "-"}
                </p>
              </div>
              <Separator />
              <div>
                <p className="text-xs font-medium text-muted-foreground">Oluşturan</p>
                <p className="text-sm">
                  {action.createdBy?.name || action.createdBy?.email || "-"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
