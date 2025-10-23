"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { MessageSquarePlus } from "lucide-react";
import { useTranslations } from 'next-intl';
import { useToastMessages } from "@/lib/i18n/toast-messages";
import { addActionProgress } from "@/action/action-actions";

/**
 * Action Progress Form
 * 
 * Kullanım: Aksiyon henüz tamamlanmadı ama ilerleme var
 * - "Bugün hata analizi yaptım"
 * - "Yarın fix uygulayacağım"  
 * - Timeline'da görünecek
 */

interface ActionProgressFormProps {
  actionId: string;
  actionStatus: string;
}

export function ActionProgressForm({ actionId, actionStatus }: ActionProgressFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [note, setNote] = useState("");
  
  // i18n
  const t = useTranslations('action');
  const toast = useToastMessages();

  // Sadece Assigned durumunda progress eklenebilir
  if (actionStatus !== "Assigned") {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!note.trim()) {
      toast.error(t('messages.enterNotes'));
      return;
    }

    startTransition(async () => {
      const result = await addActionProgress(actionId, note.trim());

      if (result.success) {
        toast.success();
        setNote("");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <Card className="border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
          <MessageSquarePlus className="h-5 w-5" />
          {t('sections.progress')}
        </CardTitle>
        <CardDescription className="text-blue-800 dark:text-blue-200">
          {t('fields.notes')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="progress-note">
              {t('fields.notes')}
            </Label>
            <Textarea
              id="progress-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t('placeholders.enterNotes')}
              className="min-h-[100px]"
              disabled={isPending}
            />
          </div>

          <Button type="submit" disabled={isPending || !note.trim()}>
            {isPending ? t('messages.saving') || 'Saving...' : t('sections.progress')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
