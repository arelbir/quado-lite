import { db } from "@/drizzle/db";
import { questionBanks } from "@/drizzle/schema";
import { eq, and, isNull } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getTranslations } from 'next-intl/server';
import { cookies } from 'next/headers';
import { defaultLocale, type Locale, locales } from '@/i18n/config';
import { PageHeader } from "@/components/shared/page-header";
import { FormCard } from "@/components/shared/form-card";
import { CreateQuestionForm } from "./create-question-form";

interface PageProps {
  params: {
    id: string;
  };
}

/**
 * Create Question Page
 * Pattern: Server Component + Client Form
 */
export default async function NewQuestionPage({ params }: PageProps) {
  const cookieStore = cookies();
  const localeCookie = cookieStore.get('NEXT_LOCALE');
  const locale = (localeCookie?.value && locales.includes(localeCookie.value as Locale)) 
    ? (localeCookie.value as Locale)
    : defaultLocale;
  
  const t = await getTranslations({ locale, namespace: 'questions' });
  
  const bank = await db.query.questionBanks.findFirst({
    where: and(
      eq(questionBanks.id, params.id),
      isNull(questionBanks.deletedAt)
    ),
  });

  if (!bank) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title={t('actions.createQuestion')}
        description={`${bank.name} ${t('messages.addToBankDescription')}`}
        backHref={`/denetim/question-banks/${params.id}`}
      />

      <FormCard title={t('fields.questionText')}>
        <CreateQuestionForm bankId={params.id} />
      </FormCard>
    </div>
  );
}
