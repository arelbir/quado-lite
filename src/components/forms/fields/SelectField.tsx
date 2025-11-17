'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import type { FieldRendererProps } from '@/types/domain';

export function SelectField({ field, value, onChange, disabled }: FieldRendererProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={field.fieldKey}>
        {field.label}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </Label>
      
      <Select
        value={value}
        onValueChange={onChange}
        disabled={disabled}
        required={field.required}
      >
        <SelectTrigger id={field.fieldKey}>
          <SelectValue placeholder={field.placeholder || 'Select...'} />
        </SelectTrigger>
        <SelectContent>
          {field.options?.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {field.helpText && (
        <p className="text-sm text-muted-foreground">{field.helpText}</p>
      )}
    </div>
  );
}
