'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { FieldRendererProps } from '@/lib/types';

export function TextField({ field, value, onChange, disabled }: FieldRendererProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={field.fieldKey}>
        {field.label}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </Label>
      
      <Input
        id={field.fieldKey}
        type={field.fieldType}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        disabled={disabled}
        required={field.required}
        minLength={field.validation?.minLength}
        maxLength={field.validation?.maxLength}
      />
      
      {field.helpText && (
        <p className="text-sm text-muted-foreground">{field.helpText}</p>
      )}
    </div>
  );
}
