"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { approveDof, rejectDof } from "@/action/dof-actions";
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

interface Step7ApprovalProps {
  dof: any;
}

export function Step7Approval({ dof }: Step7ApprovalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleApprove = () => {
    startTransition(async () => {
      const result = await approveDof(dof.id);
      if (result.success) {
        toast.success("DÖF onaylandı ve tamamlandı!");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleReject = () => {
    startTransition(async () => {
      const result = await rejectDof(dof.id);
      if (result.success) {
        toast.success("DÖF reddedildi");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  const isCompleted = dof.status === "Completed";
  const isRejected = dof.status === "Rejected";
  const isPendingApproval = dof.status === "PendingManagerApproval";

  return (
    <div className="space-y-6">
      <Card className="border-yellow-200 dark:border-yellow-900 bg-yellow-50/50 dark:bg-yellow-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-900 dark:text-yellow-100">
            <Clock className="h-5 w-5" />
            Adım 7: Yönetici Onayı
          </CardTitle>
          <CardDescription className="text-yellow-800 dark:text-yellow-200">
            DÖF süreci tamamlandı, yönetici onayı bekleniyor
          </CardDescription>
        </CardHeader>
      </Card>

      {/* DÖF Özeti */}
      <Card>
        <CardHeader>
          <CardTitle>DÖF Özeti</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Problem:</p>
            <p className="text-sm">{dof.problemTitle}</p>
          </div>

          {dof.rootCauseAnalysis && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Kök Neden:</p>
              <p className="text-sm whitespace-pre-wrap">
                {dof.rootCauseAnalysis.substring(0, 200)}...
              </p>
            </div>
          )}

          {dof.effectivenessCheck && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Etkinlik Kontrolü:</p>
              <p className="text-sm whitespace-pre-wrap">
                {dof.effectivenessCheck.substring(0, 200)}...
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status Based Actions */}
      {isCompleted && (
        <Card className="border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
              <div>
                <p className="font-medium text-green-900 dark:text-green-100">DÖF Tamamlandı</p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Yönetici tarafından onaylandı ve kapatıldı
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isRejected && (
        <Card className="border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <XCircle className="h-8 w-8 text-red-600" />
              <div>
                <p className="font-medium text-red-900 dark:text-red-100">DÖF Reddedildi</p>
                <p className="text-sm text-red-700 dark:text-red-300">
                  Yönetici tarafından reddedildi
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isPendingApproval && (
        <Card>
          <CardHeader>
            <CardTitle>Yönetici Aksiyonları</CardTitle>
            <CardDescription>
              DÖF sürecini tamamlamak veya reddetmek için karar verin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button disabled={isPending}>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    DÖF'ü Onayla
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>DÖF'ü Onayla?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Bu DÖF sürecini onaylıyorsunuz. DÖF tamamlanmış olarak işaretlenecek.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>İptal</AlertDialogCancel>
                    <AlertDialogAction onClick={handleApprove}>
                      Evet, Onayla
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={isPending}>
                    <XCircle className="h-4 w-4 mr-2" />
                    DÖF'ü Reddet
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>DÖF'ü Reddet?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Bu DÖF sürecini reddediyorsunuz. DÖF reddedilmiş olarak işaretlenecek.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>İptal</AlertDialogCancel>
                    <AlertDialogAction onClick={handleReject}>
                      Evet, Reddet
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
