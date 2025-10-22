"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  DialogTrigger,
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
import { Button } from "@/components/ui/button";
import { updateFinding } from "@/action/finding-actions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  riskType: z.enum(["Kritik", "Yüksek", "Orta", "Düşük"], {
    required_error: "Risk seviyesi seçilmelidir",
  }),
  assignedToId: z.string({
    required_error: "Süreç sorumlusu seçilmelidir",
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface QuickFindingDialogProps {
  findingId: string;
  currentRisk?: string | null;
  currentAssignedId?: string | null;
  users: Array<{ id: string; name: string | null; email: string | null }>;
  children: React.ReactNode;
  redirectPath: string; // "/dofs/new" veya "/actions/new"
  title: string; // "DOF Aç" veya "Aksiyon Aç"
}

export function QuickFindingDialog({
  findingId,
  currentRisk,
  currentAssignedId,
  users,
  children,
  redirectPath,
  title,
}: QuickFindingDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      riskType: (currentRisk as any) || undefined,
      assignedToId: currentAssignedId || undefined,
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsPending(true);
    try {
      const result = await updateFinding(findingId, data);

      if (result.success) {
        toast.success("Bulgu güncellendi!");
        setOpen(false);
        // Redirect to DOF/Action create page
        router.push(`/denetim/findings/${findingId}${redirectPath}`);
        router.refresh();
      } else {
        toast.error(result.error || "Bir hata oluştu");
      }
    } catch (error) {
      toast.error("Bir hata oluştu");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Önce risk değerlendirmesi yapın ve süreç sorumlusu atayın
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Risk Type */}
            <FormField
              control={form.control}
              name="riskType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Risk Seviyesi</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Risk seviyesi seçin" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Kritik">
                        <span className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-red-600"></span>
                          Kritik
                        </span>
                      </SelectItem>
                      <SelectItem value="Yüksek">
                        <span className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-orange-600"></span>
                          Yüksek
                        </span>
                      </SelectItem>
                      <SelectItem value="Orta">
                        <span className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-yellow-600"></span>
                          Orta
                        </span>
                      </SelectItem>
                      <SelectItem value="Düşük">
                        <span className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-green-600"></span>
                          Düşük
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Assigned To */}
            <FormField
              control={form.control}
              name="assignedToId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Süreç Sorumlusu</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Süreç sorumlusu seçin" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name || user.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                İptal
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Kaydediliyor...
                  </>
                ) : (
                  "Kaydet ve Devam Et"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
