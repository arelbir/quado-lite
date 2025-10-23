"use client";

import { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { updateQuestion, deleteQuestion } from "@/action/question-actions";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Loader2, Plus, X, Trash2, CheckCircle2, BarChart3, FileText, Circle, CheckSquare } from "lucide-react";

const formSchema = z.object({
  questionText: z.string().min(10, "En az 10 karakter gerekli"),
  questionType: z.enum(["YesNo", "Scale", "Text", "SingleChoice", "Checklist"]),
  helpText: z.string().optional(),
  isMandatory: z.boolean().default(true),
  checklistOptions: z.array(z.string()).optional(),
}).refine(
  (data) => {
    if (data.questionType === "SingleChoice" || data.questionType === "Checklist") {
      return data.checklistOptions && data.checklistOptions.length >= 2;
    }
    return true;
  },
  {
    message: "En az 2 seçenek gerekli",
    path: ["checklistOptions"],
  }
);

type FormValues = z.infer<typeof formSchema>;

interface EditQuestionFormProps {
  bankId: string;
  question: any;
}

/**
 * Edit Question Form
 * Pattern: DRY - Create form'a benzer ama edit logic
 */
export function EditQuestionForm({ bankId, question }: EditQuestionFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [options, setOptions] = useState<string[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      questionText: question.questionText,
      questionType: question.questionType,
      helpText: question.helpText || "",
      isMandatory: question.isMandatory,
      checklistOptions: question.checklistOptions ? JSON.parse(question.checklistOptions) as string[] : [],
    },
  });

  // Initialize options from question
  useEffect(() => {
    if (question.checklistOptions) {
      const parsed = JSON.parse(question.checklistOptions) as string[];
      setOptions(parsed);
    }
  }, [question]);

  const questionType = form.watch("questionType");
  const needsOptions = questionType === "SingleChoice" || questionType === "Checklist";

  const addOption = () => {
    setOptions([...options, ""]);
  };

  const removeOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
    form.setValue("checklistOptions", newOptions.filter(o => o.trim()));
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
    form.setValue("checklistOptions", newOptions.filter(o => o.trim()));
  };

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      try {
        const result = await updateQuestion(
          question.id,
          values
        );
        
        if (result.success) {
          toast.success("Soru başarıyla güncellendi!");
          router.push(`/denetim/question-banks/${bankId}`);
          router.refresh();
        } else {
          toast.error(result.error);
        }
      } catch (error) {
        toast.error("Bir hata oluştu");
      }
    });
  }

  function handleDelete() {
    startTransition(async () => {
      try {
        const result = await deleteQuestion(question.id);
        
        if (result.success) {
          toast.success("Soru silindi!");
          router.push(`/denetim/question-banks/${bankId}`);
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
          name="questionType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Soru Tipi *</FormLabel>
              <Select 
                onValueChange={(value) => {
                  field.onChange(value);
                  if (value !== "SingleChoice" && value !== "Checklist") {
                    setOptions([""]);
                    form.setValue("checklistOptions", []);
                  }
                }} 
                defaultValue={field.value}
                disabled={isPending}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Soru tipi seçin" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="YesNo">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Evet/Hayır</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="Scale">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      <span>1-5 Ölçek</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="Text">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span>Metin</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="SingleChoice">
                    <div className="flex items-center gap-2">
                      <Circle className="h-4 w-4" />
                      <span>Tek Seçim</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="Checklist">
                    <div className="flex items-center gap-2">
                      <CheckSquare className="h-4 w-4" />
                      <span>Çoklu Seçim</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="questionText"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Soru Metni *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Soru metnini girin"
                  className="min-h-[100px]"
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
          name="helpText"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Yardımcı Metin</FormLabel>
              <FormControl>
                <Input
                  placeholder="Denetçiye ipucu (opsiyonel)"
                  {...field}
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {needsOptions && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <FormLabel>Seçenekler *</FormLabel>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addOption}
                disabled={isPending}
              >
                <Plus className="h-4 w-4 mr-1" />
                Seçenek Ekle
              </Button>
            </div>
            <div className="space-y-2">
              {options.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder={`Seçenek ${index + 1}`}
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    disabled={isPending}
                  />
                  {options.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeOption(index)}
                      disabled={isPending}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <FormField
          control={form.control}
          name="isMandatory"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isPending}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Zorunlu Soru</FormLabel>
                <FormDescription>
                  Denetçi bu soruyu cevaplamak zorunda
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Güncelle
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

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="destructive" disabled={isPending}>
                <Trash2 className="h-4 w-4 mr-2" />
                Sil
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Soruyu Sil</AlertDialogTitle>
                <AlertDialogDescription>
                  Bu soruyu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>İptal</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                  Sil
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </form>
    </Form>
  );
}
