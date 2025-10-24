import { db } from "@/drizzle/db";
import { auditTemplates, questionBanks } from "@/drizzle/schema";
import { eq, and, isNull } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText, Plus } from "lucide-react";
import Link from "next/link";
import { DeleteTemplateButton } from "@/components/templates/delete-template-button";
import { getTranslations } from 'next-intl/server';
import { cookies } from 'next/headers';
import { defaultLocale, type Locale, locales } from '@/i18n/config';

interface PageProps {
  params: {
    id: string;
  };
}

/**
 * Audit Template Detail Page
 * Pattern: Server Component + DRY (Question Banks pattern'i kullanıldı)
 * Features: Soru havuzlarını görüntüleme ve yönetme
 */
export default async function TemplateDetailPage({ params }: PageProps) {
  const cookieStore = cookies();
  const localeCookie = cookieStore.get('NEXT_LOCALE');
  const locale = (localeCookie?.value && locales.includes(localeCookie.value as Locale)) 
    ? (localeCookie.value as Locale)
    : defaultLocale;
  
  const t = await getTranslations({ locale, namespace: 'templates' });
  const tCommon = await getTranslations({ locale, namespace: 'common' });
  const template = await db.query.auditTemplates.findFirst({
    where: and(
      eq(auditTemplates.id, params.id),
      isNull(auditTemplates.deletedAt)
    ),
    with: {
      createdBy: {
        columns: {
          name: true,
          email: true,
        },
      },
    },
  });

  if (!template) {
    notFound();
  }

  // Parse question bank IDs
  const bankIds = template.questionBankIds 
    ? (JSON.parse(template.questionBankIds) as string[])
    : [];

  // Fetch question banks
  const banks = bankIds.length > 0
    ? await db.query.questionBanks.findMany({
        where: (questionBanks, { inArray }) => 
          inArray(questionBanks.id, bankIds),
        with: {
          questions: {
            where: (questions, { isNull }) => isNull(questions.deletedAt),
          },
        },
      })
    : [];

  // Tüm soru sayısını hesapla
  const totalQuestions = banks.reduce((sum, bank) => sum + (bank.questions?.length || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/denetim/templates">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {tCommon('actions.back')}
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{template.name}</h1>
            <p className="text-sm text-muted-foreground">
              {template.description || t('description')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link href={`/denetim/templates/${params.id}/edit`}>
              {tCommon('actions.edit')}
            </Link>
          </Button>
          <DeleteTemplateButton 
            templateId={params.id}
            templateName={template.name}
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('questionBanks')}</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{banks.length}</div>
            <p className="text-xs text-muted-foreground">{t('messages.selectedBanksCount')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('totalQuestions')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQuestions}</div>
            <p className="text-xs text-muted-foreground">{t('messages.allQuestionsInBanks')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('fields.category')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline">{template.category}</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Question Banks List */}
      <Card>
        <CardHeader>
          <CardTitle>{t('questionBanks')}</CardTitle>
          <CardDescription>
            {t('messages.banksInTemplate')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {banks.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t('noQuestionBanks')}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t('messages.noBanksAddedYet')}
              </p>
              <Button asChild>
                <Link href={`/denetim/templates/${params.id}/edit`}>
                  <Plus className="h-4 w-4 mr-2" />
                  {tCommon('actions.add')}
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {banks.map((bank) => (
                <Card key={bank.id} className="hover:bg-accent/50 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-base">{bank.name}</CardTitle>
                        {bank.description && (
                          <CardDescription className="text-sm">
                            {bank.description}
                          </CardDescription>
                        )}
                      </div>
                      <Badge variant="secondary">
                        {bank.questions?.length || 0} {tCommon('questions')}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {t('fields.category')}: {bank.category}
                      </span>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/denetim/question-banks/${bank.id}`}>
                          {tCommon('actions.view')}
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Estimated Duration */}
      {template.estimatedDurationMinutes && (
        <Card>
          <CardHeader>
            <CardTitle>Tahmini Süre</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg">
              {template.estimatedDurationMinutes} dakika
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
