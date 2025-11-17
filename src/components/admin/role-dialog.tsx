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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { createRole, updateRole } from "@/server/actions/role-actions";
import { useTranslations } from 'next-intl';
import type { roles, permissions } from "@/core/database/schema/role-system";

type Role = typeof roles.$inferSelect;
type Permission = typeof permissions.$inferSelect;

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  permissions: z.array(z.string()).min(1, "Select at least one permission"),
});

// CRUD Actions
const CRUD_ACTIONS = ['Create', 'Read', 'Update', 'Delete'] as const;

type FormData = z.infer<typeof formSchema>;

interface RoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role?: Role | null;
  rolePermissions?: Array<{ id: string }>;
  permissions: Permission[];
  onSuccess?: () => void;
}

export function RoleDialog({
  open,
  onOpenChange,
  role,
  rolePermissions,
  permissions,
  onSuccess,
}: RoleDialogProps) {
  const t = useTranslations('roles');
  const tCommon = useTranslations('common');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!role;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      permissions: [],
    },
  });

  // Update form when role changes
  useEffect(() => {
    if (role) {
      form.reset({
        name: role.name,
        description: role.description || "",
        permissions: rolePermissions?.map(p => p.id) || [],
      });
    } else {
      form.reset({
        name: "",
        description: "",
        permissions: [],
      });
    }
  }, [role, rolePermissions, form]);

  async function onSubmit(data: FormData) {
    setIsSubmitting(true);

    try {
      let result;
      
      if (isEditMode && role) {
        result = await updateRole(role.id, {
          name: data.name,
          description: data.description,
          permissions: data.permissions,
        });
      } else {
        result = await createRole({
          name: data.name,
          description: data.description,
          permissions: data.permissions,
        });
      }

      if (result.success) {
        toast.success(result.message || (isEditMode ? t('messages.updated') : t('messages.created')));
        onOpenChange(false);
        form.reset();
        onSuccess?.();
      } else {
        toast.error(result.error || tCommon('messages.error'));
      }
    } catch (error) {
      toast.error(isEditMode ? t('messages.updateError') : t('messages.createError'));
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Group permissions by resource
  const groupedByResource = permissions.reduce((acc, permission) => {
    const resource = (permission as any).resource || "Other";
    if (!acc[resource]) {
      acc[resource] = [];
    }
    acc[resource].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  const resources = Object.keys(groupedByResource).sort();

  // Helper functions for bulk selection
  const selectAllCRUD = (resource: string) => {
    const currentPerms = form.getValues('permissions');
    const newPerms = [...currentPerms];
    CRUD_ACTIONS.forEach(action => {
      const perm = permissions.find(
        p => (p as any).resource === resource && (p as any).action?.toLowerCase() === action.toLowerCase()
      );
      if (perm && !newPerms.includes(perm.id)) {
        newPerms.push(perm.id);
      }
    });
    form.setValue('permissions', newPerms);
  };

  const clearAllCRUD = (resource: string) => {
    const currentPerms = form.getValues('permissions');
    const resourcePermIds = permissions
      .filter(p => (p as any).resource === resource && CRUD_ACTIONS.some(a => a.toLowerCase() === (p as any).action?.toLowerCase()))
      .map(p => p.id);
    form.setValue('permissions', currentPerms.filter(id => !resourcePermIds.includes(id)));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {isEditMode ? t('editRole') : t('createNew')}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? t('description.update')
              : t('description.create')}
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
                  <FormLabel>{t('fields.name')}</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Auditor, Manager" {...field} />
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
                  <FormLabel>{t('fields.description')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the role responsibilities..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* CRUD Permissions Matrix */}
            <FormField
              control={form.control}
              name="permissions"
              render={({ field }) => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">CRUD Permissions</FormLabel>
                    <FormDescription>
                      Select permissions by resource and operation
                    </FormDescription>
                  </div>
                  <div className="border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <th className="text-left p-3 font-medium text-sm">Module</th>
                            {CRUD_ACTIONS.map((action) => (
                              <th key={action} className="text-center p-3 font-medium text-sm min-w-[80px]">
                                {action}
                              </th>
                            ))}
                            <th className="text-center p-3 font-medium text-sm">Quick</th>
                          </tr>
                        </thead>
                        <tbody>
                          {resources.map((resource, idx) => (
                            <tr key={resource} className={idx % 2 === 0 ? "bg-accent/20" : ""}>
                              <td className="p-3 font-medium">{resource}</td>
                              {CRUD_ACTIONS.map((action) => {
                                const perm = permissions.find(
                                  p => (p as any).resource === resource && (p as any).action?.toLowerCase() === action.toLowerCase()
                                );
                                return (
                                  <td key={action} className="text-center p-3">
                                    {perm ? (
                                      <Checkbox
                                        checked={field.value?.includes(perm.id)}
                                        onCheckedChange={(checked) => {
                                          const newValue = checked
                                            ? [...field.value, perm.id]
                                            : field.value?.filter((id) => id !== perm.id);
                                          field.onChange(newValue);
                                        }}
                                        className="mx-auto"
                                      />
                                    ) : (
                                      <span className="text-gray-300">-</span>
                                    )}
                                  </td>
                                );
                              })}
                              <td className="text-center p-3">
                                <div className="flex items-center justify-center gap-1">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => selectAllCRUD(resource)}
                                    className="h-7 px-2 text-xs"
                                  >
                                    All
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => clearAllCRUD(resource)}
                                    className="h-7 px-2 text-xs"
                                  >
                                    None
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  {/* Special Permissions (Non-CRUD) */}
                  {permissions.some(p => !(p as any).action || !CRUD_ACTIONS.some(a => a.toLowerCase() === (p as any).action?.toLowerCase())) && (
                    <div className="mt-4">
                      <h4 className="font-medium text-sm mb-3">Special Permissions</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {permissions
                          .filter(p => !(p as any).action || !CRUD_ACTIONS.some(a => a.toLowerCase() === (p as any).action?.toLowerCase()))
                          .map((permission) => (
                            <div key={permission.id} className="flex items-center space-x-2">
                              <Checkbox
                                checked={field.value?.includes(permission.id)}
                                onCheckedChange={(checked) => {
                                  const newValue = checked
                                    ? [...field.value, permission.id]
                                    : field.value?.filter((id) => id !== permission.id);
                                  field.onChange(newValue);
                                }}
                              />
                              <label className="text-sm cursor-pointer">
                                {permission.name}
                              </label>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
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
                {isEditMode ? tCommon('actions.update') : tCommon('actions.create')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
