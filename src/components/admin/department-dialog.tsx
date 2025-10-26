/**
 * DEPARTMENT DIALOG
 * Create/Edit Department Dialog
 * 
 * Features:
 * - Create new department
 * - Edit existing department
 * - Parent department selection
 * - Manager assignment
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createDepartment, updateDepartment } from "@/server/actions/department-actions";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  code: z.string().min(2, "Code must be at least 2 characters"),
  parentDepartmentId: z.string().optional(),
  managerId: z.string().optional(),
  branchId: z.string().optional(),
  description: z.string().optional(),
  costCenter: z.string().optional(),
  isActive: z.boolean().default(true),
});

type FormData = z.infer<typeof formSchema>;

interface Department {
  id: string;
  name: string;
  code: string;
  branchId?: string | null;
  parentDepartmentId: string | null;
  managerId: string | null;
  description?: string | null;
  costCenter?: string | null;
  isActive?: boolean;
}

interface DepartmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  department?: Department | null;
  parentId?: string;
  departments: Department[];
  branches: any[];
  users: any[];
  onSuccess?: () => void;
}

export function DepartmentDialog({
  open,
  onOpenChange,
  department,
  parentId,
  departments,
  branches,
  users,
  onSuccess,
}: DepartmentDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEdit = !!department;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      code: "",
      branchId: undefined,
      parentDepartmentId: parentId || undefined,
      managerId: "none",
      description: "",
      costCenter: "",
      isActive: true,
    },
  });

  // Update form when department changes
  useEffect(() => {
    if (department) {
      form.reset({
        name: department.name,
        code: department.code,
        branchId: department.branchId || undefined,
        parentDepartmentId: department.parentDepartmentId || undefined,
        managerId: department.managerId || "none",
        description: department.description || "",
        costCenter: department.costCenter || "",
        isActive: department.isActive ?? true,
      });
    } else {
      form.reset({
        name: "",
        code: "",
        branchId: undefined,
        parentDepartmentId: parentId,
        managerId: "none",
        description: "",
        costCenter: "",
        isActive: true,
      });
    }
  }, [department, parentId, form]);

  async function onSubmit(data: FormData) {
    setIsSubmitting(true);

    try {
      // Handle "none" values for optional fields
      const submitData = {
        name: data.name,
        code: data.code,
        branchId: data.branchId || null,
        parentDepartmentId: data.parentDepartmentId || null,
        managerId: data.managerId === "none" ? null : data.managerId || null,
        isActive: data.isActive ?? true,
      };

      const result = isEdit
        ? await updateDepartment(department!.id, submitData)
        : await createDepartment(submitData);

      if (result.success) {
        toast.success(isEdit ? "Department updated successfully" : "Department created successfully");
        onOpenChange(false);
        form.reset();
        onSuccess?.();
      } else {
        toast.error(result.error || "An error occurred");
      }
    } catch (error) {
      toast.error("Failed to save department");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Department" : "Create Department"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the department information below."
              : "Add a new department to your organization."}
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
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="IT Department" {...field} />
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
                    <FormLabel>Code *</FormLabel>
                    <FormControl>
                      <Input placeholder="IT" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="parentDepartmentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parent Department</FormLabel>
                  <FormControl>
                    <SearchableSelect
                      options={departments
                        .filter(d => d.id !== department?.id) // Can't select self
                        .map((dept) => ({
                          value: dept.id,
                          label: `${dept.name} (${dept.code})`,
                        }))}
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Select parent department (optional)"
                      searchPlaceholder="Search departments..."
                      emptyText="No departments found"
                      allowNone
                      noneLabel="None (Root)"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="branchId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Branch</FormLabel>
                  <FormControl>
                    <SearchableSelect
                      options={branches.map((branch: any) => ({
                        value: branch.id,
                        label: `${branch.name} (${branch.code})`,
                      }))}
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Select branch (optional)"
                      searchPlaceholder="Search branches..."
                      emptyText="No branches found"
                      allowNone
                      noneLabel="No Branch"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="costCenter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cost Center</FormLabel>
                    <FormControl>
                      <Input placeholder="CC-100" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="managerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Manager</FormLabel>
                    <FormControl>
                      <SearchableSelect
                        options={users.map((user: any) => ({
                          value: user.id,
                          label: user.name || user.email,
                        }))}
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Select manager (optional)"
                        searchPlaceholder="Search users..."
                        emptyText="No users found"
                        allowNone
                        noneLabel="No Manager"
                      />
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
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Department description..."
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
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
