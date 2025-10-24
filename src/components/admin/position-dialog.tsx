/**
 * POSITION DIALOG
 * Create/Edit Position Dialog
 * 
 * Features:
 * - Create new position
 * - Edit existing position
 * - Career level selection
 * - Category selection
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
import { createPosition, updatePosition } from "@/server/actions/organization-actions";
import { Loader2 } from "lucide-react";
import type { Position } from "@/lib/types";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  code: z.string().min(2, "Code must be at least 2 characters"),
  level: z.string().min(1, "Level is required"),
  category: z.string().optional(),
  description: z.string().optional(),
  salaryGrade: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface PositionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  position?: Partial<Position> | null;
  onSuccess?: () => void;
}

export function PositionDialog({
  open,
  onOpenChange,
  position,
  onSuccess,
}: PositionDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEdit = !!position;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      code: "",
      level: "",
      category: "",
      description: "",
      salaryGrade: "",
    },
  });

  // Update form when position changes
  useEffect(() => {
    if (position) {
      form.reset({
        name: position.name || "",
        code: position.code || "",
        level: position.level || "",
        category: position.category || "",
        description: position.description || "",
        salaryGrade: position.salaryGrade || "",
      });
    } else {
      form.reset();
    }
  }, [position, form]);

  async function onSubmit(data: FormData) {
    setIsSubmitting(true);

    try {
      if (isEdit && !position?.id) {
        toast.error("Position ID is required for update");
        return;
      }

      const result = isEdit
        ? await updatePosition(position.id!, data)
        : await createPosition(data);

      if (result.success) {
        toast.success(result.message || (isEdit ? "Position updated successfully" : "Position created successfully"));
        onOpenChange(false);
        form.reset();
        onSuccess?.();
      } else {
        toast.error(result.error || "An error occurred");
      }
    } catch (error) {
      toast.error("Failed to save position");
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
            {isEdit ? "Edit Position" : "Create Position"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the position information below."
              : "Add a new position to your organization."}
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
                    <FormLabel>Position Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Senior Software Engineer" {...field} />
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
                      <Input placeholder="SSE" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Level *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="10">10 - C-Level</SelectItem>
                        <SelectItem value="9">9 - VP/Director</SelectItem>
                        <SelectItem value="8">8 - Senior Manager</SelectItem>
                        <SelectItem value="7">7 - Manager</SelectItem>
                        <SelectItem value="6">6 - Team Lead/Senior</SelectItem>
                        <SelectItem value="5">5 - Mid-Level</SelectItem>
                        <SelectItem value="4">4 - Junior</SelectItem>
                        <SelectItem value="3">3 - Entry</SelectItem>
                        <SelectItem value="2">2 - Intern</SelectItem>
                        <SelectItem value="1">1 - Trainee</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Executive">Executive</SelectItem>
                        <SelectItem value="Management">Management</SelectItem>
                        <SelectItem value="Professional">Professional</SelectItem>
                        <SelectItem value="Technical">Technical</SelectItem>
                        <SelectItem value="Operational">Operational</SelectItem>
                        <SelectItem value="Administrative">Administrative</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="salaryGrade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Salary Grade</FormLabel>
                  <FormControl>
                    <Input placeholder="E-10, M-7, P-5, etc." {...field} />
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
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Position description and responsibilities..."
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
