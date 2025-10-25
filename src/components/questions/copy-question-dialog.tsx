"use client";

import { useState, useTransition } from "react";
import { copyQuestion } from "@/server/actions/question-actions";
import { getActiveQuestionBanks } from "@/server/actions/question-bank-actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Copy, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface CopyQuestionDialogProps {
  questionId: string;
  currentBankId: string;
  children?: React.ReactNode;
}

export function CopyQuestionDialog({ 
  questionId, 
  currentBankId,
  children 
}: CopyQuestionDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [targetBankId, setTargetBankId] = useState("");
  const [banks, setBanks] = useState<any[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (open) {
      // Dialog açıldığında havuzları yükle
      getActiveQuestionBanks().then((data) => {
        // Tüm havuzları göster (mevcut havuz dahil)
        setBanks(data);
      });
    }
  }, [open, currentBankId]);

  const handleCopy = () => {
    if (!targetBankId) {
      toast.error("Lütfen hedef havuz seçin");
      return;
    }

    startTransition(async () => {
      const result = await copyQuestion({
        questionId,
        targetBankId,
        duplicate: targetBankId === currentBankId, // Aynı havuzsa türetme
      });

      if (result.success) {
        if (targetBankId === currentBankId) {
          toast.success("Soru başarıyla türetildi!");
        } else {
          toast.success("Soru başarıyla kopyalandı!");
        }
        setOpen(false);
        setTargetBankId("");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="ghost" size="sm">
            <Copy className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Soruyu Kopyala</DialogTitle>
          <DialogDescription>
            Bu soruyu başka bir soru havuzuna kopyalayın
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="target-bank">Hedef Soru Havuzu</Label>
            <Select value={targetBankId} onValueChange={setTargetBankId}>
              <SelectTrigger id="target-bank">
                <SelectValue placeholder="Havuz seçin" />
              </SelectTrigger>
              <SelectContent>
                {banks.map((bank) => (
                  <SelectItem key={bank.id} value={bank.id}>
                    <div className="flex items-center gap-2">
                      <span>{bank.name} ({bank.category})</span>
                      {bank.id === currentBankId && (
                        <Badge variant="secondary" className="text-xs">
                          Mevcut Havuz
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {banks.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Başka aktif soru havuzu bulunamadı
              </p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            İptal
          </Button>
          <Button onClick={handleCopy} disabled={isPending || !targetBankId}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Kopyala
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
