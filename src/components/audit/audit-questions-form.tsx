"use client";

import { useState, useEffect, useTransition } from "react";
import { useTranslations } from 'next-intl';
import { saveAllAuditAnswers } from "@/server/actions/audit-question-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Save, CheckCircle2 } from "lucide-react";
import { QuestionCard } from "./question-card";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { useRouter } from "next/navigation";

interface FormState {
  [questionId: string]: {
    answer: string;
    notes: string;
    isNonCompliant: boolean;
  };
}

interface AuditQuestionsFormProps {
  auditId: string;
  questions: any[];
}

export function AuditQuestionsForm({ auditId, questions }: AuditQuestionsFormProps) {
  const router = useRouter();
  const [formState, setFormState] = useState<FormState>({});
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isAutoSaving, setIsAutoSaving] = useState(false);

  // Initialize form state from existing answers
  useEffect(() => {
    const initialState: FormState = {};
    questions.forEach((aq) => {
      initialState[aq.id] = {
        answer: aq.answer || "",
        notes: aq.notes || "",
        isNonCompliant: aq.isNonCompliant || false,
      };
    });
    setFormState(initialState);
  }, [questions]);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const timer = setInterval(() => {
      handleAutoSave();
    }, 30000); // 30 seconds

    return () => clearInterval(timer);
  }, [formState, hasUnsavedChanges]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSaveAll();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [formState]);

  const updateQuestion = (questionId: string, updates: Partial<FormState[string]>) => {
    setFormState((prev) => ({
      ...prev,
      [questionId]: {
        answer: prev[questionId]?.answer || "",
        notes: prev[questionId]?.notes || "",
        isNonCompliant: prev[questionId]?.isNonCompliant || false,
        ...updates,
      },
    }));
    setHasUnsavedChanges(true);
  };

  const handleAutoSave = async () => {
    if (!hasUnsavedChanges || isAutoSaving) return;

    setIsAutoSaving(true);
    try {
      const answers = Object.entries(formState).map(([auditQuestionId, data]) => ({
        auditQuestionId,
        ...data,
      }));

      const result = await saveAllAuditAnswers({ auditId, answers });

      if (result.success) {
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
      }
    } catch (error) {
      console.error("Auto-save error:", error);
    } finally {
      setIsAutoSaving(false);
    }
  };

  const handleSaveAll = () => {
    startTransition(async () => {
      try {
        const answers = Object.entries(formState)
          .filter(([_, data]) => data.answer) // Only save answered questions
          .map(([auditQuestionId, data]) => ({
            auditQuestionId,
            ...data,
          }));

        if (answers.length === 0) {
          toast.error("Lütfen en az bir soruyu cevaplayın");
          return;
        }

        const result = await saveAllAuditAnswers({ auditId, answers });

        if (result.success) {
          toast.success(`${answers.length} cevap başarıyla kaydedildi!`);
          setLastSaved(new Date());
          setHasUnsavedChanges(false);
          router.refresh();
        } else {
          toast.error(result.error || "Kaydetme başarısız");
        }
      } catch (error) {
        toast.error("Bir hata oluştu");
      }
    });
  };

  const answeredCount = Object.values(formState).filter((q) => q.answer).length;
  const nonCompliantCount = Object.values(formState).filter((q) => q.isNonCompliant).length;

  // Group questions by bank
  const groupedQuestions = questions.reduce((acc, aq) => {
    const bankName = aq.question?.bank?.name || "Diğer";
    if (!acc[bankName]) {
      acc[bankName] = [];
    }
    acc[bankName].push(aq);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="space-y-6 pb-24">
      {/* Questions by Bank */}
      {Object.entries(groupedQuestions).map(([bankName, bankQuestions]) => (
        <Card key={bankName}>
          <CardHeader>
            <CardTitle>{bankName}</CardTitle>
            <CardDescription>
              {(bankQuestions as any[]).filter((q: any) => formState[q.id]?.answer).length} / {(bankQuestions as any[]).length} cevaplandı
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {(bankQuestions as any[]).map((aq: any, index: number) => (
              <QuestionCard
                key={aq.id}
                auditQuestion={aq}
                questionNumber={index + 1}
                value={formState[aq.id] || { answer: "", notes: "", isNonCompliant: false }}
                onChange={(updates: any) => updateQuestion(aq.id, updates)}
              />
            ))}
          </CardContent>
        </Card>
      ))}

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="container max-w-screen-2xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Status */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="font-medium">{answeredCount} / {questions.length}</span>
                <span className="text-muted-foreground">cevaplandı</span>
              </div>
              {nonCompliantCount > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-destructive font-medium">{nonCompliantCount}</span>
                  <span className="text-muted-foreground">uygunsuz</span>
                </div>
              )}
              {isAutoSaving && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span className="text-xs">Otomatik kaydediliyor...</span>
                </div>
              )}
              {lastSaved && !hasUnsavedChanges && (
                <span className="text-xs text-muted-foreground">
                  💾 {formatDistanceToNow(lastSaved, { addSuffix: true, locale: tr })} kaydedildi
                </span>
              )}
              {hasUnsavedChanges && !isAutoSaving && (
                <span className="text-xs text-warning">
                  ⚠️ Kaydedilmemiş değişiklikler
                </span>
              )}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleAutoSave}
                disabled={!hasUnsavedChanges || isAutoSaving}
              >
                Taslak Kaydet
              </Button>
              <Button
                onClick={handleSaveAll}
                disabled={isPending || answeredCount === 0}
                size="lg"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Tümünü Kaydet
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
