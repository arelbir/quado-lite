import { db } from "@/drizzle/db";
import { questionBanks, questions } from "@/drizzle/schema";
import { eq, and, isNull } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, BookOpen } from "lucide-react";
import Link from "next/link";
import { getTranslations } from 'next-intl/server';
import { QuestionListItem } from "@/components/questions/question-list-item";

interface PageProps {
  params: {
    id: string;
  };
}

/**
 * Question Bank Detail Page
 * Pattern: Server Component + Existing Components (DRY)
 * Features: Soru listesi, soru ekleme, soru düzenleme
 */
export default async function QuestionBankDetailPage({ params }: PageProps) {
  const t = await getTranslations('audit.common');
  const bank = await db.query.questionBanks.findFirst({
    where: and(
      eq(questionBanks.id, params.id),
      isNull(questionBanks.deletedAt)
    ),
    with: {
      createdBy: {
        columns: {
          name: true,
          email: true,
        },
      },
    },
  });

  if (!bank) {
    notFound();
  }

  const questionList = await db.query.questions.findMany({
    where: and(
      eq(questions.bankId, params.id),
      isNull(questions.deletedAt)
    ),
    orderBy: (questions, { asc }) => [asc(questions.orderIndex)],
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/denetim/question-banks">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Geri
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{bank.name}</h1>
            <p className="text-sm text-muted-foreground">
              {bank.description || "Soru bankası detayları"}
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/denetim/question-banks/${params.id}/questions/new`}>
            <Plus className="h-4 w-4 mr-2" />
            Yeni Soru
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('totalQuestions')}</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{questionList.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kategori</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline">{bank.category}</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Durum</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={bank.isActive ? "default" : "secondary"}>
              {bank.isActive ? "Aktif" : "Pasif"}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Questions List */}
      <Card>
        <CardHeader>
          <CardTitle>Sorular</CardTitle>
          <CardDescription>
            Sürükle-bırak ile sıralama yapabilirsiniz
          </CardDescription>
        </CardHeader>
        <CardContent>
          {questionList.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Henüz soru yok</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Bu soru bankasına henüz soru eklenmemiş
              </p>
              <Button asChild>
                <Link href={`/denetim/question-banks/${params.id}/questions/new`}>
                  <Plus className="h-4 w-4 mr-2" />
                  İlk Soruyu Ekle
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {questionList.map((question, index) => (
                <QuestionListItem
                  key={question.id}
                  question={question}
                  index={index}
                  bankId={params.id}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
