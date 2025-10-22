"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield } from "lucide-react";
import { toast } from "sonner";
import { updateDofStep } from "@/action/dof-actions";

interface Step2TempMeasuresProps {
  dof: any;
}

export function Step2TempMeasures({ dof }: Step2TempMeasuresProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [tempMeasures, setTempMeasures] = useState(dof.tempMeasures || "");

  const handleNext = () => {
    if (!tempMeasures.trim()) {
      toast.error("Lütfen geçici önlemleri girin");
      return;
    }

    startTransition(async () => {
      const result = await updateDofStep(dof.id, {
        step: "Step2_TempMeasures",
        data: { tempMeasures },
      });

      if (result.success) {
        toast.success("Adım 2 tamamlandı! Adım 3'e geçiliyor...");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Bilgi Card */}
      <Card className="border-cyan-200 dark:border-cyan-900 bg-cyan-50/50 dark:bg-cyan-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-cyan-900 dark:text-cyan-100">
            <Shield className="h-5 w-5" />
            Adım 2: Geçici Önlemler
          </CardTitle>
          <CardDescription className="text-cyan-800 dark:text-cyan-200">
            Problemin tekrarını önlemek için hemen alınan geçici önlemleri belirtin
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Problem Özeti */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Problem Özeti</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Başlık:</p>
              <p className="text-sm">{dof.problemTitle}</p>
            </div>
            {dof.problemDetails && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Detaylar:</p>
                <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                  {dof.problemDetails.substring(0, 200)}...
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Geçici Önlemler */}
      <Card>
        <CardHeader>
          <CardTitle>Alınan Geçici Önlemler</CardTitle>
          <CardDescription>
            Kök neden analizi yapılana kadar problemin tekrarını önlemek için alınan hızlı aksiyonlar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="temp-measures">Geçici Önlemler *</Label>
              <Textarea
                id="temp-measures"
                value={tempMeasures}
                onChange={(e) => setTempMeasures(e.target.value)}
                placeholder="Örnek:&#10;• Hatalı ürünler karantinaya alındı&#10;• İlgili personel uyarıldı&#10;• Süreç geçici olarak durduruldu&#10;• Ekstra kontrol noktası eklendi"
                className="min-h-[250px]"
              />
            </div>

            <div className="p-4 rounded-lg bg-muted">
              <p className="text-xs font-medium mb-2">💡 Not:</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Geçici önlemler kök nedeni çözmez, sadece etkiyi azaltır</li>
                <li>• Kalıcı çözüm için kök neden analizi yapılmalı (Adım 3)</li>
                <li>• Alınan her önlemi madde madde listeleyin</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button
          onClick={handleNext}
          disabled={isPending || !tempMeasures.trim()}
        >
          Kaydet ve Adım 3'e Geç (Kök Neden Analizi)
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
