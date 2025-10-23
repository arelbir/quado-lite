"use client";

import { useState, useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { createAuditTemplate } from "@/action/audit-template-actions";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, HelpCircle } from "lucide-react";

/**
 * Validation Schema
 */
const formSchema = z.object({
  name: z.string().min(3, "En az 3 karakter gerekli"),
  description: z.string().optional(),
  category: z.enum(["Kalite", "Çevre", "İSG", "Bilgi Güvenliği", "Gıda Güvenliği", "Diğer"], {
    required_error: "Kategori seçiniz",
  }),
  questionBankIds: z.array(z.string()).optional(),
  estimatedDurationMinutes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

/**
 * Audit Template Create Form
 * Pattern: DRY - Question Bank ile aynı yapı
 */
interface QuestionBank {
  id: string;
  name: string;
  category: string;
}

export function CreateTemplateForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [questionBanks, setQuestionBanks] = useState<QuestionBank[]>([]);
  const [loading, setLoading] = useState(true);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      questionBankIds: [],
    },
  });

  // Load question banks
  useEffect(() => {
    fetch("/api/question-banks")
      .then((res) => res.json())
      .then((data) => {
        setQuestionBanks(data as QuestionBank[]);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error loading question banks:", error);
        setLoading(false);
      });
  }, []);

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      try {
        const result = await createAuditTemplate(values);
        
        if (result.success) {
          toast.success("Şablon başarıyla oluşturuldu!");
          // Şablon oluşturulduktan sonra soru ekleme sayfasına yönlendir
          router.push(`/denetim/templates/${result.data.id}`);
        } else {
          toast.error(result.error);
        }
      } catch (error) {
        toast.error("Bir hata oluştu");
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Şablon Adı *</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Örn: ISO 9001 Standart Denetim Şablonu" 
                  {...field} 
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kategori *</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
                disabled={isPending}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Kategori seçin" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Kalite">Kalite</SelectItem>
                  <SelectItem value="Çevre">Çevre</SelectItem>
                  <SelectItem value="İSG">İSG (İş Sağlığı ve Güvenliği)</SelectItem>
                  <SelectItem value="Bilgi Güvenliği">Bilgi Güvenliği</SelectItem>
                  <SelectItem value="Gıda Güvenliği">Gıda Güvenliği</SelectItem>
                  <SelectItem value="Diğer">Diğer</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Şablonun hangi alan için olduğunu seçin
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Açıklama</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Şablon hakkında kısa bir açıklama..."
                  className="min-h-[120px]"
                  {...field}
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="estimatedDurationMinutes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tahmini Süre (Dakika)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Örn: 60"
                  {...field}
                  disabled={isPending}
                  min="0"
                />
              </FormControl>
              <FormDescription>
                Bu şablonla yapılacak denetimin tahmini süresi
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Question Banks Selection */}
        <FormField
          control={form.control}
          name="questionBankIds"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel className="text-base">Soru Havuzları</FormLabel>
                <FormDescription>
                  Şablonda kullanılacak soru havuzlarını seçin (opsiyonel)
                </FormDescription>
              </div>
              {loading ? (
                <div className="text-sm text-muted-foreground">Yükleniyor...</div>
              ) : questionBanks.length === 0 ? (
                <div className="rounded-md border border-muted bg-muted/20 p-3 text-sm text-muted-foreground flex items-center gap-2">
                  <HelpCircle className="h-4 w-4" />
                  <span>Henüz soru havuzu yok. Önce soru havuzu oluşturun.</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {questionBanks.map((bank) => (
                    <FormField
                      key={bank.id}
                      control={form.control}
                      name="questionBankIds"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={bank.id}
                            className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(bank.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...(field.value || []), bank.id])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== bank.id
                                        )
                                      );
                                }}
                                disabled={isPending}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none flex-1">
                              <Label className="font-medium">{bank.name}</Label>
                              <p className="text-sm text-muted-foreground">
                                {bank.category}
                              </p>
                            </div>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center gap-4">
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Oluştur
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
  );
}
