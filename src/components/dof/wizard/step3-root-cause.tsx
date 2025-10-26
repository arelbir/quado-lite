"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, Search, FileImage, Edit3 } from "lucide-react";
import { toast } from "sonner";
import { updateDofStep } from "@/server/actions/dof-actions";
import { useTranslations } from 'next-intl';

interface Step3RootCauseProps {
  dof: any;
}

export function Step3RootCause({ dof }: Step3RootCauseProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  // 5 Why Analysis
  const [why1, setWhy1] = useState("");
  const [why2, setWhy2] = useState("");
  const [why3, setWhy3] = useState("");
  const [why4, setWhy4] = useState("");
  const [why5, setWhy5] = useState("");
  const [rootCause, setRootCause] = useState("");
  
  // Freeform analysis
  const [freeformAnalysis, setFreeformAnalysis] = useState(dof.rootCauseAnalysis || "");
  
  // File upload
  const [fileUrl, setFileUrl] = useState(dof.rootCauseFileUrl || "");

  const handleNext = () => {
    // 5 Why veya Freeform en az biri dolu olmalı
    const has5Why = why1 && why2 && why3 && why4 && why5 && rootCause;
    const hasFreeform = freeformAnalysis.trim();
    
    if (!has5Why && !hasFreeform) {
      toast.error("Lütfen 5 Why analizi veya detaylı açıklama yapın");
      return;
    }

    // 5 Why'ı freeform'a çevir
    let finalAnalysis = freeformAnalysis;
    if (has5Why) {
      finalAnalysis = `**5 Why Analizi:**\n\n1. Neden? ${why1}\n2. Neden? ${why2}\n3. Neden? ${why3}\n4. Neden? ${why4}\n5. Neden? ${why5}\n\n**Kök Neden:** ${rootCause}`;
      if (freeformAnalysis) {
        finalAnalysis += `\n\n**Ek Açıklamalar:**\n${freeformAnalysis}`;
      }
    }

    startTransition(async () => {
      const result = await updateDofStep(dof.id, {
        step: "Step3_RootCause",
        data: { 
          rootCauseAnalysis: finalAnalysis,
          rootCauseFileUrl: fileUrl || null,
        },
      });

      if (result.success) {
        toast.success("Kök neden analizi tamamlandı! Adım 4'e geçiliyor...");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Bilgi Card */}
      <Card className="border-purple-200 dark:border-purple-900 bg-purple-50/50 dark:bg-purple-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-900 dark:text-purple-100">
            <Search className="h-5 w-5" />
            Adım 3: Kök Neden Analizi
          </CardTitle>
          <CardDescription className="text-purple-800 dark:text-purple-200">
            Problemin gerçek nedenini bulmak için <strong>5 Why</strong> veya <strong>Fishbone</strong> yöntemi kullanın
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Problem Özeti */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Problem & Geçici Önlemler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-medium text-muted-foreground">Problem:</p>
              <p>{dof.problemTitle}</p>
            </div>
            {dof.tempMeasures && (
              <div>
                <p className="font-medium text-muted-foreground">Geçici Önlemler:</p>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {dof.tempMeasures.substring(0, 150)}...
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Kök Neden Analizi - Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Kök Neden Analizi</CardTitle>
          <CardDescription>
            Problemi çözmek için gerçek nedeni bulun. Birden fazla yöntem kullanabilirsiniz.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="5why" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="5why">5 Why</TabsTrigger>
              <TabsTrigger value="fishbone">Fishbone</TabsTrigger>
              <TabsTrigger value="freeform">Detaylı Açıklama</TabsTrigger>
            </TabsList>

            {/* 5 Why Analysis */}
            <TabsContent value="5why" className="space-y-4">
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-xs font-medium mb-2">🎯 5 Why Yöntemi:</p>
                <p className="text-xs text-muted-foreground">
                  Her cevap bir sonraki "Neden?" sorusunun konusudur. 5 kez "Neden?" sorarak kök nedene ulaşın.
                </p>
              </div>

              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="why1">1. Neden bu problem oluştu?</Label>
                  <Input
                    id="why1"
                    value={why1}
                    onChange={(e) => setWhy1(e.target.value)}
                    placeholder="İlk neden..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="why2">2. Neden? (Yukarıdaki cevabın nedeni)</Label>
                  <Input
                    id="why2"
                    value={why2}
                    onChange={(e) => setWhy2(e.target.value)}
                    placeholder="İkinci neden..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="why3">3. Neden?</Label>
                  <Input
                    id="why3"
                    value={why3}
                    onChange={(e) => setWhy3(e.target.value)}
                    placeholder="Üçüncü neden..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="why4">4. Neden?</Label>
                  <Input
                    id="why4"
                    value={why4}
                    onChange={(e) => setWhy4(e.target.value)}
                    placeholder="Dördüncü neden..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="why5">5. Neden?</Label>
                  <Input
                    id="why5"
                    value={why5}
                    onChange={(e) => setWhy5(e.target.value)}
                    placeholder="Beşinci neden..."
                  />
                </div>

                {/* Kök Neden */}
                <div className="p-4 rounded-lg bg-primary/10 border-2 border-primary/20">
                  <Label htmlFor="root-cause" className="text-primary">
                    🎯 Kök Neden (Son Cevap)
                  </Label>
                  <Textarea
                    id="root-cause"
                    value={rootCause}
                    onChange={(e) => setRootCause(e.target.value)}
                    placeholder="5 Why analizinin sonucunda bulunan gerçek kök neden..."
                    className="mt-2"
                    rows={3}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Fishbone Diagram */}
            <TabsContent value="fishbone" className="space-y-4">
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-xs font-medium mb-2">🐟 Fishbone (Balık Kılçığı) Diyagramı:</p>
                <p className="text-xs text-muted-foreground">
                  İnsan, Makine, Malzeme, Metot, Ölçüm, Çevre kategorilerinde nedenleri analiz edin.
                  Diyagramı harici bir araçta çizin ve yükleyin.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="file-url">Fishbone Diyagram Dosyası (URL veya path)</Label>
                <Input
                  id="file-url"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  placeholder="https://... veya /uploads/fishbone.png"
                />
              </div>

              {fileUrl && (
                <div className="border rounded-lg p-4">
                  <p className="text-sm font-medium mb-2">Önizleme:</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileImage className="h-4 w-4" />
                    <span>{fileUrl}</span>
                  </div>
                </div>
              )}

              <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800">
                <p className="text-xs text-yellow-800 dark:text-yellow-200">
                  💡 Not: Dosya yükleme özelliği yakında eklenecek. Şimdilik dosya URL'si girebilirsiniz.
                </p>
              </div>
            </TabsContent>

            {/* Freeform */}
            <TabsContent value="freeform" className="space-y-4">
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-xs font-medium mb-2">📝 Detaylı Açıklama:</p>
                <p className="text-xs text-muted-foreground">
                  Kök neden analizinizi serbest formatta yazın. Kullandığınız yöntemi ve bulguları açıklayın.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="freeform">Kök Neden Analizi Açıklaması</Label>
                <Textarea
                  id="freeform"
                  value={freeformAnalysis}
                  onChange={(e) => setFreeformAnalysis(e.target.value)}
                  placeholder="Kök neden analizinizi detaylı olarak yazın...&#10;&#10;• Hangi yöntemi kullandınız?&#10;• Ana bulgular nelerdir?&#10;• Kök neden nedir?&#10;• Nasıl emin oldunuz?"
                  className="min-h-[300px] font-mono text-sm"
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button
          onClick={handleNext}
          disabled={isPending}
        >
          Kaydet ve Adım 4'e Geç (Faaliyetler)
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
