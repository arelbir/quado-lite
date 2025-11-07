"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { createQuestion } from "@/server/actions/question-actions";
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
import { toast } from "sonner";
import { Loader2, Plus, X, CheckCircle2, BarChart3, FileText, Circle, CheckSquare } from "lucide-react";
import { useTranslations } from 'next-intl';

type FormValues = {
  questionText: string;
  questionType: "YesNo" | "Scale" | "Text" | "SingleChoice" | "Checklist";
  helpText?: string;
  isMandatory: boolean;
  checklistOptions?: string[];
};

interface CreateQuestionFormProps {
  bankId: string;
}

export function CreateQuestionForm({ bankId }: CreateQuestionFormProps) {
  const t = useTranslations('questions');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [options, setOptions] = useState<string[]>([""]);

  const formSchema = z.object({
    questionText: z.string().min(10, t('validation.min10Chars')),
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
      message: t('validation.min2Options'),
      path: ["checklistOptions"],
    }
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      questionText: "",
      questionType: "YesNo",
      helpText: "",
      isMandatory: true,
      checklistOptions: [],
    },
  });

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
        const result = await createQuestion({
          bankId,
          ...values,
        });
        
        if (result.success) {
          toast.success(t('messages.questionCreated'));
          router.push(`/denetim/question-banks/${bankId}`);
          router.refresh();
        } else {
          toast.error(result.error);
        }
      } catch (error) {
        toast.error(tCommon('status.error'));
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
              <FormLabel>{t('fields.questionType')} *</FormLabel>
              <Select 
                onValueChange={(value) => {
                  field.onChange(value);
                  // Reset options when type changes
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
                    <SelectValue placeholder={t('placeholders.selectType')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="YesNo">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>{t('types.yesNo')}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="Scale">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      <span>{t('types.scale')}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="Text">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span>{t('types.text')}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="SingleChoice">
                    <div className="flex items-center gap-2">
                      <Circle className="h-4 w-4" />
                      <span>{t('types.singleChoice')}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="Checklist">
                    <div className="flex items-center gap-2">
                      <CheckSquare className="h-4 w-4" />
                      <span>{t('types.checklist')}</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                {t('messages.questionTypeDescription')}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="questionText"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('fields.questionText')} *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t('placeholders.enterQuestion')}
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
              <FormLabel>{t('fields.helpText')}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t('placeholders.helpTextOptional')}
                  {...field}
                  disabled={isPending}
                />
              </FormControl>
              <FormDescription>
                {t('messages.helpTextDescription')}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {needsOptions && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <FormLabel>{t('fields.options')} *</FormLabel>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addOption}
                disabled={isPending}
              >
                <Plus className="h-4 w-4 mr-1" />
                {t('actions.addOption')}
              </Button>
            </div>
            <div className="space-y-2">
              {options.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder={`${t('fields.options')} ${index + 1}`}
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
            <FormDescription>
              {t('messages.min2OptionsRequired')}
            </FormDescription>
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
                <FormLabel>
                  {t('fields.isRequired')}
                </FormLabel>
                <FormDescription>
                  {t('messages.requiredQuestion')}
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <div className="flex items-center gap-4">
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {tCommon('actions.add')}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.back()}
            disabled={isPending}
          >
            {tCommon('actions.cancel')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
