'use client';

/**
 * TEXT FIELD COMPONENT
 * Single-line text input with validation
 */

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { JSONSchemaProperty } from '../../types/json-schema';
import { UseFormRegister, FieldErrors } from 'react-hook-form';

interface TextFieldProps {
  name: string;
  field: JSONSchemaProperty;
  register: UseFormRegister<any>;
  errors?: FieldErrors;
  disabled?: boolean;
  readOnly?: boolean;
}

export function TextField({ name, field, register, errors, disabled, readOnly }: TextFieldProps) {
  const error = errors?.[name];
  const options = field['ui:options'] || {};

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
        type={field['ui:widget'] || 'text'}
        placeholder={options.placeholder}
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
