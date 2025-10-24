import { db } from "@/drizzle/db";
import { auditTemplates, questionBanks } from "@/drizzle/schema";
import { eq, and, isNull } from "drizzle-orm";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { FormCard } from "@/components/shared/form-card";
import { EditTemplateForm } from "./edit-template-form";
import { getTranslations } from 'next-intl/server';
import { cookies } from 'next/headers';
import { defaultLocale, type Locale, locales } from '@/i18n/config';

interface PageProps {
  params: {
    id: string;
  };
}

/**
 * Edit Template Page
 * Pattern: Server Component + Client Form (DRY)
 */
export default async function EditTemplatePage({ params }: PageProps) {
  const cookieStore = cookies();
  const localeCookie = cookieStore.get('NEXT_LOCALE');
  const locale = (localeCookie?.value && locales.includes(localeCookie.value as Locale)) 
    ? (localeCookie.value as Locale)
    : defaultLocale;
  
  const t = await getTranslations({ locale, namespace: 'templates' });
  
  const template = await db.query.auditTemplates.findFirst({
    where: and(
      eq(auditTemplates.id, params.id),
      isNull(auditTemplates.deletedAt)
    ),
  });
  
  // Get available question banks
  const availableQuestionBanks = await db.query.questionBanks.findMany({
    where: isNull(questionBanks.deletedAt),
  });

  if (!template) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title={t('manage')}
        description={t('description')}
        backHref={`/denetim/templates/${params.id}`}
      />

      <FormCard title={t('fields.templateName')}>
        <EditTemplateForm template={template} availableQuestionBanks={availableQuestionBanks} />
      </FormCard>
    </div>
  );
}
