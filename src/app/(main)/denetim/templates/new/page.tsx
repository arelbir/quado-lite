import { PageHeader } from "@/components/shared/page-header";
import { FormCard } from "@/components/shared/form-card";
import { CreateTemplateForm } from "./create-template-form";

/**
 * Audit Template Create Page
 * Pattern: Server Component + Reusable Components (DRY)
 */
export default function NewTemplatePage() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Yeni Denetim Şablonu Oluştur"
        description="Denetim şablonu bilgilerini girin ve soruları seçin"
        backHref="/denetim/templates"
      />

      <FormCard 
        title="Şablon Bilgileri"
        description="Şablon adı ve kategorisini belirleyin"
      >
        <CreateTemplateForm />
      </FormCard>
    </div>
  );
}
