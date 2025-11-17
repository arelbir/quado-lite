/**
 * COMPANY DIALOG
 * Create/Edit Company Dialog
 * 
 * Features:
 * - Create new company
 * - Edit existing company
 * - Full company information
 * - Form validation
 */

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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createCompany, updateCompany } from "@/features/organization/actions/organization-actions";
import { Loader2 } from "lucide-react";
import type { Company } from "@/lib/types";
import { useTranslations } from 'next-intl';

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  code: z.string().min(2, "Code must be at least 2 characters"),
  legalName: z.string().optional(),
  taxNumber: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  description: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface CompanyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company?: Company | null;
  onSuccess?: () => void;
}

export function CompanyDialog({
  open,
  onOpenChange,
  company,
  onSuccess,
}: CompanyDialogProps) {
  const t = useTranslations('organization');
  const tCommon = useTranslations('common');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEdit = !!company;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      code: "",
      legalName: "",
      taxNumber: "",
      country: "",
      city: "",
      address: "",
      phone: "",
      email: "",
      website: "",
      description: "",
    },
  });

  // Update form when company changes
  useEffect(() => {
    if (company) {
      form.reset({
        name: company.name,
        code: company.code,
        legalName: company.legalName || "",
        taxNumber: company.taxNumber || "",
        country: company.country || "",
        city: company.city || "",
        address: company.address || "",
        phone: company.phone || "",
        email: company.email || "",
        website: company.website || "",
        description: company.description || "",
      });
    } else {
      form.reset();
    }
  }, [company, form]);

  async function onSubmit(data: FormData) {
    setIsSubmitting(true);

    try {
      const result = isEdit
        ? await updateCompany(company!.id, data)
        : await createCompany(data);

      if (result.success) {
        toast.success(result.message || (isEdit ? t('companies.messages.updated') : t('companies.messages.created')));
        onOpenChange(false);
        form.reset();
        onSuccess?.();
      } else {
        toast.error(result.error || tCommon('messages.error'));
      }
    } catch (error) {
      toast.error(t('companies.messages.saveError'));
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t('companies.editCompany') : t('companies.createNew')}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? t('companies.description.update')
              : t('companies.description.create')}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('companies.fields.name')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('companies.placeholders.name')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('companies.fields.code')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('companies.placeholders.code')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="legalName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('companies.fields.legalName')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('companies.placeholders.legalName')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="taxNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('companies.fields.taxNumber')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('companies.placeholders.taxNumber')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('companies.fields.country')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('companies.placeholders.country')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('companies.fields.city')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('companies.placeholders.city')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('companies.fields.phone')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('companies.placeholders.phone')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('companies.fields.address')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('companies.placeholders.address')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('companies.fields.email')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('companies.placeholders.email')} type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('companies.fields.website')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('companies.placeholders.website')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('companies.fields.description')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('companies.placeholders.description')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                {isEdit ? tCommon('actions.update') : tCommon('actions.create')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
