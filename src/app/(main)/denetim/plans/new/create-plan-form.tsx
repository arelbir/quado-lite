"use client";

import { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { createScheduledPlan, startAdhocAudit } from "@/action/audit-plan-actions";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
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
import { toast } from "sonner";
import { Loader2, Calendar, Zap, Repeat, Check, ChevronsUpDown, ArrowLeft } from "lucide-react";
import { TemplateSelector } from "./template-selector";
import { cn } from "@/lib/utils";
import Link from "next/link";

/**
 * Validation Schema (Conditional)
 */
const formSchema = z.object({
  type: z.enum(["scheduled", "adhoc"]),
  title: z.string().min(5, "En az 5 karakter gerekli"),
  description: z.string().optional(),
  templateId: z.string().min(1, "Şablon seçiniz"),
  scheduledDate: z.string().optional(),
  auditDate: z.string().optional(),
  recurrenceType: z.enum(["None", "Daily", "Weekly", "Monthly", "Quarterly", "Yearly"]).optional(),
  recurrenceInterval: z.number().min(1).max(365).optional(),
  maxOccurrences: z.number().min(1).max(100).optional(),
  auditorId: z.string().optional(),
}).refine(
  (data) => {
    if (data.type === "scheduled") {
      return !!data.scheduledDate;
    }
    return true;
  },
  {
    message: "Planlı denetim için tarih seçiniz",
    path: ["scheduledDate"],
  }
);

type FormValues = z.infer<typeof formSchema>;

interface CreatePlanFormProps {
  mode?: "create" | "edit";
  defaultType: "adhoc" | "scheduled";
  availableUsers: Array<{
    id: string;
    name: string | null;
    email: string | null;
  }>;
  initialData?: {
    id?: string;
    title?: string;
    description?: string | null;
    scheduledDate?: Date | null;
    auditorId?: string | null;
    recurrenceType?: string | null;
    recurrenceInterval?: number | null;
    maxOccurrences?: number | null;
  };
}

/**
 * Create/Edit Plan Form
 * Pattern: Conditional form based on plan type and mode
 * SOLID: Single component handles both create and edit modes with conditional logic
 * DRY: Reused for both create and edit operations
 */
export function CreatePlanForm({ 
  mode = "create", 
  defaultType, 
  availableUsers, 
  initialData 
}: CreatePlanFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  // Edit mode'da defaultType'ı initialData'ya göre belirle
  const [planType, setPlanType] = useState<"scheduled" | "adhoc">(
    mode === "edit" && initialData?.scheduledDate ? "scheduled" : defaultType
  );
  const [auditorOpen, setAuditorOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: mode === "edit" && initialData?.scheduledDate ? "scheduled" : defaultType,
      title: initialData?.title || "",
      description: initialData?.description || "",
      templateId: mode === "edit" ? "dummy" : "", // Edit mode'da gerek yok
      scheduledDate: initialData?.scheduledDate 
        ? new Date(initialData.scheduledDate).toISOString().split('T')[0]
        : "",
      auditDate: new Date().toISOString().split('T')[0],
      recurrenceType: (initialData?.recurrenceType as any) || "None",
      recurrenceInterval: initialData?.recurrenceInterval || 1,
      maxOccurrences: initialData?.maxOccurrences || 10,
      auditorId: initialData?.auditorId || "",
    },
  });

  // Update form when type changes
  useEffect(() => {
    form.setValue("type", planType);
  }, [planType, form]);

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      try {
        if (mode === "edit") {
          // Edit Mode - API call
          const response = await fetch(`/api/plans/${initialData?.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: values.title,
              description: values.description || null,
              scheduledDate: values.scheduledDate ? new Date(values.scheduledDate) : null,
              auditorId: values.auditorId || null,
              recurrenceType: values.recurrenceType,
              recurrenceInterval: values.recurrenceInterval,
              maxOccurrences: values.maxOccurrences,
            }),
          });

          if (!response.ok) throw new Error();

          toast.success("Plan güncellendi");
          router.push(`/denetim/plans`);
          router.refresh();
        } else if (values.type === "scheduled") {
          // Create Mode - Planlı Denetim
          const result = await createScheduledPlan({
            title: values.title,
            description: values.description,
            templateId: values.templateId,
            scheduledDate: new Date(values.scheduledDate!),
            auditorId: values.auditorId,
            recurrenceType: values.recurrenceType,
            recurrenceInterval: values.recurrenceInterval,
            maxOccurrences: values.maxOccurrences,
          });
          
          if (result.success) {
            toast.success("Planlı denetim başarıyla oluşturuldu!");
            router.push(`/denetim/plans`);
            router.refresh();
          } else {
            toast.error(result.error);
          }
        } else {
          // Plansız Denetim (Hemen başlat)
          const result = await startAdhocAudit({
            title: values.title,
            description: values.description,
            templateId: values.templateId,
            auditDate: values.auditDate ? new Date(values.auditDate) : undefined,
          });
          
          if (result.success) {
            toast.success("Denetim başarıyla başlatıldı!");
            router.push(`/denetim/audits/${result.data.auditId}`);
          } else {
            toast.error(result.error);
          }
        }
      } catch (error) {
        toast.error("Bir hata oluştu");
      }
    });
  }

  return (
    <div className="space-y-4">
      {mode === "edit" && (
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/denetim/plans">
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
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Denetim Başlığı *</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Örn: ISO 9001 Yıllık Denetim" 
                  {...field} 
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {mode === "create" && (
          <FormField
            control={form.control}
            name="templateId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Denetim Şablonu *</FormLabel>
                <FormControl>
                  <TemplateSelector
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isPending}
                  />
                </FormControl>
                <FormDescription>
                  Şablon seçtiğinizde, şablondaki sorular otomatik eklenecek
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {planType === "scheduled" && (
          <>
            <FormField
              control={form.control}
              name="scheduledDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Planlanan Tarih *</FormLabel>
                  <FormControl>
                    <Input 
                      type="date"
                      {...field} 
                      disabled={isPending}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </FormControl>
                  <FormDescription>
                    Denetim bu tarihte otomatik olarak oluşturulacak
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="auditorId"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Denetçi (Opsiyonel)</FormLabel>
                  <Popover open={auditorOpen} onOpenChange={setAuditorOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value
                            ? availableUsers.find((user) => user.id === field.value)?.name ||
                              availableUsers.find((user) => user.id === field.value)?.email ||
                              "Seçili kullanıcı"
                            : "Denetçi seçin"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
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
                                  form.setValue("auditorId", user.id);
                                  setAuditorOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    user.id === field.value
                                      ? "opacity-100"
                                      : "opacity-0"
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
                  <FormDescription>
                    Denetçi belirtilirse, oluşan denetimler ona atanır
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center gap-2">
                <Repeat className="h-5 w-5 text-muted-foreground" />
                <Label className="text-base font-semibold">Periyodik Tekrarlama</Label>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="recurrenceType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tekrarlama Periyodu</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isPending}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seçiniz" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="None">Tekrarlanmaz</SelectItem>
                          <SelectItem value="Daily">Günlük</SelectItem>
                          <SelectItem value="Weekly">Haftalık</SelectItem>
                          <SelectItem value="Monthly">Aylık</SelectItem>
                          <SelectItem value="Quarterly">3 Aylık</SelectItem>
                          <SelectItem value="Yearly">Yıllık</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.watch("recurrenceType") !== "None" && (
                  <FormField
                    control={form.control}
                    name="recurrenceInterval"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Aralık</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            min="1"
                            max="365"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                            disabled={isPending}
                            placeholder="1"
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Her {field.value || 1} {
                            form.watch("recurrenceType") === "Daily" ? "günde" :
                            form.watch("recurrenceType") === "Weekly" ? "haftada" :
                            form.watch("recurrenceType") === "Monthly" ? "ayda" :
                            form.watch("recurrenceType") === "Quarterly" ? "3 ayda" :
                            "yılda"
                          } bir
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              {form.watch("recurrenceType") !== "None" && (
                <>
                  <FormField
                    control={form.control}
                    name="maxOccurrences"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maksimum Oluşturulma Sayısı *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            min="1"
                            max="100"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                            disabled={isPending}
                            placeholder="10"
                          />
                        </FormControl>
                        <FormDescription>
                          En fazla {field.value || 10} kez otomatik denetim oluşturulacak
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="rounded-lg bg-muted p-3">
                    <p className="text-sm text-muted-foreground">
                      💡 Bu plan periyodik olarak otomatik denetim oluşturacaktır. 
                      Toplam {form.watch("maxOccurrences") || 10} kez oluşturulduktan sonra durur.
                    </p>
                  </div>
                </>
              )}
            </div>
          </>
        )}

        {planType === "adhoc" && (
          <FormField
            control={form.control}
            name="auditDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Denetim Tarihi</FormLabel>
                <FormControl>
                  <Input 
                    type="date"
                    {...field} 
                    disabled={isPending}
                  />
                </FormControl>
                <FormDescription>
                  Denetim kaydındaki tarih (varsayılan: bugün)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Açıklama</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Denetim hakkında notlar..."
                  className="min-h-[100px]"
                  {...field}
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center gap-4">
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === "edit" 
              ? "Kaydet" 
              : planType === "scheduled" 
                ? "Planı Oluştur" 
                : "Denetimi Başlat"
            }
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.back()}
            disabled={isPending}
          >
            İptal
          </Button>
        </div>
      </form>
    </Form>
    </div>
  );
}
