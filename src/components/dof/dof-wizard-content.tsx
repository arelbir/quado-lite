"use client";

import { Step1Problem } from "./wizard/step1-problem";
import { Step2TempMeasures } from "./wizard/step2-temp-measures";
import { Step3RootCause } from "./wizard/step3-root-cause";
import { Step4Activities } from "./wizard/step4-activities";
import { Step5Implementation } from "./wizard/step5-implementation";
import { Step6Effectiveness } from "./wizard/step6-effectiveness";
import { Step7Approval } from "./wizard/step7-approval";

interface User {
  id: string;
  name: string | null;
  email: string | null;
}

interface DofWizardContentProps {
  dof: any;
  currentStep: number;
  users: User[];
}

export function DofWizardContent({ dof, currentStep, users }: DofWizardContentProps) {
  // Step routing
  switch (currentStep) {
    case 1:
      return <Step1Problem dof={dof} />;
    case 2:
      return <Step2TempMeasures dof={dof} />;
    case 3:
      return <Step3RootCause dof={dof} />;
    case 4:
      return <Step4Activities dof={dof} users={users} />;
    case 5:
      return <Step5Implementation dof={dof} />;
    case 6:
      return <Step6Effectiveness dof={dof} />;
    case 7:
      return <Step7Approval dof={dof} />;
    default:
      return <Step1Problem dof={dof} />;
  }
}
