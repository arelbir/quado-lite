/**
 * BRANCH DIALOG
 * Create/Edit Branch Dialog
 * 
 * Features:
 * - Create new branch
 * - Edit existing branch
 * - Company selection
 * - Type selection
 * - Manager assignment
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
import { toast } from "sonner";
import { createBranch, updateBranch } from "@/features/organization/actions/organization-actions";
import { Loader2 } from "lucide-react";
import type { Branch, Company } from "@/lib/types";
import { useTranslations } from 'next-intl';

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  code: z.string().min(2, "Code must be at least 2 characters"),
  companyId: z.string().min(1, "Company is required"),
  type: z.string().min(1, "Type is required"),
  country: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  description: z.string().optional(),
  managerId: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface BranchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branch?: Partial<Branch> | null;
  companies: Pick<Company, 'id' | 'name' | 'code'>[];
  onSuccess?: () => void;
}

export function BranchDialog({
  open,
  onOpenChange,
  branch,
  companies,
  onSuccess,
}: BranchDialogProps) {
  const t = useTranslations('organization');
  const tCommon = useTranslations('common');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEdit = !!branch;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      code: "",
      companyId: "",
      type: "",
      country: "",
      city: "",
      address: "",
      phone: "",
      email: "",
      description: "",
      managerId: "",
    },
  });

  // Update form when branch changes
  useEffect(() => {
    if (branch) {
      form.reset({
        name: branch.name,
        code: branch.code,
        companyId: branch.companyId,
        type: branch.type,
        country: branch.country || "",
        city: branch.city || "",
        address: branch.address || "",
        phone: branch.phone || "",
        email: branch.email || "",
        description: branch.description || "",
        managerId: branch.managerId || "",
      });
    } else {
      form.reset();
    }
  }, [branch, form]);

  async function onSubmit(data: FormData) {
    setIsSubmitting(true);

    try {
      if (isEdit && !branch?.id) {
        toast.error(t('branches.messages.idRequired'));
        return;
      }

      const result = isEdit
        ? await updateBranch(branch.id!, data)
        : await createBranch(data);

      if (result.success) {
        toast.success(result.message || (isEdit ? t('branches.messages.updated') : t('branches.messages.created')));
        onOpenChange(false);
        form.reset();
        onSuccess?.();
      } else {
        toast.error(result.error || tCommon('messages.error'));
      }
    } catch (error) {
      toast.error(t('branches.messages.saveError'));
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
            {isEdit ? t('branches.editBranch') : t('branches.createNew')}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? t('branches.description.update')
              : t('branches.description.create')}
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
                    <FormLabel>{t('branches.fields.name')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('branches.placeholders.name')} {...field} />
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
                    <FormLabel>{t('branches.fields.code')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('branches.placeholders.code')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="companyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('branches.fields.company')}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('branches.placeholders.company')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {companies.map((company) => (
                          <SelectItem key={company.id} value={company.id}>
                            {company.name} ({company.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('branches.fields.type')}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('branches.placeholders.type')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Headquarters">{t('branches.types.Headquarters')}</SelectItem>
                        <SelectItem value="Regional Office">{t('branches.types.Regional Office')}</SelectItem>
                        <SelectItem value="Branch Office">{t('branches.types.Branch Office')}</SelectItem>
                        <SelectItem value="Sales Office">{t('branches.types.Sales Office')}</SelectItem>
                        <SelectItem value="Service Center">{t('branches.types.Service Center')}</SelectItem>
                        <SelectItem value="Factory">{t('branches.types.Factory')}</SelectItem>
                        <SelectItem value="Warehouse">{t('branches.types.Warehouse')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('branches.fields.country')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('branches.placeholders.country')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('branches.fields.city')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('branches.placeholders.city')} {...field} />
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
                  <FormLabel>{t('branches.fields.address')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('branches.placeholders.address')}
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
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('branches.fields.phone')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('branches.placeholders.phone')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('branches.fields.email')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('branches.placeholders.email')} type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="managerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('branches.fields.manager')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('branches.placeholders.manager')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('branches.fields.description')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('branches.placeholders.description')}
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
