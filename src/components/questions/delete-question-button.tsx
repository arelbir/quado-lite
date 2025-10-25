"use client";

import { useTransition } from "react";
import { deleteQuestion } from "@/server/actions/question-actions";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { Trash2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface DeleteQuestionButtonProps {
  questionId: string;
}

/**
 * Delete Question Button
 * Pattern: Alert Dialog with confirmation
 */
export function DeleteQuestionButton({ questionId }: DeleteQuestionButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteQuestion(questionId);

      if (result.success) {
        toast.success("Soru silindi!");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <AlertDialog>
          <TooltipTrigger asChild>
            <AlertDialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                disabled={isPending}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </AlertDialogTrigger>
          </TooltipTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Soruyu Sil</AlertDialogTitle>
              <AlertDialogDescription>
                Bu soruyu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>İptal</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Sil
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <TooltipContent>
          <p>Soruyu sil</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
