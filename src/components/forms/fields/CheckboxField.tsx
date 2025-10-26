'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import type { FieldRendererProps } from '@/lib/types';

export function CheckboxField({ field, value, onChange, disabled }: FieldRendererProps) {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id={field.fieldKey}
        checked={value || false}
        onCheckedChange={onChange}
        disabled={disabled}
      />
      <Label
        htmlFor={field.fieldKey}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
      >
        {field.label}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </Label>
      
      {field.helpText && (
        <p className="text-sm text-muted-foreground ml-6">{field.helpText}</p>
      )}
    </div>
  );
}
