"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { UserSelect } from "@/components/ui/user-select";
import { toast } from "sonner";
import { createAction } from "@/server/actions/action-actions";
import { useTranslations } from 'next-intl';
import { Loader2, CheckCircle2, Info, AlertTriangle } from "lucide-react";
import { useActionTranslations } from "@/lib/i18n/use-action-translations";

const createActionFormSchema = (t: any) => z.object({
  details: z.string().min(10, t.validation.detailsMinLength),
  assignedToId: z.string().min(1, t.validation.assignedToRequired),
  managerId: z.string().optional(),
  dueDate: z.string().optional(),
});

interface ActionFormProps {
  findingId: string;
  finding?: {
    id: string;
    details: string;
    status: string;
    riskType: string | null;
  };
  onSuccess?: () => void;
}

export function ActionForm({ findingId, finding, onSuccess }: ActionFormProps) {
  const router = useRouter();
  const t = useActionTranslations();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const actionFormSchema = createActionFormSchema(t);
  type ActionFormValues = z.infer<typeof actionFormSchema>;

  const form = useForm<ActionFormValues>({
    resolver: zodResolver(actionFormSchema),
    defaultValues: {
      details: "",
      assignedToId: "",
      managerId: "",
      dueDate: "",
    },
  });

  async function onSubmit(data: ActionFormValues) {
    try {
      setIsSubmitting(true);
      
      const result = await createAction({
        findingId,
        details: data.details,
        assignedToId: data.assignedToId,
        managerId: data.managerId || undefined,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      });

      if (result.success) {
        toast.success(t.toast.createSuccess);
        form.reset();
        if (onSuccess) {
          onSuccess();
        } else {
          router.push(`/denetim/findings/${findingId}`);
        }
        router.refresh();
      } else {
        toast.error(result.error || t.toast.createError);
      }
    } catch (error) {
      console.error("Error creating action:", error);
      toast.error(t.toast.createErrorGeneric);
    } finally {
      setIsSubmitting(false);
    }
  }

  const getRiskBadgeVariant = (riskType: string | null) => {
    switch (riskType) {
      case "Kritik": return "destructive";
      case "Yüksek": return "destructive";
      case "Orta": return "default";
      case "Düşük": return "secondary";
      default: return "outline";
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Finding Context Card */}
        {finding && (
          <Card className="border-muted">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="text-xs">
                  {t.findingContext}
                </Badge>
                {finding.riskType && (
                  <Badge variant={getRiskBadgeVariant(finding.riskType) as any} className="text-xs">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {finding.riskType}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground line-clamp-3">
                {finding.details}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Workflow Info Alert */}
        <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertTitle className="text-blue-900 dark:text-blue-100">
            {t.workflowInfo}
          </AlertTitle>
          <AlertDescription className="text-blue-700 dark:text-blue-200">
            {t.workflowDescription}
          </AlertDescription>
        </Alert>

        {/* Action Details */}
        <FormField
          control={form.control}
          name="details"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.detailsLabel} *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t.detailsPlaceholder}
                  className="min-h-[120px] resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                {t.detailsDescription}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Responsibility Assignment */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Assigned To (Responsible Person) */}
          <FormField
            control={form.control}
            name="assignedToId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t.assignedToLabel} *</FormLabel>
                <FormControl>
                  <UserSelect
                    value={field.value}
                    onChange={field.onChange}
                    placeholder={t.assignedToPlaceholder}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormDescription>
                  {t.assignedToDescription}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Manager (Optional) */}
          <FormField
            control={form.control}
            name="managerId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t.managerLabel}</FormLabel>
                <FormControl>
                  <UserSelect
                    value={field.value}
                    onChange={field.onChange}
                    placeholder={t.managerPlaceholder}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormDescription>
                  {t.managerDescription}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Due Date */}
        <FormField
          control={form.control}
          name="dueDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.dueDateLabel}</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  {...field}
                  disabled={isSubmitting}
                  min={new Date().toISOString().split('T')[0]}
                />
              </FormControl>
              <FormDescription>
                {t.dueDateDescription}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Buttons */}
        <div className="flex gap-3 justify-end pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            {t.cancelButton}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t.toast.loading}
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                {t.createButton}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
