import { Suspense } from "react";
import { getQuestionBanks } from "@/action/question-bank-actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, HelpCircle } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function QuestionBanksPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Soru Havuzu</h1>
          <p className="text-muted-foreground">
            Denetim sorularını kategorilere göre yönetin
          </p>
        </div>
        <Button asChild>
          <Link href="/denetim/question-banks/new">
            <Plus className="h-4 w-4 mr-2" />
            Yeni Soru Havuzu
          </Link>
        </Button>
      </div>

      <Suspense fallback={<div>Yükleniyor...</div>}>
        <QuestionBanksGrid />
      </Suspense>
    </div>
  );
}

async function QuestionBanksGrid() {
  const questionBanks = await getQuestionBanks();

  if (questionBanks.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <HelpCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Henüz soru havuzu yok</h3>
          <p className="text-sm text-muted-foreground mb-4">
            İlk soru havuzunu oluşturun
          </p>
          <Button asChild>
            <Link href="/denetim/question-banks/new">
              <Plus className="h-4 w-4 mr-2" />
              Yeni Soru Havuzu Oluştur
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
                {bank.questions?.length || 0} Soru
              </Badge>
              <Button asChild size="sm" variant="outline">
                <Link href={`/denetim/question-banks/${bank.id}`}>
                  Soruları Yönet
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
