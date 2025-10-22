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
import { createDofActivity } from "@/action/dof-actions";

interface DofActivityFormProps {
  dofId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function DofActivityForm({ dofId, onSuccess, onCancel }: DofActivityFormProps) {
  const [isPending, startTransition] = useTransition();
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"Düzeltici" | "Önleyici">("Düzeltici");
  const [responsibleId, setResponsibleId] = useState("");
  const [dueDate, setDueDate] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim()) {
      toast.error("Faaliyet açıklaması gerekli");
      return;
    }

    startTransition(async () => {
      const result = await createDofActivity({
        dofId,
        description,
        type,
        responsibleId: responsibleId || null,
        dueDate: dueDate ? new Date(dueDate) : null,
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
        <Label htmlFor="description">Faaliyet Açıklaması *</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Yapılacak faaliyeti detaylı açıklayın..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type">Faaliyet Türü *</Label>
          <Select value={type} onValueChange={(v: any) => setType(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Düzeltici">Düzeltici</SelectItem>
              <SelectItem value="Önleyici">Önleyici</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="due-date">Termin Tarihi</Label>
          <Input
            id="due-date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
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
