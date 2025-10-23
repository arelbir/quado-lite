import { db } from "@/drizzle/db";
import { questions } from "@/drizzle/schema";
import { eq, and, isNull } from "drizzle-orm";
import { notFound } from "next/navigation";
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
        title="Soruyu Düzenle"
        description="Soru bilgilerini güncelleyin"
        backHref={`/denetim/question-banks/${params.id}`}
      />

      <FormCard title="Soru Bilgileri">
        <EditQuestionForm 
          bankId={params.id} 
          question={question}
        />
      </FormCard>
    </div>
  );
}
