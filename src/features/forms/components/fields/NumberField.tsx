'use client';

/**
 * NUMBER FIELD COMPONENT
 * Numeric input with min/max validation
 */

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { JSONSchemaProperty } from '../../types/json-schema';
import { UseFormRegister, FieldErrors } from 'react-hook-form';

interface NumberFieldProps {
  name: string;
  field: JSONSchemaProperty;
  register: UseFormRegister<any>;
  errors?: FieldErrors;
  disabled?: boolean;
  readOnly?: boolean;
}

export function NumberField({ name, field, register, errors, disabled, readOnly }: NumberFieldProps) {
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
        type="number"
        placeholder={options.placeholder}
        min={field.minimum}
        max={field.maximum}
        step={field.multipleOf || (field.type === 'integer' ? 1 : 'any')}
        disabled={disabled}
        readOnly={readOnly}
        {...register(name, { valueAsNumber: true })}
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
