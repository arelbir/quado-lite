"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, AlertCircle, Ban } from "lucide-react";
import { toast } from "sonner";
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

  const handleComplete = () => {
    if (!completionNotes.trim()) {
      toast.error("Lütfen ne yaptığınızı açıklayın");
      return;
    }

    startTransition(async () => {
      const result = await completeAction(actionId, completionNotes);
      if (result.success) {
        toast.success("Aksiyon tamamlandı! Yönetici onayına gönderildi.");
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
        toast.success("Aksiyon onaylandı!");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      toast.error("Lütfen ret nedenini açıklayın");
      return;
    }

    startTransition(async () => {
      const result = await rejectAction(actionId, rejectReason);
      if (result.success) {
        toast.success("Aksiyon reddedildi ve tekrar atandı");
        setRejectReason("");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleCancel = () => {
    if (!cancelReason.trim()) {
      toast.error("Lütfen iptal nedenini açıklayın");
      return;
    }

    startTransition(async () => {
      const result = await cancelAction(actionId, cancelReason);
      if (result.success) {
        toast.success("Aksiyon iptal edildi");
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
              Tamamladım
            </Button>
          </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Aksiyonu Tamamla</AlertDialogTitle>
            <AlertDialogDescription>
              Bu aksiyonu tamamlandı olarak işaretleyeceksiniz. Yaptığınız işi açıklayın.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="completion-notes">Ne Yaptınız? *</Label>
            <Textarea
              id="completion-notes"
              value={completionNotes}
              onChange={(e) => setCompletionNotes(e.target.value)}
              placeholder="Aksiyonu nasıl tamamladınız? Ne yaptınız?"
              className="mt-2 min-h-[120px]"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Bu açıklama yönetici tarafından görülecektir.
            </p>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCompletionNotes("")}>Vazgeç</AlertDialogCancel>
            <AlertDialogAction onClick={handleComplete} disabled={isPending}>
              Tamamla ve Gönder
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* İptal Butonu */}
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
              Bu aksiyon kalıcı olarak iptal edilecek. İptal nedeni belirtin.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="cancel-reason">İptal Nedeni *</Label>
            <Textarea
              id="cancel-reason"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Neden iptal ediliyor?"
              className="mt-2"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCancelReason("")}>Vazgeç</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel} disabled={isPending} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              İptal Et
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
              Onayla
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Aksiyonu Onayla?</AlertDialogTitle>
              <AlertDialogDescription>
                Bu aksiyonun tamamlandığını onaylıyorsunuz. Aksiyon kapatılacaktır.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>İptal</AlertDialogCancel>
              <AlertDialogAction onClick={handleApprove} disabled={isPending}>
                Evet, Onayla
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Reddet */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={isPending}>
              <XCircle className="h-4 w-4 mr-2" />
              Reddet
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Aksiyonu Reddet?</AlertDialogTitle>
              <AlertDialogDescription>
                Bu aksiyonu reddediyorsunuz. Lütfen ret nedenini belirtin.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
              <Label htmlFor="reason">Ret Nedeni *</Label>
              <Textarea
                id="reason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Neden reddedildi?"
                className="mt-2"
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Vazgeç</AlertDialogCancel>
              <AlertDialogAction onClick={handleReject} disabled={isPending}>
                Reddet
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
                Bu aksiyon kalıcı olarak iptal edilecek. İptal nedeni belirtin.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
              <Label htmlFor="cancel-reason-manager">İptal Nedeni *</Label>
              <Textarea
                id="cancel-reason-manager"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Neden iptal ediliyor?"
                className="mt-2"
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setCancelReason("")}>Vazgeç</AlertDialogCancel>
              <AlertDialogAction onClick={handleCancel} disabled={isPending} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                İptal Et
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
        <span>Tamamlandı</span>
      </div>
    );
  }

  if (status === "Rejected") {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <span>Reddedildi</span>
      </div>
    );
  }

  // Cancelled - İptal edildi (döngüden çıkış)
  if (status === "Cancelled") {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Ban className="h-4 w-4 text-gray-600" />
        <span>İptal Edildi</span>
      </div>
    );
  }

  return null;
}
