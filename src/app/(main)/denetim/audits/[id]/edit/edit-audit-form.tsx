"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ArrowLeft, Save, Trash2, Plus, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { toast } from "sonner";
import { AddQuestionDialog } from "@/components/audit/add-question-dialog";
import { useTranslations } from 'next-intl';

interface Question {
  id: string;
  questionText: string;
  category?: string | null;
  questionType?: string | null;
  bankId: string;
  bank?: { name: string } | null;
}

interface AuditQuestion {
  id: string;
  questionId: string;
  question: Question;
}

interface EditAuditFormProps {
  audit: {
    id: string;
    title: string;
    description: string | null;
    auditDate: Date | null;
    auditorId: string | null;
  };
  currentQuestions: AuditQuestion[];
  availableQuestions: Question[];
  availableUsers: Array<{
    id: string;
    name: string | null;
    email: string | null;
  }>;
}

export function EditAuditForm({ audit, currentQuestions, availableQuestions, availableUsers }: EditAuditFormProps) {
  const t = useTranslations('audit');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [auditorOpen, setAuditorOpen] = useState(false);
  
  const handleRemoveQuestion = async (auditQuestionId: string) => {
    try {
      const response = await fetch(`/api/audits/${audit.id}/questions/${auditQuestionId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error();
      toast.success("Soru kaldırıldı");
      router.refresh();
    } catch (error) {
      toast.error("Soru kaldırılırken hata oluştu");
    }
  };
  const [formData, setFormData] = useState({
    title: audit.title,
    description: audit.description || "",
    auditDate: audit.auditDate 
      ? new Date(audit.auditDate).toISOString().split('T')[0] 
      : "",
    auditorId: audit.auditorId || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);

    try {
      const response = await fetch(`/api/audits/${audit.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || null,
          auditDate: formData.auditDate ? new Date(formData.auditDate) : null,
          auditorId: formData.auditorId || null,
        }),
      });

      if (!response.ok) throw new Error();

      toast.success(t('messages.auditUpdated'));
      router.push(`/denetim/audits/${audit.id}`);
      router.refresh();
    } catch (error) {
      toast.error(tCommon('status.error'));
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/denetim/audits/${audit.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{t('edit')}</h1>
          <p className="text-sm text-muted-foreground">
            {t('messages.updateBasicInfo')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Sol Kolon: Denetim Bilgileri */}
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>{t('sections.basicInfo')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
            <div className="space-y-2">
              <Label htmlFor="title">{t('fields.title')} *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t('fields.description')}</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="auditDate">{t('fields.auditDate')}</Label>
              <Input
                id="auditDate"
                type="date"
                value={formData.auditDate}
                onChange={(e) => setFormData(prev => ({ ...prev, auditDate: e.target.value }))}
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="auditor">Denetçi</Label>
              <Popover open={auditorOpen} onOpenChange={setAuditorOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={auditorOpen}
                    className="w-full justify-between"
                    disabled={isPending}
                  >
                    {formData.auditorId
                      ? availableUsers.find((user) => user.id === formData.auditorId)?.name ||
                        availableUsers.find((user) => user.id === formData.auditorId)?.email ||
                        "Seçili kullanıcı"
                      : "Denetçi seçin..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Kullanıcı ara..." />
                    <CommandList>
                      <CommandEmpty>Kullanıcı bulunamadı.</CommandEmpty>
                      <CommandGroup>
                        {availableUsers.map((user) => (
                          <CommandItem
                            key={user.id}
                            value={`${user.name || ""} ${user.email || ""}`}
                            onSelect={() => {
                              setFormData(prev => ({ ...prev, auditorId: user.id }));
                              setAuditorOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.auditorId === user.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {user.name || user.email}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <p className="text-xs text-muted-foreground">
                {t('messages.selectAuditor')}
              </p>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={isPending}>
                <Save className="h-4 w-4 mr-2" />
                {isPending ? tCommon('status.saving') : tCommon('actions.save')}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href={`/denetim/audits/${audit.id}`}>
                  {tCommon('actions.cancel')}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        </form>

        {/* Sağ Kolon: Soru Yönetimi */}
        <div>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{t('sections.questions')}</CardTitle>
                  <CardDescription>
                    {currentQuestions.length} {t('sections.questions').toLowerCase()}
                    {currentQuestions.length > 8 && (
                      <span className="ml-2 text-xs">• Scrollable</span>
                    )}
                  </CardDescription>
                </div>
                <AddQuestionDialog
                  auditId={audit.id}
                  availableQuestions={availableQuestions}
                />
              </div>
            </CardHeader>
            <CardContent className="max-h-[600px] overflow-y-auto">
              {currentQuestions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground mb-4">
                    Henüz soru eklenmemiş
                  </p>
                  <AddQuestionDialog
                    auditId={audit.id}
                    availableQuestions={availableQuestions}
                  />
                </div>
              ) : (
                <div className="space-y-2 pr-2">
                  {currentQuestions.map((aq) => (
                    <div
                      key={aq.id}
                      className="flex items-start justify-between p-3 border rounded-lg hover:bg-accent/50"
                    >
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">{aq.question?.questionText || "Soru metni yüklenemedi"}</p>
                        <div className="flex items-center gap-2">
                          {aq.question?.bank && (
                            <Badge variant="outline" className="text-xs">
                              {aq.question.bank.name}
                            </Badge>
                          )}
                          {aq.question?.category && (
                            <Badge variant="secondary" className="text-xs">
                              {aq.question.category}
                            </Badge>
                          )}
                          {aq.question?.questionType && (
                            <Badge variant="secondary" className="text-xs">
                              {aq.question.questionType}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveQuestion(aq.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
