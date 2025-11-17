'use client';

/**
 * SELECT FIELD COMPONENT
 * Dropdown selection
 */

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { JSONSchemaProperty } from '../../types/json-schema';
import { UseFormRegister, FieldErrors, Control, Controller } from 'react-hook-form';

interface SelectFieldProps {
  name: string;
  field: JSONSchemaProperty;
  control: Control<any>;
  errors?: FieldErrors;
  disabled?: boolean;
}

export function SelectField({ name, field, control, errors, disabled }: SelectFieldProps) {
  const error = errors?.[name];
  const options = field['ui:options'] || {};
  const enumValues = field.enum || [];
  const enumNames = field.enumNames || enumValues;

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>
        {field.title || name}
        {field.description && (
          <span className="text-sm text-muted-foreground ml-2">({field.description})</span>
        )}
      </Label>
      
      <Controller
        name={name}
        control={control}
        render={({ field: formField }) => (
          <Select
            onValueChange={formField.onChange}
            value={formField.value}
            disabled={disabled}
          >
            <SelectTrigger className={error ? 'border-destructive' : ''}>
              <SelectValue placeholder={options.placeholder || 'Select...'} />
            </SelectTrigger>
            <SelectContent>
              {enumValues.map((value, index) => (
                <SelectItem key={value} value={String(value)}>
                  {enumNames[index]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
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
