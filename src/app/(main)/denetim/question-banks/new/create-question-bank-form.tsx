"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { createQuestionBank } from "@/server/actions/question-bank-actions";
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
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

/**
 * Validation Schema (SOLID: Single Responsibility)
 */
const formSchema = z.object({
  name: z.string().min(3, "En az 3 karakter gerekli"),
  description: z.string().optional(),
  category: z.enum(["Kalite", "Çevre", "İSG", "Bilgi Güvenliği", "Gıda Güvenliği", "Diğer"], {
    required_error: "Kategori seçiniz",
  }),
});

type FormValues = z.infer<typeof formSchema>;

/**
 * Question Bank Create Form
 * Pattern: Zod + React Hook Form + Server Action
 * 
 * SOLID:
 * - Single Responsibility: Sadece form logic
 * - Dependency Inversion: Backend action inject edilir
 */
export function CreateQuestionBankForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      try {
        const result = await createQuestionBank(values);
        
        if (result.success) {
          toast.success("Soru bankası başarıyla oluşturuldu!");
          router.push(`/denetim/question-banks`);
          router.refresh();
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
              <FormLabel>Soru Bankası Adı *</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Örn: ISO 9001 Soru Havuzu" 
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
                Soru bankasının hangi alan için olduğunu seçin
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
                  placeholder="Soru bankası hakkında kısa bir açıklama..."
                  className="min-h-[120px]"
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
