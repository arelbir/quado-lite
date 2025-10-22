"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ArrowRight, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { updateDofStep } from "@/action/dof-actions";
import Link from "next/link";

interface Step1ProblemProps {
  dof: any;
}

export function Step1Problem({ dof }: Step1ProblemProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [problemDetails, setProblemDetails] = useState(dof.problemDetails || "");

  const handleNext = () => {
    if (!problemDetails.trim()) {
      toast.error("Lütfen problem detaylarını girin");
      return;
    }

    startTransition(async () => {
      const result = await updateDofStep(dof.id, {
        step: "Step1_Problem",
        data: { problemDetails },
      });

      if (result.success) {
        toast.success("Adım 1 tamamlandı! Adım 2'ye geçiliyor...");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Bilgi Card */}
      <Card className="border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
            <HelpCircle className="h-5 w-5" />
            Adım 1: Problem Tanımı (5N1K)
          </CardTitle>
          <CardDescription className="text-blue-800 dark:text-blue-200">
            Problemi detaylı olarak tanımlayın: <strong>Ne? Nerede? Ne zaman? Kim? Nasıl? Niçin?</strong>
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Problem Başlığı (readonly) */}
      <Card>
        <CardHeader>
          <CardTitle>Problem Başlığı</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm font-medium p-3 rounded-lg bg-muted">
            {dof.problemTitle}
          </p>
        </CardContent>
      </Card>

      {/* Bağlı Bulgu */}
      {dof.finding && (
        <Card>
          <CardHeader>
            <CardTitle>Bağlı Bulgu</CardTitle>
          </CardHeader>
          <CardContent>
            <Link
              href={`/denetim/findings/${dof.finding.id}`}
              className="block p-4 border rounded-lg hover:bg-accent transition-colors"
            >
              <p className="font-medium mb-2">{dof.finding.details}</p>
              <p className="text-xs text-muted-foreground">
                Bulgu detaylarını görüntülemek için tıklayın →
              </p>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* 5N1K Detayları */}
      <Card>
        <CardHeader>
          <CardTitle>Problem Detayları (5N1K)</CardTitle>
          <CardDescription>
            Problemi aşağıdaki sorular çerçevesinde detaylandırın
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="problem-details">Problem Açıklaması *</Label>
              <Textarea
                id="problem-details"
                value={problemDetails}
                onChange={(e) => setProblemDetails(e.target.value)}
                placeholder={`• Ne? - Problem tam olarak nedir?\n• Nerede? - Problem nerede oluştu?\n• Ne zaman? - Ne zaman tespit edildi?\n• Kim? - Kimler etkilendi?\n• Nasıl? - Nasıl oluştu?\n• Niçin? - Neden önemli?`}
                className="min-h-[300px] font-mono text-sm"
              />
            </div>

            <div className="p-4 rounded-lg bg-muted">
              <p className="text-xs font-medium mb-2">💡 İpuçları:</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Her soruyu ayrı satırlarda cevaplayın</li>
                <li>• Somut ve ölçülebilir bilgiler verin</li>
                <li>• Tarih, yer, kişi gibi detayları belirtin</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button
          onClick={handleNext}
          disabled={isPending || !problemDetails.trim()}
        >
          Kaydet ve Adım 2'ye Geç
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
