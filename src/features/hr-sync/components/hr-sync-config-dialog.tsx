"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { createHRSyncConfig, updateHRSyncConfig } from "@/features/hr-sync/actions/hr-sync-actions";
import { useTranslations } from 'next-intl';

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"), // Will be handled by form validation
  description: z.string().optional(),
  sourceType: z.enum(["LDAP", "CSV", "REST_API", "WEBHOOK", "MANUAL"]),
  syncMode: z.enum(["Full", "Delta", "Selective"]).default("Full"),
  autoSync: z.boolean().default(false),
  syncSchedule: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface HRSyncConfig {
  id: string;
  name: string;
  description: string | null;
  sourceType: string;
  syncMode: string;
  autoSync: boolean;
  syncSchedule: string | null;
}

interface HRSyncConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config?: HRSyncConfig | null;
  onSuccess?: () => void;
}

export function HRSyncConfigDialog({
  open,
  onOpenChange,
  config,
  onSuccess,
}: HRSyncConfigDialogProps) {
  const t = useTranslations('hrSync');
  const tCommon = useTranslations('common');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!config;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      sourceType: "LDAP",
      syncMode: "Full",
      autoSync: false,
      syncSchedule: "",
    },
  });

  // Update form when config changes
  useEffect(() => {
    if (config) {
      form.reset({
        name: config.name,
        description: config.description || "",
        sourceType: config.sourceType as any,
        syncMode: config.syncMode as any,
        autoSync: config.autoSync,
        syncSchedule: config.syncSchedule || "",
      });
    } else {
      form.reset({
        name: "",
        description: "",
        sourceType: "LDAP",
        syncMode: "Full",
        autoSync: false,
        syncSchedule: "",
      });
    }
  }, [config, form]);

  async function onSubmit(data: FormData) {
    setIsSubmitting(true);

    try {
      let result;

      const payload = {
        name: data.name,
        description: data.description,
        sourceType: data.sourceType,
        config: {}, // Empty for now, can be extended
        fieldMapping: {}, // Empty for now, can be extended
        syncMode: data.syncMode,
        autoSync: data.autoSync,
        syncSchedule: data.syncSchedule,
      };

      if (isEditMode && config) {
        result = await updateHRSyncConfig(config.id, payload);
      } else {
        result = await createHRSyncConfig(payload);
      }

      if (result.success) {
        toast.success(
          result.message ||
            t('config.messages.' + (isEditMode ? 'updated' : 'created'))
        );
        onOpenChange(false);
        form.reset();
        onSuccess?.();
      } else {
        toast.error(result.error || tCommon('messages.error'));
      }
    } catch (error) {
      toast.error(t('config.messages.' + (isEditMode ? 'updateError' : 'createError')));
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? t('config.editConfig') : t('config.createNew')}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? t('config.description.update')
              : t('config.description.create')}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('config.fields.name')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('config.placeholders.name')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('config.fields.description')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('config.placeholders.description')}
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              {/* Source Type */}
              <FormField
                control={form.control}
                name="sourceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('config.fields.sourceType')}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('config.placeholders.sourceType')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="LDAP">🔐 LDAP</SelectItem>
                        <SelectItem value="CSV">📄 CSV</SelectItem>
                        <SelectItem value="REST_API">🌐 REST API</SelectItem>
                        <SelectItem value="WEBHOOK">🔔 Webhook</SelectItem>
                        <SelectItem value="MANUAL">👤 Manual</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Sync Mode */}
              <FormField
                control={form.control}
                name="syncMode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('config.fields.syncMode')}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('config.placeholders.syncMode')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Full">Full Sync</SelectItem>
                        <SelectItem value="Delta">Delta Sync</SelectItem>
                        <SelectItem value="Selective">Selective Sync</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Auto Sync */}
            <FormField
              control={form.control}
              name="autoSync"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border p-3">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Auto Sync</FormLabel>
                    <FormDescription>
                      Automatically sync on schedule
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {/* Sync Schedule (if auto sync enabled) */}
            {form.watch("autoSync") && (
              <FormField
                control={form.control}
                name="syncSchedule"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sync Schedule (Cron)</FormLabel>
                    <FormControl>
                      <Input placeholder="0 0 * * * (Daily at midnight)" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter cron expression for sync schedule
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                {tCommon('actions.cancel')}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditMode ? t('config.updateConfig') : t('config.createConfig')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
