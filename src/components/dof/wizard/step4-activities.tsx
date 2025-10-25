"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Plus, ListChecks, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { updateDofStep } from "@/server/actions/dof-actions";
import { DofActivityForm } from "../dof-activity-form";
import { useTranslations } from 'next-intl';

interface User {
  id: string;
  name: string | null;
  email: string | null;
}

interface Step4ActivitiesProps {
  dof: any;
  users: User[];
}

export function Step4Activities({ dof, users }: Step4ActivitiesProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);

  const handleNext = () => {
    // En az 1 activity olmalı (backend kontrolü var)
    startTransition(async () => {
      const result = await updateDofStep(dof.id, {
        step: "Step4_Activities",
        data: {},
      });

      if (result.success) {
        toast.success("Faaliyetler kaydedildi! Adım 5'e geçiliyor...");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Bilgi Card */}
      <Card className="border-indigo-200 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-indigo-900 dark:text-indigo-100">
            <ListChecks className="h-5 w-5" />
            Adım 4: Faaliyet Belirleme
          </CardTitle>
          <CardDescription className="text-indigo-800 dark:text-indigo-200">
            Kök nedeni çözmek için yapılacak <strong>Düzeltici</strong> ve <strong>Önleyici</strong> faaliyetleri belirleyin
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Kök Neden Özeti */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Kök Neden Analizi Özeti</CardTitle>
        </CardHeader>
        <CardContent>
          {dof.rootCauseAnalysis ? (
            <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900">
              <p className="text-sm whitespace-pre-wrap">
                {dof.rootCauseAnalysis.substring(0, 300)}...
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Kök neden analizi yapılmamış</p>
          )}
        </CardContent>
      </Card>

      {/* Faaliyetler Listesi */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Faaliyet Listesi</CardTitle>
            <CardDescription>
              Düzeltici ve Önleyici Faaliyetler
            </CardDescription>
          </div>
          <Button onClick={() => setShowForm(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Faaliyet Ekle
          </Button>
        </CardHeader>
        <CardContent>
          {/* Activity Form */}
          {showForm && (
            <DofActivityForm
              dofId={dof.id}
              users={users}
              onSuccess={() => {
                setShowForm(false);
                router.refresh();
              }}
              onCancel={() => setShowForm(false)}
            />
          )}

          {/* Actions Listesi */}
          <div className="space-y-3 mt-4">
            {dof.actions && dof.actions.length > 0 ? (
              dof.actions.map((action: any) => (
                <div key={action.id} className="p-4 rounded-lg border bg-card">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          action.type === 'Corrective' 
                            ? 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                        }`}>
                          {action.type === 'Corrective' ? 'Düzeltici' : 'Önleyici'}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          action.status === 'Completed' 
                            ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
                            : action.status === 'PendingManagerApproval'
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-950 dark:text-gray-300'
                        }`}>
                          {action.status}
                        </span>
                      </div>
                      <p className="text-sm">{action.details}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 rounded-lg border bg-muted/50">
                <p className="text-sm text-muted-foreground text-center">
                  Henüz aksiyon eklenmemiş. "Faaliyet Ekle" butonuna tıklayın.
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 p-4 rounded-lg bg-muted">
            <p className="text-xs font-medium mb-2">💡 Faaliyet Türleri:</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• <strong>Düzeltici:</strong> Mevcut problemi çözen aksiyonlar</li>
              <li>• <strong>Önleyici:</strong> Benzer problemlerin tekrarını önleyen aksiyonlar</li>
              <li>• Her faaliyet için sorumlu ve termin tarihi belirleyin</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button
          onClick={handleNext}
          disabled={isPending}
        >
          Kaydet ve Adım 5'e Geç (Uygulama)
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
