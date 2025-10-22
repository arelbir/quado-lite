"use client";

import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface DofProgressBarProps {
  currentStep: number; // 1-7
  status: string;
}

const steps = [
  { number: 1, label: "Problem", key: "Step1_Problem" },
  { number: 2, label: "Geçici Önlem", key: "Step2_TempMeasures" },
  { number: 3, label: "Kök Neden", key: "Step3_RootCause" },
  { number: 4, label: "Faaliyetler", key: "Step4_Activities" },
  { number: 5, label: "Uygulama", key: "Step5_Implementation" },
  { number: 6, label: "Etkinlik", key: "Step6_EffectivenessCheck" },
  { number: 7, label: "Onay", key: "PendingManagerApproval" },
];

export function DofProgressBar({ currentStep, status }: DofProgressBarProps) {
  const isCompleted = status === "Completed";
  const isRejected = status === "Rejected";

  return (
    <div className="w-full py-6">
      {/* Progress Line + Steps */}
      <div className="relative">
        {/* Background Line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-border" />
        
        {/* Progress Line */}
        <div
          className="absolute top-5 left-0 h-0.5 bg-primary transition-all duration-500"
          style={{
            width: `${((currentStep - 1) / 6) * 100}%`,
          }}
        />

        {/* Steps */}
        <div className="relative flex justify-between">
          {steps.map((step) => {
            const isActive = step.number === currentStep;
            const isPast = step.number < currentStep || isCompleted;

            return (
              <div key={step.number} className="flex flex-col items-center">
                {/* Circle */}
                <div
                  className={cn(
                    "w-10 h-10 rounded-full border-2 flex items-center justify-center bg-background transition-all",
                    isPast && "border-primary bg-primary text-primary-foreground",
                    isActive && !isPast && "border-primary",
                    !isActive && !isPast && "border-border",
                    isRejected && isActive && "border-red-500"
                  )}
                >
                  {isPast ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <Circle
                      className={cn(
                        "h-5 w-5",
                        isActive && "fill-current"
                      )}
                    />
                  )}
                </div>

                {/* Label */}
                <span
                  className={cn(
                    "mt-2 text-xs font-medium text-center",
                    isActive && "text-primary",
                    !isActive && !isPast && "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Status Message */}
      {isCompleted && (
        <div className="mt-6 text-center">
          <p className="text-sm font-medium text-green-600 dark:text-green-400">
            ✅ DÖF Tamamlandı ve Onaylandı
          </p>
        </div>
      )}
      {isRejected && (
        <div className="mt-6 text-center">
          <p className="text-sm font-medium text-red-600 dark:text-red-400">
            ❌ DÖF Reddedildi
          </p>
        </div>
      )}
    </div>
  );
}
