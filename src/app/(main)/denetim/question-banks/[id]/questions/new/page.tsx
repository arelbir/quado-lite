import { db } from "@/drizzle/db";
import { questionBanks } from "@/drizzle/schema";
import { eq, and, isNull } from "drizzle-orm";
import { notFound } from "next/navigation";
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
        title="Yeni Soru Ekle"
        description={`${bank.name} havuzuna soru ekleyin`}
        backHref={`/denetim/question-banks/${params.id}`}
      />

      <FormCard title="Soru Bilgileri">
        <CreateQuestionForm bankId={params.id} />
      </FormCard>
    </div>
  );
}
