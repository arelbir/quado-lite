"use client";

import { useState, useTransition } from "react";
import { copyQuestion } from "@/action/question-actions";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { Copy, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface DuplicateQuestionButtonProps {
  questionId: string;
  bankId: string;
}

export function DuplicateQuestionButton({ 
  questionId, 
  bankId 
}: DuplicateQuestionButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDuplicate = () => {
    startTransition(async () => {
      const result = await copyQuestion({
        questionId,
        targetBankId: bankId, // Aynı havuza
        duplicate: true,
      });

      if (result.success) {
        toast.success("Soru başarıyla türetildi!");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleDuplicate}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Bu soruyu türet (aynı havuzda)</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
