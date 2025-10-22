import { Suspense } from "react";
import { notFound } from "next/navigation";
import { db } from "@/drizzle/db";
import { audits, findings, auditQuestions, user } from "@/drizzle/schema";
import { eq, asc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, CheckCircle2, Circle, HelpCircle, AlertTriangle, FileText, Calendar, User } from "lucide-react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { AuditQuestionsForm } from "@/components/audit/audit-questions-form";
import { FindingCard } from "@/components/audit/finding-card";
import { AuditStatusActions } from "@/components/audit/audit-status-actions";

interface PageProps {
  params: { id: string };
  searchParams: { tab?: string };
}

export default async function AuditDetailPage({ params, searchParams }: PageProps) {
  const audit = await db.query.audits.findFirst({
    where: eq(audits.id, params.id),
    with: {
      createdBy: {
        columns: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!audit) {
    notFound();
  }

  const auditFindings = await db.query.findings.findMany({
    where: eq(findings.auditId, params.id),
    columns: {
      id: true,
      details: true,
      status: true,
      riskType: true,
      createdAt: true,
      assignedToId: true,
    },
    with: {
      assignedTo: {
        columns: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: (findings, { desc }) => [desc(findings.createdAt)],
  });

  // Denetim sorularını getir
  const questions = await db.query.auditQuestions.findMany({
    where: eq(auditQuestions.auditId, params.id),
    with: {
      question: true,
    },
    orderBy: [asc(auditQuestions.createdAt)],
  });

  // Stats hesapla
  const answeredCount = questions.filter(q => q.answer !== null).length;
  const nonCompliantCount = questions.filter(q => q.isNonCompliant).length;
  const completionPercentage = questions.length > 0 
    ? Math.round((answeredCount / questions.length) * 100) 
    : 0;
  const openFindingsCount = auditFindings.filter(f => f.status !== "Completed").length;

  // User listesi (Quick dialogs için)
  const users = await db.select({
    id: user.id,
    name: user.name,
    email: user.email,
  }).from(user);

  return (
    <div className="space-y-6">
      {/* Compact Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/denetim/all">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl md:text-2xl font-bold">{audit.title}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {audit.auditDate && (
                <span>{new Date(audit.auditDate).toLocaleDateString("tr-TR")}</span>
              )}
            </div>
          </div>
        </div>
        <AuditStatusActions 
          audit={{
            id: audit.id,
            status: audit.status,
            title: audit.title,
          }}
          openFindingsCount={openFindingsCount}
        />
      </div>

      {/* Tab-Based Content */}
      <Tabs defaultValue={searchParams.tab || "overview"} className="space-y-6" id="audit-tabs">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Özet
          </TabsTrigger>
          <TabsTrigger value="questions">
            <HelpCircle className="h-4 w-4 mr-2" />
            Sorular ({answeredCount}/{questions.length})
          </TabsTrigger>
          <TabsTrigger value="findings">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Bulgular ({auditFindings.length})
          </TabsTrigger>
          <TabsTrigger value="details">
            <FileText className="h-4 w-4 mr-2" />
            Detaylar
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: Özet */}
        <TabsContent value="overview" className="space-y-4">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">İlerleme</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{completionPercentage}%</div>
                <Progress value={completionPercentage} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  {answeredCount} / {questions.length} soru cevaplandı
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Bulgular</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{auditFindings.length}</div>
                <p className="text-xs text-muted-foreground mt-2">
                  {nonCompliantCount} uygunsuzluk tespit edildi
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Durum</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className="text-sm">Devam Ediyor</Badge>
                <p className="text-xs text-muted-foreground mt-2">
                  {new Date(audit.createdAt).toLocaleDateString("tr-TR")} tarihinde başlatıldı
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Son Cevaplanan Sorular</CardTitle>
              </CardHeader>
              <CardContent>
                {questions.filter(q => q.answer).slice(0, 3).length > 0 ? (
                  <div className="space-y-2">
                    {questions.filter(q => q.answer).slice(0, 3).map((q, index) => (
                      <div key={q.id} className="flex items-start gap-2 p-2 border rounded text-sm">
                        <CheckCircle2 className="h-4 w-4 text-success mt-0.5" />
                        <p className="flex-1 line-clamp-1">{q.question?.questionText}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Henüz cevap yok
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Son Bulgular</CardTitle>
              </CardHeader>
              <CardContent>
                {auditFindings.slice(0, 3).length > 0 ? (
                  <div className="space-y-2">
                    {auditFindings.slice(0, 3).map((finding) => (
                      <Link
                        key={finding.id}
                        href={`/denetim/findings/${finding.id}`}
                        className="flex items-start gap-2 p-2 border rounded text-sm hover:bg-accent"
                      >
                        <AlertTriangle className="h-4 w-4 text-warning mt-0.5" />
                        <p className="flex-1 line-clamp-1">{finding.details}</p>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Henüz bulgu yok
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 2: Sorular (Form entegre) */}
        <TabsContent value="questions" className="space-y-4">
          {/* Progress Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">İlerleme</span>
                  <span className="text-sm text-muted-foreground">
                    {answeredCount} / {questions.length} cevaplandı
                  </span>
                </div>
                <Progress value={completionPercentage} className="h-2" />
                {nonCompliantCount > 0 && (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-destructive/10 border border-destructive/20">
                    <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
                    <p className="text-sm text-destructive font-medium">
                      {nonCompliantCount} uygunsuzluk tespit edildi
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Questions Form */}
          {questions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <HelpCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Bu denetimde soru yok</h3>
                <p className="text-sm text-muted-foreground">
                  Şablonunuzda soru bulunmuyor
                </p>
              </CardContent>
            </Card>
          ) : (
            <AuditQuestionsForm auditId={params.id} questions={questions} />
          )}
        </TabsContent>

        {/* TAB 3: Bulgular (Yeni tasarım - sorular gibi) */}
        <TabsContent value="findings" className="space-y-4">
          {/* Stats Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-2xl font-bold">{auditFindings.length}</p>
                  <p className="text-xs text-muted-foreground">Toplam Bulgu</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-success">
                    {auditFindings.filter(f => f.status === "Completed").length}
                  </p>
                  <p className="text-xs text-muted-foreground">Tamamlandı</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-warning">
                    {auditFindings.filter(f => f.status === "InProgress").length}
                  </p>
                  <p className="text-xs text-muted-foreground">İşlemde</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-destructive">
                    {auditFindings.filter(f => f.riskType === "Kritik" || f.riskType === "Yüksek").length}
                  </p>
                  <p className="text-xs text-muted-foreground">Yüksek Risk</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Findings List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Bulgular</CardTitle>
                  <CardDescription>
                    Bu denetimde tespit edilen {auditFindings.length} bulgu
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {auditFindings.length === 0 ? (
                <div className="text-center py-12">
                  <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Henüz bulgu eklenmemiş
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {auditFindings.map((finding) => (
                    <FindingCard 
                      key={finding.id} 
                      finding={finding} 
                      auditId={params.id}
                      users={users}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 4: Detaylar */}
        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Denetim Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {audit.description && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Açıklama</h3>
                  <p className="text-sm text-muted-foreground">{audit.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium mb-1">Oluşturan</h3>
                  <p className="text-sm text-muted-foreground">
                    {audit.createdBy?.name || audit.createdBy?.email}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-1">Oluşturulma Tarihi</h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(audit.createdAt).toLocaleDateString("tr-TR")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
