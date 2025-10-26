import { db } from "@/drizzle/db";
import { questions } from "@/drizzle/schema";
import { eq, and, isNull } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getTranslations } from 'next-intl/server';
import { cookies } from 'next/headers';
import { defaultLocale, type Locale, locales } from '@/i18n/config';
import { PageHeader } from "@/components/shared/page-header";
import { FormCard } from "@/components/shared/form-card";
import { EditQuestionForm } from "./edit-question-form";

interface PageProps {
  params: {
    id: string;
    questionId: string;
  };
}

/**
 * Edit Question Page
 * Pattern: Server Component + Client Form (DRY)
 */
export default async function EditQuestionPage({ params }: PageProps) {
  const cookieStore = cookies();
  const localeCookie = cookieStore.get('NEXT_LOCALE');
  const locale = (localeCookie?.value && locales.includes(localeCookie.value as Locale)) 
    ? (localeCookie.value as Locale)
    : defaultLocale;
  
  const t = await getTranslations({ locale, namespace: 'questions' });
  
  const question = await db.query.questions.findFirst({
    where: and(
      eq(questions.id, params.questionId),
      isNull(questions.deletedAt)
    ),
  });

  if (!question) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title={t('actions.updateQuestion')}
        description={t('messages.updateQuestionInfo')}
        backHref={`/denetim/question-banks/${params.id}`}
      />

      <FormCard title={t('fields.questionText')}>
        <EditQuestionForm 
          bankId={params.id} 
          question={question}
        />
      </FormCard>
    </div>
  );
}
