"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from 'next-intl';

interface Template {
  id: string;
  name: string;
  category: string;
}

interface TemplateSelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

/**
 * Template Selector Component
 * Pattern: Async data loading in client component
 * SOLID: Single Responsibility - sadece template seçimi
 */
export function TemplateSelector({ value, onChange, disabled }: TemplateSelectorProps) {
  const t = useTranslations('templates');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/templates")
      .then((res) => res.json())
      .then((data) => {
        setTemplates(data as Template[]);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error loading templates:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <Skeleton className="h-10 w-full" />;
  }

  if (templates.length === 0) {
    return (
      <div className="rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
        Henüz şablon oluşturulmamış. Lütfen önce şablon oluşturun.
      </div>
    );
  }

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder={t('selectTemplate')} />
      </SelectTrigger>
      <SelectContent>
        {templates.map((template) => (
          <SelectItem key={template.id} value={template.id}>
            <div className="flex items-center gap-2">
              <span>{template.name}</span>
              <span className="text-xs text-muted-foreground">
                ({template.category})
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
