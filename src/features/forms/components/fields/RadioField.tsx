'use client';

/**
 * RADIO FIELD COMPONENT
 * Radio button group for single selection
 */

import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { JSONSchemaProperty } from '../../types/json-schema';
import { Control, Controller, FieldErrors } from 'react-hook-form';

interface RadioFieldProps {
  name: string;
  field: JSONSchemaProperty;
  control: Control<any>;
  errors?: FieldErrors;
  disabled?: boolean;
}

export function RadioField({ name, field, control, errors, disabled }: RadioFieldProps) {
  const error = errors?.[name];
  const options = field['ui:options'] || {};
  const enumValues = field.enum || [];
  const enumNames = field.enumNames || enumValues;
  const inline = options.inline || false;

  return (
    <div className="space-y-2">
      <Label>
        {field.title || name}
        {field.description && (
          <span className="text-sm text-muted-foreground ml-2">({field.description})</span>
        )}
      </Label>
      
      <Controller
        name={name}
        control={control}
        render={({ field: formField }) => (
          <RadioGroup
            onValueChange={formField.onChange}
            value={formField.value}
            disabled={disabled}
            className={inline ? 'flex flex-row gap-4' : 'flex flex-col gap-2'}
          >
            {enumValues.map((value, index) => (
              <div key={value} className="flex items-center space-x-2">
                <RadioGroupItem value={String(value)} id={`${name}-${value}`} />
                <Label htmlFor={`${name}-${value}`} className="cursor-pointer font-normal">
                  {enumNames[index]}
                </Label>
              </div>
            ))}
          </RadioGroup>
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
