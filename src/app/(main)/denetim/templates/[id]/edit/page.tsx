import { db } from "@/drizzle/db";
import { auditTemplates } from "@/drizzle/schema";
import { eq, and, isNull } from "drizzle-orm";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { FormCard } from "@/components/shared/form-card";
import { EditTemplateForm } from "./edit-template-form";

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
  const template = await db.query.auditTemplates.findFirst({
    where: and(
      eq(auditTemplates.id, params.id),
      isNull(auditTemplates.deletedAt)
    ),
  });

  if (!template) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Şablonu Düzenle"
        description="Şablon bilgilerini ve soru havuzlarını güncelleyin"
        backHref={`/denetim/templates/${params.id}`}
      />

      <FormCard title="Şablon Bilgileri">
        <EditTemplateForm template={template} />
      </FormCard>
    </div>
  );
}
