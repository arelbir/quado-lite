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
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>(currentAssigneeId || "");
  const [selectedRisk, setSelectedRisk] = useState<string>("Orta");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    if (!selectedUserId) {
      toast.error("Lütfen bir kullanıcı seçin");
      return;
    }

    startTransition(async () => {
      const result = await assignFinding(findingId, selectedUserId);

      if (result.success) {
        toast.success("Bulgu atandı");
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
          Sorumlu Ata
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sorumlu Ata</DialogTitle>
          <DialogDescription>
            Bulguyu bir süreç sahibine atayın ve risk seviyesini belirleyin
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="assignee">Sorumlu</Label>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Kullanıcı seçin" />
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
            <Label htmlFor="risk">Risk Seviyesi</Label>
            <Select value={selectedRisk} onValueChange={setSelectedRisk}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Kritik">Kritik</SelectItem>
                <SelectItem value="Yüksek">Yüksek</SelectItem>
                <SelectItem value="Orta">Orta</SelectItem>
                <SelectItem value="Düşük">Düşük</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            İptal
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            Ata
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
