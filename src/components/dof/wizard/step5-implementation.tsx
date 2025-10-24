"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import { toast } from "sonner";
import { updateDofStep } from "@/action/dof-actions";
import { useTranslations } from 'next-intl';

interface Step5ImplementationProps {
  dof: any;
}

export function Step5Implementation({ dof }: Step5ImplementationProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleNext = () => {
    startTransition(async () => {
      const result = await updateDofStep(dof.id, {
        step: "Step5_Implementation",
        data: {},
      });

      if (result.success) {
        toast.success("Uygulama adımı tamamlandı! Adım 6'ya geçiliyor...");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="space-y-6">
      <Card className="border-orange-200 dark:border-orange-900 bg-orange-50/50 dark:bg-orange-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-900 dark:text-orange-100">
            <Play className="h-5 w-5" />
            Adım 5: Uygulama
          </CardTitle>
          <CardDescription className="text-orange-800 dark:text-orange-200">
            Belirlenen faaliyetlerin tamamlanmasını takip edin
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Faaliyet Tamamlanma Durumu</CardTitle>
          <CardDescription>
            Tüm faaliyetler tamamlandığında bir sonraki adıma geçebilirsiniz
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 rounded-lg border bg-muted">
            <p className="text-sm text-muted-foreground text-center">
              Faaliyet listesi ve tamamlama tracker burada görünecek
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button onClick={handleNext} disabled={isPending}>
          Faaliyetler Tamamlandı, Adım 6'ya Geç
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
