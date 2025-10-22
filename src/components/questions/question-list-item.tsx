"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GripVertical, Edit, Copy as CopyIcon } from "lucide-react";
import Link from "next/link";
import { CopyQuestionDialog } from "./copy-question-dialog";
import { DuplicateQuestionButton } from "./duplicate-question-button";

interface QuestionListItemProps {
  question: any;
  index: number;
  bankId: string;
}

export function QuestionListItem({ 
  question, 
  index, 
  bankId
}: QuestionListItemProps) {
  const getQuestionTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      YesNo: "Evet/Hayır",
      Scale: "Ölçek (1-5)",
      Text: "Serbest Metin",
      SingleChoice: "Tek Seçim",
      Checklist: "Çoklu Seçim",
    };
    return labels[type] || type;
  };

  const getQuestionTypeBadgeVariant = (type: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      YesNo: "default",
      Scale: "secondary",
      Text: "outline",
      SingleChoice: "secondary",
      Checklist: "outline",
    };
    return variants[type] || "outline";
  };

  return (
    <div className="flex items-start gap-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors group">
      {/* Drag Handle */}
      <div className="flex items-center gap-2 text-muted-foreground mt-1">
        <GripVertical className="h-4 w-4 cursor-move opacity-0 group-hover:opacity-100 transition-opacity" />
        <span className="text-sm font-medium min-w-[30px]">#{index + 1}</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant={getQuestionTypeBadgeVariant(question.questionType)} className="text-xs">
            {getQuestionTypeLabel(question.questionType)}
          </Badge>
          {question.isMandatory && (
            <Badge variant="destructive" className="text-xs">Zorunlu</Badge>
          )}
        </div>
        <p className="text-sm font-medium mb-1 line-clamp-2">{question.questionText}</p>
        {question.helpText && (
          <p className="text-xs text-muted-foreground line-clamp-1">
            💡 {question.helpText}
          </p>
        )}
        {(question.questionType === "SingleChoice" || question.questionType === "Checklist") && question.checklistOptions && (
          <p className="text-xs text-muted-foreground mt-1">
            {question.checklistOptions.length} seçenek
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/denetim/question-banks/${bankId}/questions/${question.id}/edit`}>
            <Edit className="h-4 w-4" />
          </Link>
        </Button>
        <DuplicateQuestionButton questionId={question.id} bankId={bankId} />
        <CopyQuestionDialog questionId={question.id} currentBankId={bankId}>
          <Button variant="ghost" size="sm">
            <CopyIcon className="h-4 w-4 text-primary" />
          </Button>
        </CopyQuestionDialog>
      </div>
    </div>
  );
}
