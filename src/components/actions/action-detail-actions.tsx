"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, AlertCircle, Ban } from "lucide-react";
import { useTranslations } from 'next-intl';
import { useToastMessages } from "@/lib/i18n/toast-messages";
import { useButtonLabels } from "@/lib/i18n/button-labels";
import { completeAction, approveAction, rejectAction, cancelAction } from "@/action/action-actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useCurrentUser } from "@/hooks/use-current-user";

interface ActionDetailActionsProps {
  actionId: string;
  status: string;
}

export function ActionDetailActions({ actionId, status }: ActionDetailActionsProps) {
  const router = useRouter();
  const user = useCurrentUser();
  const [isPending, startTransition] = useTransition();
  const [completionNotes, setCompletionNotes] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  
  // i18n
  const t = useTranslations('action');
  const tCommon = useTranslations('common');
  const toast = useToastMessages();
  const btn = useButtonLabels();

  const handleComplete = () => {
    if (!completionNotes.trim()) {
      toast.error(t('messages.enterNotes'));
      return;
    }

    startTransition(async () => {
      const result = await completeAction(actionId, completionNotes);
      if (result.success) {
        toast.action.completed();
        setCompletionNotes("");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleApprove = () => {
    startTransition(async () => {
      const result = await approveAction(actionId);
      if (result.success) {
        toast.action.approved();
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      toast.error(t('messages.enterRejectionReason'));
      return;
    }

    startTransition(async () => {
      const result = await rejectAction(actionId, rejectReason);
      if (result.success) {
        toast.action.rejected();
        setRejectReason("");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleCancel = () => {
    if (!cancelReason.trim()) {
      toast.error(t('messages.enterCancellationReason'));
      return;
    }

    startTransition(async () => {
      const result = await cancelAction(actionId, cancelReason);
      if (result.success) {
        toast.action.cancelled();
        setCancelReason("");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  // Assigned durumunda - Tamamla + İptal
  if (status === "Assigned") {
    return (
      <div className="flex items-center gap-2">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button disabled={isPending}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {btn.action.complete}
            </Button>
          </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('complete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('messages.confirmComplete')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="completion-notes">{t('fields.completionNotes')} *</Label>
            <Textarea
              id="completion-notes"
              value={completionNotes}
              onChange={(e) => setCompletionNotes(e.target.value)}
              placeholder={t('placeholders.enterNotes')}
              className="mt-2 min-h-[120px]"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCompletionNotes("")}>{btn.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={handleComplete} disabled={isPending}>
              {btn.submit}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* İptal Butonu */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" disabled={isPending}>
            <Ban className="h-4 w-4 mr-2" />
            {btn.action.cancel}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('cancel')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('messages.confirmCancel')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="cancel-reason">{t('fields.rejectionReason')} *</Label>
            <Textarea
              id="cancel-reason"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder={t('placeholders.enterReason')}
              className="mt-2"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCancelReason("")}>{btn.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel} disabled={isPending} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {btn.action.cancel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    );
  }

  // PendingManagerApproval - Sadece yönetici onaylayabilir/reddedebilir
  if (status === "PendingManagerApproval") {
    return (
      <div className="flex gap-2">
        {/* Onayla */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button disabled={isPending}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {btn.action.approve}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('approve')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('messages.confirmApprove')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{btn.cancel}</AlertDialogCancel>
              <AlertDialogAction onClick={handleApprove} disabled={isPending}>
                {btn.action.approve}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Reddet */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={isPending}>
              <XCircle className="h-4 w-4 mr-2" />
              {btn.action.reject}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('reject')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('messages.confirmReject')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
              <Label htmlFor="reason">{t('fields.rejectionReason')} *</Label>
              <Textarea
                id="reason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder={t('placeholders.enterReason')}
                className="mt-2"
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>{btn.cancel}</AlertDialogCancel>
              <AlertDialogAction onClick={handleReject} disabled={isPending}>
                {btn.action.reject}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* İptal Butonu - Yönetici döngüyü kırabilir */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" disabled={isPending}>
              <Ban className="h-4 w-4 mr-2" />
              İptal Et
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Aksiyonu İptal Et</AlertDialogTitle>
              <AlertDialogDescription>
                {t('messages.confirmCancelManager')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
              <Label htmlFor="cancel-reason-manager">{t('fields.rejectionReason')} *</Label>
              <Textarea
                id="cancel-reason-manager"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder={t('placeholders.enterReason')}
                className="mt-2"
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setCancelReason("")}>{btn.cancel}</AlertDialogCancel>
              <AlertDialogAction onClick={handleCancel} disabled={isPending} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                {t('action.cancel')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  // Completed - Başarıyla tamamlandı
  if (status === "Completed") {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <span>{t('status.completed')}</span>
      </div>
    );
  }

  if (status === "Rejected") {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <span>{t('status.rejected')}</span>
      </div>
    );
  }

  // Cancelled - İptal edildi (döngüden çıkış)
  if (status === "Cancelled") {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Ban className="h-4 w-4 text-gray-600" />
        <span>{t('status.cancelled')}</span>
      </div>
    );
  }

  return null;
}
