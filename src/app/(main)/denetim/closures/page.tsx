import { Suspense } from "react";
import { getFindings } from "@/server/actions/finding-actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { closeFinding, rejectFinding } from "@/server/actions/finding-actions";
import { getTranslations } from 'next-intl/server';
import { cookies } from 'next/headers';
import { defaultLocale, type Locale, locales } from '@/i18n/config';

export default async function ClosuresPage() {
  const cookieStore = cookies();
  const localeCookie = cookieStore.get('NEXT_LOCALE');
  const locale = (localeCookie?.value && locales.includes(localeCookie.value as Locale)) 
    ? (localeCookie.value as Locale)
    : defaultLocale;
  
  const t = await getTranslations({ locale, namespace: 'finding' });
  const tCommon = await getTranslations({ locale, namespace: 'common' });
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('sections.closureTitle')}</h1>
        <p className="text-muted-foreground">
          {t('messages.closureRequested')}
        </p>
      </div>

      <Suspense fallback={<div>{tCommon('status.loading')}</div>}>
        <PendingClosures />
      </Suspense>
    </div>
  );
}

async function PendingClosures() {
  const cookieStore = cookies();
  const localeCookie = cookieStore.get('NEXT_LOCALE');
  const locale = (localeCookie?.value && locales.includes(localeCookie.value as Locale)) 
    ? (localeCookie.value as Locale)
    : defaultLocale;
  
  const t = await getTranslations({ locale, namespace: 'finding' });
  const tCommon = await getTranslations({ locale, namespace: 'common' });
  const findings = await getFindings() as any[];
  const pendingFindings = findings.filter((f: any) => f.status === "PendingAuditorClosure");

  if (pendingFindings.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">{t('messages.closureApproved')}</h3>
          <p className="text-sm text-muted-foreground">
            {tCommon('status.completed')}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('sections.closureTitle')}</CardTitle>
        <CardDescription>
          {t('common.pendingApproval', { count: pendingFindings.length })}
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
                  <span>{t('fields.audit')}: {finding.audit?.title}</span>
                  <span>{t('fields.responsiblePerson')}: {finding.assignedTo?.name || '-'}</span>
                  {finding.riskType && (
                    <span className="font-medium text-orange-600">
                      {finding.riskType}
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
                    {tCommon('actions.reject')}
                  </Button>
                </form>
                <form action={async () => {
                  "use server";
                  await closeFinding(finding.id);
                }}>
                  <Button type="submit" size="sm">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    {tCommon('actions.approve')}
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
