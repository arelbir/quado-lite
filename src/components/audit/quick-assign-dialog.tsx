"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";
import { assignFinding } from "@/server/actions/finding-actions";
import { useTranslations } from 'next-intl';

interface QuickAssignDialogProps {
  findingId: string;
  users: Array<{ id: string; name: string | null; email: string | null }>;
  currentAssigneeId?: string | null;
}

export function QuickAssignDialog({ findingId, users, currentAssigneeId }: QuickAssignDialogProps) {
  const t = useTranslations('finding');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>(currentAssigneeId || "");
  const [selectedRisk, setSelectedRisk] = useState<string>("Orta");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    if (!selectedUserId) {
      toast.error(t('quickAssign.selectUserError'));
      return;
    }

    startTransition(async () => {
      const result = await assignFinding(findingId, selectedUserId);

      if (result.success) {
        toast.success(t('quickAssign.assignSuccess'));
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="w-full md:w-auto">
          <UserPlus className="h-4 w-4 mr-2" />
          {t('quickAssign.assignResponsible')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('quickAssign.title')}</DialogTitle>
          <DialogDescription>
            {t('quickAssign.description')}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="assignee">{t('quickAssign.responsible')}</Label>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger>
                <SelectValue placeholder={t('quickAssign.selectUserPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name || user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="risk">{t('quickAssign.riskLevel')}</Label>
            <Select value={selectedRisk} onValueChange={setSelectedRisk}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Kritik">{t('quickAssign.riskCritical')}</SelectItem>
                <SelectItem value="Yüksek">{t('quickAssign.riskHigh')}</SelectItem>
                <SelectItem value="Orta">{t('quickAssign.riskMedium')}</SelectItem>
                <SelectItem value="Düşük">{t('quickAssign.riskLow')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {tCommon('cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {t('quickAssign.assign')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
