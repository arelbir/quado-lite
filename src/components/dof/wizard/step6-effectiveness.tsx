"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight, Target } from "lucide-react";
import { toast } from "sonner";
import { updateDofStep } from "@/server/actions/dof-actions";
import { useTranslations } from 'next-intl';

interface Step6EffectivenessProps {
  dof: any;
}

export function Step6Effectiveness({ dof }: Step6EffectivenessProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [effectivenessCheck, setEffectivenessCheck] = useState(dof.effectivenessCheck || "");
  const [checkDate, setCheckDate] = useState("");

  const handleNext = () => {
    if (!effectivenessCheck.trim()) {
      toast.error("Lütfen etkinlik kontrolü yapın");
      return;
    }

    startTransition(async () => {
      const result = await updateDofStep(dof.id, {
        step: "Step6_EffectivenessCheck",
        data: {
          effectivenessCheck,
          effectivenessCheckDate: checkDate ? new Date(checkDate) : new Date(),
        },
      });

      if (result.success) {
        toast.success("Etkinlik kontrolü tamamlandı! Yönetici onayına gönderiliyor...");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="space-y-6">
      <Card className="border-pink-200 dark:border-pink-900 bg-pink-50/50 dark:bg-pink-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-pink-900 dark:text-pink-100">
            <Target className="h-5 w-5" />
            Adım 6: Etkinlik Kontrolü
          </CardTitle>
          <CardDescription className="text-pink-800 dark:text-pink-200">
            Alınan önlemlerin etkinliğini değerlendirin
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Etkinlik Değerlendirmesi</CardTitle>
          <CardDescription>
            Faaliyetler problemi çözdü mü? Tekrar etti mi? Sonuçları değerlendirin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="effectiveness">Etkinlik Kontrolü *</Label>
              <Textarea
                id="effectiveness"
                value={effectivenessCheck}
                onChange={(e) => setEffectivenessCheck(e.target.value)}
                placeholder="• Problem tekrar etti mi?&#10;• Alınan önlemler etkili mi?&#10;• Beklenen sonuçlar elde edildi mi?&#10;• Veriler ve ölçümler neler gösteriyor?"
                className="min-h-[200px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="check-date">Kontrol Tarihi</Label>
              <Input
                id="check-date"
                type="date"
                value={checkDate}
                onChange={(e) => setCheckDate(e.target.value)}
              />
            </div>

            <div className="p-4 rounded-lg bg-muted">
              <p className="text-xs font-medium mb-2">💡 Etkinlik Kriterleri:</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Problem tekrar etmedi mi?</li>
                <li>• Hedeflere ulaşıldı mı?</li>
                <li>• Müşteri/kullanıcı memnun mu?</li>
                <li>• Süreç iyileşti mi?</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button onClick={handleNext} disabled={isPending || !effectivenessCheck.trim()}>
          Yöneticiye Gönder (Onay İçin)
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
