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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ListChecks } from "lucide-react";
import { toast } from "sonner";
import { createAction } from "@/action/action-actions";

interface QuickActionDialogProps {
  findingId: string;
  users: Array<{ id: string; name: string | null; email: string | null }>;
}

export function QuickActionDialog({ findingId, users }: QuickActionDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [details, setDetails] = useState("");
  const [assignedToId, setAssignedToId] = useState("");
  const [managerId, setManagerId] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    if (!details.trim()) {
      toast.error("Lütfen aksiyon detayını girin");
      return;
    }
    if (!assignedToId) {
      toast.error("Lütfen sorumlu seçin");
      return;
    }

    startTransition(async () => {
      const result = await createAction({
        findingId,
        details,
        assignedToId,
        ...(managerId && { managerId }),
      });

      if (result.success) {
        toast.success("Aksiyon oluşturuldu");
        setOpen(false);
        setDetails("");
        setAssignedToId("");
        setManagerId("");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="secondary" className="w-full md:w-auto">
          <ListChecks className="h-4 w-4 mr-2" />
          Aksiyon Aç
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Hızlı Aksiyon Ekle</DialogTitle>
          <DialogDescription>
            Basit aksiyon kaydı oluşturun
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="details">Aksiyon Detayı</Label>
            <Textarea
              id="details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Yapılacak aksiyon..."
              className="min-h-[100px]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="assignee">Sorumlu *</Label>
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
          </div>
          <div className="space-y-2">
            <Label htmlFor="manager">Onaylayacak Yönetici</Label>
            <Select value={managerId} onValueChange={setManagerId}>
              <SelectTrigger>
                <SelectValue placeholder="Yönetici seçin (opsiyonel)" />
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
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            İptal
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            Oluştur
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
