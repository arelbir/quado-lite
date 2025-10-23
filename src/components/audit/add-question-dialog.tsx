"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Check, Search } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Question {
  id: string;
  questionText: string;
  category?: string | null;
  questionType?: string | null;
  bankId: string;
  bank?: {
    name: string;
  } | null;
}

interface AddQuestionDialogProps {
  auditId: string;
  availableQuestions: Question[];
  disabled?: boolean;
}

/**
 * Add Question Dialog
 * Soru havuzundan denetim'e soru ekleme
 */
export function AddQuestionDialog({ 
  auditId, 
  availableQuestions,
  disabled = false 
}: AddQuestionDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set());
  const [isPending, setIsPending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  // Arama filtresi
  const filteredQuestions = availableQuestions.filter((q) => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return (
      q.questionText?.toLowerCase().includes(search) ||
      q.category?.toLowerCase().includes(search) ||
      q.questionType?.toLowerCase().includes(search) ||
      q.bank?.name?.toLowerCase().includes(search)
    );
  });

  const toggleQuestion = (questionId: string) => {
    const newSelected = new Set(selectedQuestions);
    if (newSelected.has(questionId)) {
      newSelected.delete(questionId);
    } else {
      newSelected.add(questionId);
    }
    setSelectedQuestions(newSelected);
  };

  const handleAddQuestions = async () => {
    if (selectedQuestions.size === 0) {
      toast.error("Lütfen en az bir soru seçin");
      return;
    }

    setIsPending(true);
    try {
      const response = await fetch(`/api/audits/${auditId}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionIds: Array.from(selectedQuestions),
        }),
      });

      if (!response.ok) throw new Error("Failed to add questions");

      toast.success(`${selectedQuestions.size} soru eklendi`);
      setOpen(false);
      setSelectedQuestions(new Set());
      setSearchQuery(""); // Search'ü temizle
      router.refresh();
    } catch (error) {
      toast.error("Sorular eklenirken hata oluştu");
    } finally {
      setIsPending(false);
    }
  };

  // Dialog kapandığında search'ü temizle
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setSearchQuery("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" disabled={disabled}>
          <Plus className="h-4 w-4 mr-2" />
          Soru Ekle
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Soru Havuzundan Soru Ekle
            {selectedQuestions.size > 0 && (
              <span className="ml-2 text-sm font-normal text-primary">
                ({selectedQuestions.size} seçildi)
              </span>
            )}
          </DialogTitle>
          <DialogDescription>
            Eklemek istediğiniz soruların üzerine tıklayın
          </DialogDescription>
        </DialogHeader>

        {/* Arama */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Soru, kategori veya soru havuzunda ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="space-y-3 py-4">
          {/* Sonuç sayısı */}
          {searchQuery && (
            <p className="text-sm text-muted-foreground">
              {filteredQuestions.length} sonuç bulundu
            </p>
          )}

          {availableQuestions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">
                Soru havuzunda eklenebilecek soru bulunamadı
              </p>
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">
                Aramanızla eşleşen soru bulunamadı
              </p>
            </div>
          ) : (
            filteredQuestions.map((question) => {
              const isSelected = selectedQuestions.has(question.id);
              return (
                <Card
                  key={question.id}
                  className={`cursor-pointer transition-all ${
                    isSelected 
                      ? "border-primary border-2 bg-primary/10 shadow-md" 
                      : "hover:bg-accent hover:border-accent-foreground/20"
                  }`}
                  onClick={() => toggleQuestion(question.id)}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-1 h-6 w-6 rounded-md border-2 flex items-center justify-center transition-all ${
                          isSelected 
                            ? "border-primary bg-primary scale-110" 
                            : "border-muted-foreground/30"
                        }`}
                      >
                        {isSelected && <Check className="h-4 w-4 text-primary-foreground font-bold" />}
                      </div>
                      <div className="flex-1 space-y-2">
                        <p className="text-sm font-medium">{question.questionText}</p>
                        <div className="flex items-center gap-2">
                          {question.bank && (
                            <Badge variant="outline" className="text-xs">
                              {question.bank.name}
                            </Badge>
                          )}
                          {question.category && (
                            <Badge variant="secondary" className="text-xs">
                              {question.category}
                            </Badge>
                          )}
                          {question.questionType && (
                            <Badge variant="secondary" className="text-xs">
                              {question.questionType}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-3">
            <p className="text-sm font-medium">
              {selectedQuestions.size > 0 ? (
                <span className="text-primary">
                  ✓ {selectedQuestions.size} soru seçildi
                </span>
              ) : (
                <span className="text-muted-foreground">
                  Henüz soru seçilmedi
                </span>
              )}
            </p>
            {filteredQuestions.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const filteredIds = new Set(filteredQuestions.map(q => q.id));
                  const allFilteredSelected = filteredQuestions.every(q => selectedQuestions.has(q.id));
                  
                  if (allFilteredSelected) {
                    // Filtrelenen soruları kaldır
                    const newSelected = new Set(selectedQuestions);
                    filteredIds.forEach(id => newSelected.delete(id));
                    setSelectedQuestions(newSelected);
                  } else {
                    // Filtrelenen soruları ekle
                    const newSelected = new Set(selectedQuestions);
                    filteredIds.forEach(id => newSelected.add(id));
                    setSelectedQuestions(newSelected);
                  }
                }}
              >
                {filteredQuestions.every(q => selectedQuestions.has(q.id)) 
                  ? `Görünenleri Temizle (${filteredQuestions.length})` 
                  : `Görünenleri Seç (${filteredQuestions.length})`}
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              İptal
            </Button>
            <Button
              onClick={handleAddQuestions}
              disabled={isPending || selectedQuestions.size === 0}
            >
              {isPending ? "Ekleniyor..." : `${selectedQuestions.size} Soru Ekle`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
