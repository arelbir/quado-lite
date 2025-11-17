'use client';

/**
 * FILE FIELD COMPONENT
 * File upload with preview
 */

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/shared/icons';
import { JSONSchemaProperty } from '../../types/json-schema';
import { Control, Controller, FieldErrors } from 'react-hook-form';

interface FileFieldProps {
  name: string;
  field: JSONSchemaProperty;
  control: Control<any>;
  errors?: FieldErrors;
  disabled?: boolean;
}

export function FileField({ name, field, control, errors, disabled }: FileFieldProps) {
  const error = errors?.[name];
  const options = field['ui:options'] || {};
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, onChange: any) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange(file);
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setPreview(null);
      }
    }
  };

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
          <div className="space-y-2">
            <Input
              id={name}
              type="file"
              accept={options.accept}
              disabled={disabled}
              onChange={(e) => handleFileChange(e, formField.onChange)}
              className={error ? 'border-destructive' : ''}
            />
            
            {preview && (
              <div className="relative w-full h-40 rounded-lg overflow-hidden border">
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setPreview(null);
                    formField.onChange(null);
                  }}
                >
                  <Icons.X className="size-4" />
                </Button>
              </div>
            )}
            
            {formField.value && !preview && (
              <div className="flex items-center gap-2 p-2 border rounded-lg">
                <Icons.File className="size-4" />
                <span className="text-sm truncate">{formField.value.name}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="ml-auto"
                  onClick={() => formField.onChange(null)}
                >
                  <Icons.X className="size-4" />
                </Button>
              </div>
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
