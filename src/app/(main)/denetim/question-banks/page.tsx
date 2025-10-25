import { Suspense } from "react";
import { getQuestionBanks } from "@/server/actions/question-bank-actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, HelpCircle } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { getTranslations } from 'next-intl/server';

export default async function QuestionBanksPage() {
  const t = await getTranslations('questionBanks');
  const tCommon = await getTranslations('common');
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">
            {t('description')}
          </p>
        </div>
        <Button asChild>
          <Link href="/denetim/question-banks/new">
            <Plus className="h-4 w-4 mr-2" />
            {t('create')}
          </Link>
        </Button>
      </div>

      <Suspense fallback={<div>{tCommon('status.loading')}</div>}>
        <QuestionBanksGrid />
      </Suspense>
    </div>
  );
}

async function QuestionBanksGrid() {
  const t = await getTranslations('questionBanks');
  const questionBanks = await getQuestionBanks();

  if (questionBanks.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <HelpCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">{t('noBanks')}</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {t('createFirst')}
          </p>
          <Button asChild>
            <Link href="/denetim/question-banks/new">
              <Plus className="h-4 w-4 mr-2" />
              {t('createNew')}
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {questionBanks.map((bank) => (
        <Card key={bank.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg">{bank.name}</CardTitle>
                {bank.description && (
                  <CardDescription className="mt-2">
                    {bank.description}
                  </CardDescription>
                )}
              </div>
              <HelpCircle className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Badge variant="secondary">
                {bank.questions?.length || 0} {t('questions')}
              </Badge>
              <Button asChild size="sm" variant="outline">
                <Link href={`/denetim/question-banks/${bank.id}`}>
                  {t('manage')}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
