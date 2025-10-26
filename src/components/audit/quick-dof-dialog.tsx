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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileCheck } from "lucide-react";
import { toast } from "sonner";
import { createDof } from "@/server/actions/dof-actions";
import { useTranslations } from 'next-intl';

interface QuickDofDialogProps {
  findingId: string;
  users: Array<{ id: string; name: string | null; email: string | null }>;
}

export function QuickDofDialog({ findingId, users }: QuickDofDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [assignedToId, setAssignedToId] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    if (!assignedToId) {
      toast.error("Lütfen DÖF sorumlusu seçin");
      return;
    }

    startTransition(async () => {
      const result = await createDof({
        findingId,
        problemTitle: "Bulgu İçin DÖF",
        problemDetails: "Denetim bulgusuna bağlı DÖF kaydı",
        assignedToId,
        managerId: assignedToId, // Sorumlu aynı zamanda manager
      });

      if (result.success) {
        toast.success("DÖF oluşturuldu");
        setOpen(false);
        setAssignedToId("");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="w-full md:w-auto">
          <FileCheck className="h-4 w-4 mr-2" />
          DÖF Aç
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Hızlı DÖF Aç</DialogTitle>
          <DialogDescription>
            7 adımlı Düzeltici Önleyici Faaliyet başlatın
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="assignee">DÖF Sorumlusu *</Label>
            <Select value={assignedToId} onValueChange={setAssignedToId}>
              <SelectTrigger>
                <SelectValue placeholder="Sorumlu seçin" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name || user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Sorumlu tüm DÖF adımlarını tamamlayacak
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            İptal
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            DÖF Başlat
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
