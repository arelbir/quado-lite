import { PageHeader } from "@/components/shared/page-header";
import { FormCard } from "@/components/shared/form-card";
import { CreatePlanForm } from "./create-plan-form";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { db } from "@/drizzle/db";
import { user } from "@/drizzle/schema";
import { getTranslations } from 'next-intl/server';
import { cookies } from 'next/headers';
import { defaultLocale, type Locale, locales } from '@/i18n/config';

/**
 * Audit Plan Create Page
 * Pattern: Server Component + URL Search Params
 * Supports: ?type=adhoc or ?type=scheduled
 */
interface PageProps {
  searchParams: {
    type?: "adhoc" | "scheduled";
  };
}

export default async function NewPlanPage({ searchParams }: PageProps) {
  const cookieStore = cookies();
  const localeCookie = cookieStore.get('NEXT_LOCALE');
  const locale = (localeCookie?.value && locales.includes(localeCookie.value as Locale)) 
    ? (localeCookie.value as Locale)
    : defaultLocale;
  
  const t = await getTranslations({ locale, namespace: 'plans' });
  const planType = searchParams.type || "scheduled";
  
  const title = planType === "adhoc" 
    ? t('startAdhocAudit')
    : t('createScheduledAudit');
    
  const description = planType === "adhoc"
    ? "Hemen denetim başlatın (şablondan)"
    : "Gelecek tarih için denetim planlayın";

  // Kullanıcı listesi (Denetçi seçimi için)
  const users = await db.select({
    id: user.id,
    name: user.name,
    email: user.email,
  }).from(user);

  return (
    <div className="space-y-6">
      <PageHeader 
        title={title}
        description={description}
        backHref="/denetim/plans"
      />

      <FormCard 
        title={t('planInfo')}
        description={planType === "adhoc" ? "Denetim hemen başlatılacak" : "Denetim belirlenen tarihte otomatik oluşturulacak"}
      >
        <Suspense fallback={<Skeleton className="h-[400px]" />}>
          <CreatePlanForm defaultType={planType} availableUsers={users} />
        </Suspense>
      </FormCard>
    </div>
  );
}
