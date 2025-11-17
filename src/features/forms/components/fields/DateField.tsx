'use client';

/**
 * DATE FIELD COMPONENT
 * Date picker input
 */

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { JSONSchemaProperty } from '../../types/json-schema';
import { UseFormRegister, FieldErrors } from 'react-hook-form';

interface DateFieldProps {
  name: string;
  field: JSONSchemaProperty;
  register: UseFormRegister<any>;
  errors?: FieldErrors;
  disabled?: boolean;
  readOnly?: boolean;
}

export function DateField({ name, field, register, errors, disabled, readOnly }: DateFieldProps) {
  const error = errors?.[name];
  const options = field['ui:options'] || {};
  
  // Determine input type based on format
  let inputType = 'date';
  if (field.format === 'date-time') {
    inputType = 'datetime-local';
  } else if (field.format === 'time') {
    inputType = 'time';
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>
        {field.title || name}
        {field.description && (
          <span className="text-sm text-muted-foreground ml-2">({field.description})</span>
        )}
      </Label>
      
      <Input
        id={name}
        type={inputType}
        disabled={disabled}
        readOnly={readOnly}
        {...register(name)}
        className={error ? 'border-destructive' : ''}
      />
      
      {options.help && !error && (
        <p className="text-sm text-muted-foreground">{options.help}</p>
      )}
      
      {error && (
        <p className="text-sm text-destructive">{error.message as string}</p>
      )}
    </div>
  );
}
