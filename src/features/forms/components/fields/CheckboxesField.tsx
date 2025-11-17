'use client';

/**
 * CHECKBOXES FIELD COMPONENT
 * Multiple checkboxes for array selection
 */

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { JSONSchemaProperty } from '../../types/json-schema';
import { Control, Controller, FieldErrors } from 'react-hook-form';

interface CheckboxesFieldProps {
  name: string;
  field: JSONSchemaProperty;
  control: Control<any>;
  errors?: FieldErrors;
  disabled?: boolean;
}

export function CheckboxesField({ name, field, control, errors, disabled }: CheckboxesFieldProps) {
  const error = errors?.[name];
  const options = field['ui:options'] || {};
  const enumValues = field.items?.enum || [];
  const enumNames = (field.items as any)?.enumNames || enumValues;
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
          <div className={inline ? 'flex flex-row gap-4' : 'flex flex-col gap-2'}>
            {enumValues.map((value, index) => {
              const checked = Array.isArray(formField.value) && formField.value.includes(value);
              
              return (
                <div key={value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${name}-${value}`}
                    checked={checked}
                    onCheckedChange={(isChecked) => {
                      const currentValues = Array.isArray(formField.value) ? formField.value : [];
                      if (isChecked) {
                        formField.onChange([...currentValues, value]);
                      } else {
                        formField.onChange(currentValues.filter((v: any) => v !== value));
                      }
                    }}
                    disabled={disabled}
                  />
                  <Label htmlFor={`${name}-${value}`} className="cursor-pointer font-normal">
                    {enumNames[index]}
                  </Label>
                </div>
              );
            })}
          </div>
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
