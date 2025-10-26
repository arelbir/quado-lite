import { notFound, redirect } from "next/navigation";
import { db } from "@/drizzle/db";
import { audits, auditQuestions, questions, user } from "@/drizzle/schema";
import { eq, asc } from "drizzle-orm";
import { EditAuditForm } from "./edit-audit-form";

export default async function EditAuditPage({ params }: { params: { id: string } }) {
  const audit = await db.query.audits.findFirst({
    where: eq(audits.id, params.id),
    with: {
      auditor: { select: { id: true, name: true, email: true } },
    } as any,
  });

  if (!audit) {
    notFound();
  }

  // Active durumda değilse düzenlenemez
  if (audit.status !== "Active") {
    redirect(`/denetim/audits/${params.id}`);
  }

  // Denetimdeki mevcut sorular
  const currentQuestions = await db.query.auditQuestions.findMany({
    where: eq(auditQuestions.auditId, params.id),
    with: {
      question: {
        with: {
          bank: { select: { id: true, name: true } },
        },
      },
      createdBy: { select: { id: true, name: true, email: true } },
    } as any,
    orderBy: [asc(auditQuestions.createdAt)],
  });

  // Eklenebilecek sorular
  const existingQuestionIds = currentQuestions.map(q => q.questionId);
  
  // Tüm soruları al
  const allQuestions = await db.query.questions.findMany({
    with: { bank: true } as any,
    limit: 100,
  });
  
  // Denetimde olmayan soruları filtrele
  const availableQuestions = allQuestions.filter(
    q => !existingQuestionIds.includes(q.id)
  );

  // Kullanıcı listesi (Denetçi seçimi için)
  const users = await db.select({
    id: user.id,
    name: user.name,
    email: user.email,
  }).from(user);

  return (
    <div className="w-full py-6">
      <EditAuditForm 
        audit={audit as any}
        currentQuestions={currentQuestions as any}
        availableQuestions={availableQuestions as any}
        availableUsers={users}
      />
    </div>
  );
}
