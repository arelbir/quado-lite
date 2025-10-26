'use client';

import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { FieldRendererProps } from '@/lib/types';

export function TextareaField({ field, value, onChange, disabled }: FieldRendererProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={field.fieldKey}>
        {field.label}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </Label>
      
      <Textarea
        id={field.fieldKey}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        disabled={disabled}
        required={field.required}
        rows={field.validation?.rows || 3}
        minLength={field.validation?.minLength}
        maxLength={field.validation?.maxLength}
      />
      
      {field.helpText && (
        <p className="text-sm text-muted-foreground">{field.helpText}</p>
      )}
    </div>
  );
}
