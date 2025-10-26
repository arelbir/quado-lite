import { PageHeader } from "@/components/shared/page-header";
import { FormCard } from "@/components/shared/form-card";
import { CreateTemplateForm } from "./create-template-form";
import { getTranslations } from 'next-intl/server';
import { cookies } from 'next/headers';
import { defaultLocale, type Locale, locales } from '@/i18n/config';

/**
 * Audit Template Create Page
 * Pattern: Server Component + Reusable Components (DRY)
 */
export default async function NewTemplatePage() {
  const cookieStore = cookies();
  const localeCookie = cookieStore.get('NEXT_LOCALE');
  const locale = (localeCookie?.value && locales.includes(localeCookie.value as Locale)) 
    ? (localeCookie.value as Locale)
    : defaultLocale;
  
  const t = await getTranslations({ locale, namespace: 'templates' });
  return (
    <div className="space-y-6">
      <PageHeader 
        title={t('createNew')}
        description={t('description')}
        backHref="/denetim/templates"
      />

      <FormCard 
        title={t('fields.templateName')}
        description={t('messages.enterTemplateInfo')}
      >
        <CreateTemplateForm />
      </FormCard>
    </div>
  );
}
