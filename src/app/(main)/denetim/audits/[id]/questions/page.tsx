import { Suspense } from "react";
import { notFound } from "next/navigation";
import { db } from "@/drizzle/db";
import { audits } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { getAuditQuestions, checkAuditCompletion } from "@/action/audit-question-actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AuditQuestionsForm } from "@/components/audit/audit-questions-form";

interface PageProps {
  params: { id: string };
}

export default async function AuditQuestionsPage({ params }: PageProps) {
  const audit = await db.query.audits.findFirst({
    where: eq(audits.id, params.id),
    with: {
      createdBy: {
        columns: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!audit) {
    notFound();
  }

  const questions = await getAuditQuestions(params.id);
  const completion = await checkAuditCompletion(params.id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/denetim/audits/${params.id}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Denetim Detayına Dön
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{audit.title}</h1>
            <p className="text-sm text-muted-foreground">
              Denetim Sorularını Cevaplayın
            </p>
          </div>
        </div>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">İlerleme</p>
                <p className="text-xs text-muted-foreground">
                  {completion.answered} / {completion.total} soru cevaplandı
                </p>
              </div>
              <Badge variant={completion.completionPercentage === 100 ? "default" : "secondary"}>
                %{completion.completionPercentage}
              </Badge>
            </div>
            <Progress value={completion.completionPercentage} className="h-2" />
            {completion.nonCompliant > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="destructive">{completion.nonCompliant}</Badge>
                <span className="text-muted-foreground">uygunsuzluk tespit edildi</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Questions Form */}
      {questions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Bu denetimde soru yok</h3>
            <p className="text-sm text-muted-foreground">
              Şablonunuzda soru bulunmuyor
            </p>
          </CardContent>
        </Card>
      ) : (
        <AuditQuestionsForm auditId={params.id} questions={questions} />
      )}
    </div>
  );
}
