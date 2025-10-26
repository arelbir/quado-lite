'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { FieldRendererProps } from '@/lib/types';

export function DateField({ field, value, onChange, disabled }: FieldRendererProps) {
  let inputType = 'date';
  if (field.fieldType === 'datetime') inputType = 'datetime-local';
  if (field.fieldType === 'time') inputType = 'time';

  return (
    <div className="space-y-2">
      <Label htmlFor={field.fieldKey}>
        {field.label}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </Label>
      
      <Input
        id={field.fieldKey}
        type={inputType}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        required={field.required}
      />
      
      {field.helpText && (
        <p className="text-sm text-muted-foreground">{field.helpText}</p>
      )}
    </div>
  );
}
