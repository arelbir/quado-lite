"use client";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuestionCardValue {
  answer: string;
  notes: string;
  isNonCompliant: boolean;
}

interface QuestionCardProps {
  auditQuestion: any;
  questionNumber: number;
  value: QuestionCardValue;
  onChange: (updates: Partial<QuestionCardValue>) => void;
}

export function QuestionCard({ auditQuestion, questionNumber, value, onChange }: QuestionCardProps) {
  const question = auditQuestion.question;
  const isAnswered = !!value.answer;
  const [isOpen, setIsOpen] = useState(false); // Tüm sorular kapalı başlar (kompakt görünüm)

  const renderAnswerInput = () => {
    switch (question?.questionType) {
      case "YesNo":
        return (
          <RadioGroup
            value={value.answer}
            onValueChange={(val) => onChange({ answer: val })}
          >
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Evet" id={`${auditQuestion.id}-yes`} />
                <Label htmlFor={`${auditQuestion.id}-yes`} className="cursor-pointer">
                  Evet
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Hayır" id={`${auditQuestion.id}-no`} />
                <Label htmlFor={`${auditQuestion.id}-no`} className="cursor-pointer">
                  Hayır
                </Label>
              </div>
            </div>
          </RadioGroup>
        );

      case "Scale":
        return (
          <RadioGroup
            value={value.answer}
            onValueChange={(val) => onChange({ answer: val })}
          >
            <div className="flex items-center space-x-3">
              {[1, 2, 3, 4, 5].map((num) => (
                <div key={num} className="flex items-center space-x-1">
                  <RadioGroupItem value={num.toString()} id={`${auditQuestion.id}-${num}`} />
                  <Label htmlFor={`${auditQuestion.id}-${num}`} className="cursor-pointer">
                    {num}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        );

      case "SingleChoice":
        const singleOptions: string[] = question.checklistOptions
          ? (typeof question.checklistOptions === 'string' ? JSON.parse(question.checklistOptions) : question.checklistOptions)
          : [];
        return (
          <RadioGroup
            value={value.answer}
            onValueChange={(val) => onChange({ answer: val })}
          >
            <div className="space-y-2">
              {singleOptions.map((option: string, idx: number) => (
                <div key={idx} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`${auditQuestion.id}-${idx}`} />
                  <Label htmlFor={`${auditQuestion.id}-${idx}`} className="cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        );

      case "Checklist":
        const checkOptions: string[] = question.checklistOptions
          ? (typeof question.checklistOptions === 'string' ? JSON.parse(question.checklistOptions) : question.checklistOptions)
          : [];
        const selectedOptions = value.answer ? value.answer.split(",") : [];

        return (
          <div className="space-y-2">
            {checkOptions.map((option: string, idx: number) => {
              const isChecked = selectedOptions.includes(option);
              return (
                <div key={idx} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${auditQuestion.id}-${idx}`}
                    checked={isChecked}
                    onCheckedChange={(checked) => {
                      let newSelected = [...selectedOptions];
                      if (checked) {
                        newSelected.push(option);
                      } else {
                        newSelected = newSelected.filter((o) => o !== option);
                      }
                      onChange({ answer: newSelected.join(",") });
                    }}
                  />
                  <Label htmlFor={`${auditQuestion.id}-${idx}`} className="cursor-pointer">
                    {option}
                  </Label>
                </div>
              );
            })}
          </div>
        );

      case "Text":
      default:
        return (
          <Textarea
            value={value.answer}
            onChange={(e) => onChange({ answer: e.target.value })}
            placeholder="Cevabınızı yazın..."
            rows={3}
            className="resize-none"
          />
        );
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div
        className={cn(
          "rounded-lg border transition-colors",
          isAnswered && "border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20",
          value.isNonCompliant && "border-destructive bg-destructive/5"
        )}
      >
        {/* Header - Always Visible */}
        <CollapsibleTrigger className="w-full p-3 md:p-4 flex items-start justify-between gap-2 hover:bg-accent/50 transition-colors">
          <div className="flex items-start gap-3 flex-1 text-left">
            <div className="mt-0.5">
              {isAnswered ? (
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
              ) : (
                <div className="h-5 w-5 rounded-full border-2 border-muted-foreground flex-shrink-0" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <Badge variant="outline" className="text-xs">
                  {questionNumber}
                </Badge>
                {question?.isMandatory && (
                  <Badge variant="destructive" className="text-xs">
                    Zorunlu
                  </Badge>
                )}
                {value.isNonCompliant && (
                  <Badge variant="destructive" className="text-xs">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Uygunsuz
                  </Badge>
                )}
              </div>
              <p className="font-medium text-sm md:text-base line-clamp-2">
                {question?.questionText}
              </p>
              {isAnswered && !isOpen && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                  Cevap: {value.answer}
                </p>
              )}
            </div>
          </div>
          <ChevronDown
            className={cn(
              "h-5 w-5 text-muted-foreground transition-transform flex-shrink-0",
              isOpen && "transform rotate-180"
            )}
          />
        </CollapsibleTrigger>

        {/* Content - Collapsible */}
        <CollapsibleContent>
          <div className="px-3 md:px-4 pb-3 md:pb-4 pt-2 space-y-4">
            {question?.helpText && (
              <p className="text-xs md:text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                💡 {question.helpText}
              </p>
            )}

            {/* Answer Input */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Cevap</Label>
              {renderAnswerInput()}
            </div>

            {/* Non-Compliant Checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`noncompliant-${auditQuestion.id}`}
                checked={value.isNonCompliant}
                onCheckedChange={(checked) => onChange({ isNonCompliant: !!checked })}
              />
              <Label
                htmlFor={`noncompliant-${auditQuestion.id}`}
                className="text-sm cursor-pointer"
              >
                Bu soru için uygunsuzluk tespit edildi
              </Label>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor={`notes-${auditQuestion.id}`} className="text-sm">
                Notlar (opsiyonel)
              </Label>
              <Textarea
                id={`notes-${auditQuestion.id}`}
                value={value.notes}
                onChange={(e) => onChange({ notes: e.target.value })}
                placeholder="Ek açıklamalar, gözlemler..."
                rows={2}
                className="resize-none text-sm"
              />
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
