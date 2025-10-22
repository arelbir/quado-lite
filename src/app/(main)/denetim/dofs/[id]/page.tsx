import { Suspense } from "react";
import { notFound } from "next/navigation";
import { db } from "@/drizzle/db";
import { dofs } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { DofProgressBar } from "@/components/dof/dof-progress-bar";
import { DofWizardContent } from "@/components/dof/dof-wizard-content";

interface PageProps {
  params: { id: string };
}

// Step mapping
const stepMap: Record<string, number> = {
  Step1_Problem: 1,
  Step2_TempMeasures: 2,
  Step3_RootCause: 3,
  Step4_Activities: 4,
  Step5_Implementation: 5,
  Step6_EffectivenessCheck: 6,
  PendingManagerApproval: 7,
  Completed: 7,
  Rejected: 7,
};

export default async function DofDetailPage({ params }: PageProps) {
  const dof = await db.query.dofs.findFirst({
    where: eq(dofs.id, params.id),
    with: {
      finding: true,
      assignedTo: {
        columns: {
          id: true,
          name: true,
          email: true,
        },
      },
      manager: {
        columns: {
          id: true,
          name: true,
          email: true,
        },
      },
      createdBy: {
        columns: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!dof) {
    notFound();
  }

  const currentStep = stepMap[dof.status] || 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/denetim/dofs">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl md:text-2xl font-bold">{dof.problemTitle}</h1>
            <p className="text-sm text-muted-foreground">
              DÖF #{dof.id.substring(0, 8)} • 7 Adımlı CAPA Süreci
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="pt-6">
          <DofProgressBar currentStep={currentStep} status={dof.status} />
        </CardContent>
      </Card>

      {/* Wizard Content */}
      <Suspense fallback={<div>Yükleniyor...</div>}>
        <DofWizardContent dof={dof} currentStep={currentStep} />
      </Suspense>
    </div>
  );
}
