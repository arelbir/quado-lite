"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { createDofAction } from "@/server/actions/action-actions";
import { UserSelector } from "@/components/user-selector";

interface User {
  id: string;
  name: string | null;
  email: string | null;
}

interface DofActivityFormProps {
  dofId: string;
  users: User[];
  onSuccess: () => void;
  onCancel: () => void;
}

export function DofActivityForm({ dofId, users, onSuccess, onCancel }: DofActivityFormProps) {
  const [isPending, startTransition] = useTransition();
  const [details, setDetails] = useState("");
  const [type, setType] = useState<"Corrective" | "Preventive">("Corrective");
  const [assignedToId, setAssignedToId] = useState("");
  const [managerId, setManagerId] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!details.trim()) {
      toast.error("Faaliyet açıklaması gerekli");
      return;
    }

    if (!assignedToId) {
      toast.error("Sorumlu seçimi gerekli");
      return;
    }

    startTransition(async () => {
      const result = await createDofAction({
        dofId,
        type,
        details,
        assignedToId,
        managerId: managerId || null,
      });

      if (result.success) {
        toast.success("Faaliyet eklendi");
        onSuccess();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-background">
      <div className="space-y-2">
        <Label htmlFor="details">Aksiyon Açıklaması *</Label>
        <Textarea
          id="details"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="Yapılacak aksiyonu detaylı açıklayın..."
          rows={3}
        />
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="type">Aksiyon Türü *</Label>
          <Select value={type} onValueChange={(v: any) => setType(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Corrective">Düzeltici (Corrective)</SelectItem>
              <SelectItem value="Preventive">Önleyici (Preventive)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="assigned">Sorumlu *</Label>
          <UserSelector
            users={users}
            value={assignedToId}
            onValueChange={setAssignedToId}
            placeholder="Sorumlu kullanıcı seçin..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="manager">Yönetici (Opsiyonel)</Label>
          <UserSelector
            users={users}
            value={managerId}
            onValueChange={setManagerId}
            placeholder="Yönetici seçin..."
          />
          <p className="text-xs text-muted-foreground">Onay verecek yönetici</p>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          İptal
        </Button>
        <Button type="submit" disabled={isPending}>
          Ekle
        </Button>
      </div>
    </form>
  );
}
