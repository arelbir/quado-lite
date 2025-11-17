'use client';

/**
 * TEXTAREA FIELD COMPONENT
 * Multi-line text input
 */

import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { JSONSchemaProperty } from '../../types/json-schema';
import { UseFormRegister, FieldErrors } from 'react-hook-form';

interface TextAreaFieldProps {
  name: string;
  field: JSONSchemaProperty;
  register: UseFormRegister<any>;
  errors?: FieldErrors;
  disabled?: boolean;
  readOnly?: boolean;
}

export function TextAreaField({ name, field, register, errors, disabled, readOnly }: TextAreaFieldProps) {
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
      
      <Textarea
        id={name}
        placeholder={options.placeholder}
        rows={options.rows || 4}
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
