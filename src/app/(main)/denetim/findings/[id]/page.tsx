import { Suspense } from "react";
import { getFindingById } from "@/server/actions/finding-actions";
import { getActionsByFinding } from "@/server/actions/action-actions";
import { getDofsByFinding } from "@/server/actions/dof-actions";
import { getCustomFieldValuesWithDefinitions } from "@/server/actions/custom-field-value-actions";
import { CustomFieldsDisplay } from "@/components/forms/CustomFieldsDisplay";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Plus, Clock, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from 'next-intl/server';
import { cookies } from 'next/headers';
import { defaultLocale, type Locale, locales } from '@/i18n/config';
import { auth } from "@/server/auth";
import { getFindingPermissions } from "@/lib/permissions/finding-permissions";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function FindingDetailPage({ params }: PageProps) {
  const { id } = await params;
  const cookieStore = cookies();
  const localeCookie = cookieStore.get('NEXT_LOCALE');
  const locale = (localeCookie?.value && locales.includes(localeCookie.value as Locale)) 
    ? (localeCookie.value as Locale)
    : defaultLocale;
  
  const t = await getTranslations({ locale, namespace: 'finding' });
  const tCommon = await getTranslations({ locale, namespace: 'common' });
  
  // Get current user for permissions
  const session = await auth();
  const currentUser = session?.user as any;
  
  try {
    const finding = await getFindingById(id) as any;

    if (!finding) {
      notFound();
    }

    // Load custom fields
    const customFieldsResult = await getCustomFieldValuesWithDefinitions('FINDING', id);
    const customFields = customFieldsResult.success && customFieldsResult.data 
      ? customFieldsResult.data 
      : [];

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href={finding.auditId ? `/denetim/audits/${finding.auditId}?tab=findings` : "/denetim/findings"}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {tCommon('actions.back')}
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{t('view')}</h1>
              <p className="text-sm text-muted-foreground">
                {finding.audit?.title}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={finding.status as any} type="finding" />
          </div>
        </div>

        {/* Finding Info */}
        <Card>
          <CardHeader>
            <CardTitle>{t('sections.details')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">{t('fields.details')}</h3>
              <p className="text-sm text-muted-foreground">
                {finding.details}
              </p>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium mb-1">{t('fields.riskType')}</h3>
                <p className="text-sm text-muted-foreground">
                  {finding.riskType || tCommon('status.noData')}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-1">{t('fields.processOwner')}</h3>
                <p className="text-sm text-muted-foreground">
                  {finding.assignedTo?.name || tCommon('status.noData')}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-1">{t('fields.identifiedBy')}</h3>
                <p className="text-sm text-muted-foreground">
                  {finding.createdBy?.name || tCommon('status.noData')}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-1">{tCommon('createdAt')}</h3>
                <p className="text-sm text-muted-foreground">
                  {new Date(finding.createdAt).toLocaleString("tr-TR")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Custom Fields */}
        {customFields.length > 0 && (
          <CustomFieldsDisplay fields={customFields} />
        )}

        {/* Actions & DOFs */}
        <div className="grid gap-6 md:grid-cols-2">
          <Suspense fallback={<div>{tCommon('status.loading')}</div>}>
            <ActionsCard findingId={id} finding={finding} currentUser={currentUser} />
          </Suspense>

          <Suspense fallback={<div>{tCommon('status.loading')}</div>}>
            <DofsCard findingId={id} finding={finding} currentUser={currentUser} />
          </Suspense>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading finding:", error);
    notFound();
  }
}

async function ActionsCard({ findingId, finding, currentUser }: { findingId: string; finding: any; currentUser: any }) {
  const cookieStore = cookies();
  const localeCookie = cookieStore.get('NEXT_LOCALE');
  const locale = (localeCookie?.value && locales.includes(localeCookie.value as Locale)) 
    ? (localeCookie.value as Locale)
    : defaultLocale;
  
  const t = await getTranslations({ locale, namespace: 'finding' });

  const actions = await getActionsByFinding(findingId) as any[];
  
  // Check permissions (unified system)
  const permissions = await getFindingPermissions(currentUser, finding);

  const statusIcons: Record<string, any> = {
    Assigned: Clock,
    PendingManagerApproval: Clock,
    Completed: CheckCircle2,
    Rejected: XCircle,
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t('sections.actionsTitle')}</CardTitle>
            <CardDescription>{t('sections.actionsDescription')}</CardDescription>
          </div>
          {permissions.canCreateAction && (
            <Button size="sm" variant="outline" asChild>
              <Link href={`/denetim/findings/${findingId}/actions/new`}>
                <Plus className="h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {actions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            {t('common.noActions')}
          </p>
        ) : (
          <div className="space-y-3">
            {actions.map((action) => {
              const Icon = statusIcons[action.status];
              return (
                <div key={action.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <Icon className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-2">{action.details}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {action.assignedTo?.name || '-'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

async function DofsCard({ findingId, finding, currentUser }: { findingId: string; finding: any; currentUser: any }) {
  const cookieStore = cookies();
  const localeCookie = cookieStore.get('NEXT_LOCALE');
  const locale = (localeCookie?.value && locales.includes(localeCookie.value as Locale)) 
    ? (localeCookie.value as Locale)
    : defaultLocale;
  
  const t = await getTranslations({ locale, namespace: 'finding' });
  const tDof = await getTranslations({ locale, namespace: 'dof' });
  const dofs = await getDofsByFinding(findingId) as any[];
  
  // Check permissions (unified system)
  const permissions = await getFindingPermissions(currentUser, finding);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t('sections.dofsTitle')}</CardTitle>
            <CardDescription>{t('sections.dofsDescription')}</CardDescription>
          </div>
          {permissions.canCreateDOF && (
            <Button size="sm" variant="outline" asChild>
              <Link href={`/denetim/findings/${findingId}/dof/new`}>
                <Plus className="h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {dofs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            {t('common.noDofs')}
          </p>
        ) : (
          <div className="space-y-3">
            {dofs.map((dof) => (
              <Link
                key={dof.id}
                href={`/denetim/findings/${findingId}/dof/${dof.id}`}
                className="flex items-start gap-3 p-3 border rounded-lg hover:bg-accent transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{tDof('dofId')}{dof.id.slice(0, 8)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {dof.assignedTo?.name || '-'}
                  </p>
                </div>
                <StatusBadge status={dof.status as any} type="dof" />
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
