'use client';

/**
 * RATING FIELD COMPONENT
 * Star rating input
 */

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Icons } from '@/components/shared/icons';
import { JSONSchemaProperty } from '../../types/json-schema';
import { Control, Controller, FieldErrors } from 'react-hook-form';

interface RatingFieldProps {
  name: string;
  field: JSONSchemaProperty;
  control: Control<any>;
  errors?: FieldErrors;
  disabled?: boolean;
}

export function RatingField({ name, field, control, errors, disabled }: RatingFieldProps) {
  const error = errors?.[name];
  const options = field['ui:options'] || {};
  const max = field.maximum || 5;
  const [hover, setHover] = useState(0);

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
          <div className="flex items-center gap-1">
            {Array.from({ length: max }, (_, i) => i + 1).map((star) => {
              const isFilled = (hover || formField.value || 0) >= star;
              
              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => !disabled && formField.onChange(star)}
                  onMouseEnter={() => !disabled && setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  disabled={disabled}
                  className="transition-colors"
                >
                  <Icons.Star
                    className={`size-6 ${
                      isFilled
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'fill-none text-gray-300'
                    } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-110'}`}
                  />
                </button>
              );
            })}
            {formField.value > 0 && (
              <span className="ml-2 text-sm text-muted-foreground">
                {formField.value} / {max}
              </span>
            )}
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
