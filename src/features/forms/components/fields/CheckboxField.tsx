'use client';

/**
 * CHECKBOX FIELD COMPONENT
 * Single checkbox for boolean values
 */

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { JSONSchemaProperty } from '../../types/json-schema';
import { Control, Controller, FieldErrors } from 'react-hook-form';

interface CheckboxFieldProps {
  name: string;
  field: JSONSchemaProperty;
  control: Control<any>;
  errors?: FieldErrors;
  disabled?: boolean;
}

export function CheckboxField({ name, field, control, errors, disabled }: CheckboxFieldProps) {
  const error = errors?.[name];
  const options = field['ui:options'] || {};

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <Controller
          name={name}
          control={control}
          render={({ field: formField }) => (
            <Checkbox
              id={name}
              checked={formField.value}
              onCheckedChange={formField.onChange}
              disabled={disabled}
              className={error ? 'border-destructive' : ''}
            />
          )}
        />
        <Label htmlFor={name} className="cursor-pointer">
          {field.title || name}
          {field.description && (
            <span className="text-sm text-muted-foreground ml-2">({field.description})</span>
          )}
        </Label>
      </div>
      
      {options.help && !error && (
        <p className="text-sm text-muted-foreground ml-6">{options.help}</p>
      )}
      
      {error && (
        <p className="text-sm text-destructive ml-6">{error.message as string}</p>
      )}
    </div>
  );
}
