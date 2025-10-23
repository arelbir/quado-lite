"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ArrowLeft, Save, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { toast } from "sonner";

interface EditPlanFormProps {
  plan: {
    id: string;
    title: string;
    description: string | null;
    scheduleType: string;
    scheduledDate: Date | null;
    auditorId: string | null;
    recurrenceType: string | null;
    recurrenceInterval: number | null;
    maxOccurrences: number | null;
  };
  availableUsers: Array<{
    id: string;
    name: string | null;
    email: string | null;
  }>;
}

export function EditPlanForm({ plan, availableUsers }: EditPlanFormProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [auditorOpen, setAuditorOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: plan.title,
    description: plan.description || "",
    scheduledDate: plan.scheduledDate 
      ? new Date(plan.scheduledDate).toISOString().split('T')[0] 
      : "",
    auditorId: plan.auditorId || "",
    recurrenceType: plan.recurrenceType || "None",
    recurrenceInterval: plan.recurrenceInterval || 1,
    maxOccurrences: plan.maxOccurrences || 10,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);

    try {
      const response = await fetch(`/api/plans/${plan.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || null,
          scheduledDate: formData.scheduledDate ? new Date(formData.scheduledDate) : null,
          auditorId: formData.auditorId || null,
          recurrenceType: formData.recurrenceType,
          recurrenceInterval: formData.recurrenceInterval,
          maxOccurrences: formData.maxOccurrences,
        }),
      });

      if (!response.ok) throw new Error();

      toast.success("Plan güncellendi");
      router.push(`/denetim/plans`);
      router.refresh();
    } catch (error) {
      toast.error("Güncellenirken hata oluştu");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/denetim/plans`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Planı Düzenle</h1>
          <p className="text-sm text-muted-foreground">
            Plan bilgilerini güncelleyin
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Plan Bilgileri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="title">Plan Başlığı *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Açıklama</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                disabled={isPending}
              />
            </div>

            {plan.scheduleType === "Scheduled" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="scheduledDate">Planlanan Tarih *</Label>
                  <Input
                    id="scheduledDate"
                    type="date"
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                    disabled={isPending}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Denetçi (Opsiyonel)</Label>
                  <Popover open={auditorOpen} onOpenChange={setAuditorOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className="w-full justify-between"
                        disabled={isPending}
                      >
                        {formData.auditorId
                          ? availableUsers.find((user) => user.id === formData.auditorId)?.name ||
                            availableUsers.find((user) => user.id === formData.auditorId)?.email ||
                            "Seçili kullanıcı"
                          : "Denetçi seçin"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Kullanıcı ara..." />
                        <CommandList>
                          <CommandEmpty>Kullanıcı bulunamadı.</CommandEmpty>
                          <CommandGroup>
                            {availableUsers.map((user) => (
                              <CommandItem
                                key={user.id}
                                value={`${user.name || ""} ${user.email || ""}`}
                                onSelect={() => {
                                  setFormData(prev => ({ ...prev, auditorId: user.id }));
                                  setAuditorOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    formData.auditorId === user.id ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {user.name || user.email}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Tekrarlama Periyodu</Label>
                  <Select
                    value={formData.recurrenceType}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, recurrenceType: value }))}
                    disabled={isPending}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="None">Tekrarlanmaz</SelectItem>
                      <SelectItem value="Daily">Günlük</SelectItem>
                      <SelectItem value="Weekly">Haftalık</SelectItem>
                      <SelectItem value="Monthly">Aylık</SelectItem>
                      <SelectItem value="Quarterly">3 Aylık</SelectItem>
                      <SelectItem value="Yearly">Yıllık</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.recurrenceType !== "None" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="recurrenceInterval">Aralık</Label>
                      <Input
                        id="recurrenceInterval"
                        type="number"
                        min="1"
                        max="365"
                        value={formData.recurrenceInterval}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          recurrenceInterval: parseInt(e.target.value) 
                        }))}
                        disabled={isPending}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maxOccurrences">Maksimum Oluşturulma *</Label>
                      <Input
                        id="maxOccurrences"
                        type="number"
                        min="1"
                        max="100"
                        value={formData.maxOccurrences}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          maxOccurrences: parseInt(e.target.value) 
                        }))}
                        disabled={isPending}
                      />
                    </div>
                  </>
                )}
              </>
            )}

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={isPending}>
                <Save className="h-4 w-4 mr-2" />
                {isPending ? "Kaydediliyor..." : "Kaydet"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href={`/denetim/plans`}>
                  İptal
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
