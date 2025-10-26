import { notFound, redirect } from "next/navigation";
import { db } from "@/drizzle/db";
import { auditPlans, user } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { CreatePlanForm } from "../../new/create-plan-form";

export default async function EditPlanPage({ params }: { params: { id: string } }) {
  const plan = await db.query.auditPlans.findFirst({
    where: eq(auditPlans.id, params.id),
    with: {
      auditor: true,
      template: true,
    } as any,
  }) as any;

  if (!plan) {
    notFound();
  }

  // Pending durumda değilse düzenlenemez
  if (plan.status !== "Pending") {
    redirect(`/denetim/plans/${params.id}`);
  }

  // Kullanıcı listesi (Denetçi seçimi için)
  const users = await db.select({
    id: user.id,
    name: user.name,
    email: user.email,
  }).from(user);

  // scheduleType'ı lowercase'e çevir
  const planTypeForForm = plan.scheduleType.toLowerCase() as "adhoc" | "scheduled";

  return (
    <div className="w-full py-6">
      <CreatePlanForm 
        mode="edit"
        defaultType={planTypeForForm}
        availableUsers={users}
        initialData={{
          id: plan.id,
          title: plan.title,
          description: plan.description,
          scheduledDate: plan.scheduledDate,
          auditorId: plan.auditorId,
          recurrenceType: plan.recurrenceType,
          recurrenceInterval: plan.recurrenceInterval,
          maxOccurrences: plan.maxOccurrences,
        }}
      />
    </div>
  );
}
