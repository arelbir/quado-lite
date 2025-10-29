import { notFound } from "next/navigation";
import { getFindingById } from "@/server/actions/finding-actions";
import { ActionForm } from "@/components/action/action-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getTranslations } from 'next-intl/server';
import { cookies } from 'next/headers';
import { defaultLocale, type Locale, locales } from '@/i18n/config';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function NewActionPage({ params }: PageProps) {
  const { id: findingId } = await params;
  
  const cookieStore = cookies();
  const localeCookie = cookieStore.get('NEXT_LOCALE');
  const locale = (localeCookie?.value && locales.includes(localeCookie.value as Locale)) 
    ? (localeCookie.value as Locale)
    : defaultLocale;
  
  const t = await getTranslations({ locale, namespace: 'action' });

  try {
    // Verify finding exists
    const findingResult = await getFindingById(findingId);
    
    if (!findingResult) {
      notFound();
    }

    const findingData = findingResult as any;

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/denetim/findings/${findingId}`}>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {t('newAction')}
              </h1>
              <p className="text-muted-foreground">
                {t('createActionFor')}: {findingData.details?.substring(0, 80)}...
              </p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>{t('actionDetails')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ActionForm 
              findingId={findingId}
              finding={{
                id: findingData.id,
                details: findingData.details,
                status: findingData.status,
                riskType: findingData.riskType,
              }}
            />
          </CardContent>
        </Card>
      </div>
    );
  } catch (error) {
    console.error("Error loading new action page:", error);
    notFound();
  }
}
