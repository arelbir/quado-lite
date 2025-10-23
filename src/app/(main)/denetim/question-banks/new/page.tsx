import { PageHeader } from "@/components/shared/page-header";
import { FormCard } from "@/components/shared/form-card";
import { CreateQuestionBankForm } from "./create-question-bank-form";

/**
 * Question Bank Create Page
 * Pattern: Server Component + Reusable Components (DRY)
 */
export default function NewQuestionBankPage() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Yeni Soru Bankası Oluştur"
        description="Soru bankası bilgilerini girin"
        backHref="/denetim/question-banks"
      />

      <FormCard title="Soru Bankası Bilgileri">
        <CreateQuestionBankForm />
      </FormCard>
    </div>
  );
}
