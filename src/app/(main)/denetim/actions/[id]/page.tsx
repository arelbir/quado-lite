import { Suspense } from "react";
import { notFound } from "next/navigation";
import { db } from "@/drizzle/db";
import { actions } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { getCustomFieldValuesWithDefinitions } from "@/server/actions/custom-field-value-actions";
import { CustomFieldsDisplay } from "@/components/forms/CustomFieldsDisplay";
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
import { getTranslations } from 'next-intl/server';
import { cookies } from 'next/headers';
import { defaultLocale, type Locale, locales } from '@/i18n/config';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ActionDetailPage({ params }: PageProps) {
  const { id } = await params;
  const cookieStore = cookies();
  const localeCookie = cookieStore.get('NEXT_LOCALE');
  const locale = (localeCookie?.value && locales.includes(localeCookie.value as Locale)) 
    ? (localeCookie.value as Locale)
    : defaultLocale;
  
  const t = await getTranslations({ locale, namespace: 'action' });
  const tCommon = await getTranslations({ locale, namespace: 'common' });
  
  const action = await db.query.actions.findFirst({
    where: eq(actions.id, id),
    with: {
      finding: {
        columns: {
          id: true,
          description: true,
          status: true,
        },
      },
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
    } as any,
  }) as any;

  if (!action) {
    notFound();
  }

  // Load custom fields
  const customFieldsResult = await getCustomFieldValuesWithDefinitions('ACTION', id);
  const customFields = customFieldsResult.success && customFieldsResult.data 
    ? customFieldsResult.data 
    : [];

  const statusConfig: Record<string, any> = {
    Assigned: {
      label: t('status.assigned'),
      color: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
      icon: Clock,
    },
    InProgress: {
      label: t('status.inProgress'),
      color: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
      icon: TrendingUp,
    },
    PendingManagerApproval: {
      label: t('status.pendingApproval'),
      color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
      icon: Clock,
    },
    Completed: {
      label: t('status.completed'),
      color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
      icon: CheckCircle2,
    },
    Rejected: {
      label: t('status.rejected'),
      color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
      icon: XCircle,
    },
    Cancelled: {
      label: t('status.cancelled'),
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
                {t('sections.overview')}
              </TabsTrigger>
              <TabsTrigger value="progress">
                <TrendingUp className="h-4 w-4 mr-2" />
                {t('sections.progress')}
              </TabsTrigger>
            </TabsList>

            {/* Tab 1: Overview */}
            <TabsContent value="overview" className="space-y-4 mt-4">
              {/* Aksiyon Detayı */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{t('sections.description')}</CardTitle>
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
                      {t('fields.rejectionReason')}
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
                    <CardTitle className="text-base">{t('sections.relatedFinding')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Link
                      href={`/denetim/findings/${action.finding.id}`}
                      className="block p-3 border rounded-lg hover:bg-accent transition-colors"
                    >
                      <p className="text-sm font-medium mb-1">{action.finding.details}</p>
                      <p className="text-xs text-muted-foreground">
                        {tCommon('actions.view')} →
                      </p>
                    </Link>
                  </CardContent>
                </Card>
              )}

              {/* Tarihler */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{t('sections.dates')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">{tCommon('fields.createdAt')}</p>
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

          {/* Custom Fields */}
          {customFields.length > 0 && (
            <CustomFieldsDisplay fields={customFields} />
          )}
        </div>

        {/* Sidebar: Timeline + Atama */}
        <div className="lg:col-span-1 space-y-4">
          {/* Timeline - Always Visible */}
          <ActionTimeline action={action as any} />

          {/* Atama Bilgileri - Kompakt */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">{t('sections.assignment')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground">{t('fields.responsiblePerson')}</p>
                <p className="text-sm">
                  {action.assignedTo?.name || action.assignedTo?.email || "-"}
                </p>
              </div>
              <Separator />
              <div>
                <p className="text-xs font-medium text-muted-foreground">{tCommon('roles.manager')}</p>
                <p className="text-sm">
                  {action.manager?.name || action.manager?.email || "-"}
                </p>
              </div>
              <Separator />
              <div>
                <p className="text-xs font-medium text-muted-foreground">{tCommon('fields.createdBy')}</p>
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
