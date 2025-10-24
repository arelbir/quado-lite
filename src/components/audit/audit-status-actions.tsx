"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Lock, AlertCircle } from "lucide-react";
import { completeAudit, closeAudit } from "@/action/audit-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useTranslations } from 'next-intl';
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

interface AuditStatusActionsProps {
  audit: {
    id: string;
    status: string;
    title: string;
    auditorId: string | null; // Denetçi
    createdById: string | null; // Oluşturan
  };
  openFindingsCount: number;
  currentUserId: string;
  currentUserRole: string;
}

export function AuditStatusActions({ 
  audit, 
  openFindingsCount,
  currentUserId,
  currentUserRole
}: AuditStatusActionsProps) {
  const t = useTranslations('audit');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Yetki kontrolü: Sadece atanan denetçi veya admin
  const canManageAudit = 
    audit.auditorId === currentUserId || 
    currentUserRole === "admin" || 
    currentUserRole === "superAdmin";

  const handleCompleteAudit = async () => {
    startTransition(async () => {
      const result = await completeAudit(audit.id);
      if (result.success) {
        toast.success(t('messages.auditCompletedSuccess'));
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleCloseAudit = async () => {
    startTransition(async () => {
      const result = await closeAudit(audit.id);
      if (result.success) {
        toast.success(t('messages.auditClosedSuccess'));
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  // Status Badge
  const statusConfig = {
    Active: {
      label: "Aktif",
      color: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
      icon: CheckCircle2,
    },
    InReview: {
      label: "İncelemede",
      color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
      icon: AlertCircle,
    },
    PendingClosure: {
      label: "Kapanış Bekliyor",
      color: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
      icon: CheckCircle2,
    },
    Closed: {
      label: "Kapalı",
      color: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400",
      icon: Lock,
    },
  };

  const currentStatus = statusConfig[audit.status as keyof typeof statusConfig] || statusConfig.Active;
  const Icon = currentStatus.icon;

  return (
    <div className="flex items-center gap-2">
      {/* Status Badge */}
      <Badge className={`text-xs ${currentStatus.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {currentStatus.label}
      </Badge>

      {/* Action Buttons - Sadece yetkililer görebilir */}
      {canManageAudit && audit.status === "Active" && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="sm" disabled={isPending}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {t('actions.completeAudit')}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('actions.completeAudit')}?</AlertDialogTitle>
              <AlertDialogDescription className="space-y-2">
                <p>{t('messages.confirmCompleteAudit')}</p>
                {openFindingsCount > 0 && (
                  <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                      ⚠️ {openFindingsCount} {t('messages.openFindings')}
                    </p>
                    <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                      {t('messages.findingsUnderReview')}
                    </p>
                  </div>
                )}
                <p className="text-sm">Denetim ekranınızdan kalkacak ve bulgular tamamlandığında tekrar size dönecek.</p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>İptal</AlertDialogCancel>
              <AlertDialogAction onClick={handleCompleteAudit} disabled={isPending}>
                Evet, Tamamla
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {audit.status === "InReview" && (
        <div className="text-xs text-muted-foreground">
          {openFindingsCount > 0 
            ? `${openFindingsCount} bulgu tamamlanıyor...` 
            : "Bulgular kontrol ediliyor..."}
        </div>
      )}

      {canManageAudit && audit.status === "PendingClosure" && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="sm" disabled={isPending}>
              <Lock className="h-4 w-4 mr-2" />
              Kapanışı Onayla
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('actions.closeAudit')}?</AlertDialogTitle>
              <AlertDialogDescription>
                <p className="mb-3">{t('messages.confirmCloseAudit')}</p>
                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800">
                  <p className="text-sm text-green-800 dark:text-green-200 font-medium">
                    ✅ {t('messages.allTasksCompleted')}
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                    Denetim kapatıldığında arşive taşınacak ve sadece raporlarda görünecek.
                  </p>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>İptal</AlertDialogCancel>
              <AlertDialogAction onClick={handleCloseAudit} disabled={isPending}>
                Evet, Kapat
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {audit.status === "Closed" && (
        <div className="text-xs text-muted-foreground">
          Arşivlendi
        </div>
      )}
    </div>
  );
}
