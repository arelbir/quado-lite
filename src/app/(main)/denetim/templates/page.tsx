import { Suspense } from "react";
import { getAuditTemplates } from "@/server/actions/audit-template-actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileText } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { getTranslations } from 'next-intl/server';
import { cookies } from 'next/headers';
import { defaultLocale, type Locale, locales } from '@/i18n/config';

export default async function TemplatesPage() {
  const cookieStore = cookies();
  const localeCookie = cookieStore.get('NEXT_LOCALE');
  const locale = (localeCookie?.value && locales.includes(localeCookie.value as Locale)) 
    ? (localeCookie.value as Locale)
    : defaultLocale;
  
  const t = await getTranslations({ locale, namespace: 'templates' });
  const tCommon = await getTranslations({ locale, namespace: 'common' });
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">
            {t('description')}
          </p>
        </div>
        <Button asChild>
          <Link href="/denetim/templates/new">
            <Plus className="h-4 w-4 mr-2" />
            {t('create')}
          </Link>
        </Button>
      </div>

      <Suspense fallback={<div>{tCommon('status.loading')}</div>}>
        <TemplatesGrid />
      </Suspense>
    </div>
  );
}

async function TemplatesGrid() {
  const cookieStore = cookies();
  const localeCookie = cookieStore.get('NEXT_LOCALE');
  const locale = (localeCookie?.value && locales.includes(localeCookie.value as Locale)) 
    ? (localeCookie.value as Locale)
    : defaultLocale;
  
  const t = await getTranslations({ locale, namespace: 'templates' });
  const templates = await getAuditTemplates();

  if (templates.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">{t('noTemplates')}</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {t('createFirst')}
          </p>
          <Button asChild>
            <Link href="/denetim/templates/new">
              <Plus className="h-4 w-4 mr-2" />
              {t('createNew')}
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {templates.map((template) => (
        <Card key={template.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg">{template.name}</CardTitle>
                {template.description && (
                  <CardDescription className="mt-2">
                    {template.description}
                  </CardDescription>
                )}
              </div>
              <FileText className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Badge variant="secondary">
                {(() => {
                  try {
                    const bankIds = template.questionBankIds 
                      ? (typeof template.questionBankIds === 'string' 
                          ? JSON.parse(template.questionBankIds) as string[]
                          : template.questionBankIds as string[])
                      : [];
                    return bankIds.length > 0 
                      ? `${bankIds.length} ${t('questionBanks')}` 
                      : t('noQuestionBanks');
                  } catch {
                    return t('noQuestionBanks');
                  }
                })()}
              </Badge>
              <Button asChild size="sm" variant="outline">
                <Link href={`/denetim/templates/${template.id}`}>
                  {t('manage')}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
