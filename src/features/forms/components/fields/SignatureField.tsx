'use client';

/**
 * SIGNATURE FIELD COMPONENT
 * Digital signature pad
 */

import { useRef, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/shared/icons';
import { JSONSchemaProperty } from '../../types/json-schema';
import { Control, Controller, FieldErrors } from 'react-hook-form';

interface SignatureFieldProps {
  name: string;
  field: JSONSchemaProperty;
  control: Control<any>;
  errors?: FieldErrors;
  disabled?: boolean;
}

export function SignatureField({ name, field, control, errors, disabled }: SignatureFieldProps) {
  const error = errors?.[name];
  const options = field['ui:options'] || {};
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (disabled) return;
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>, onChange: any) => {
    if (!isDrawing || disabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
    
    // Save as data URL
    onChange(canvas.toDataURL());
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clear = (onChange: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onChange(null);
  };

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
          <div className="space-y-2">
            <canvas
              ref={canvasRef}
              width={400}
              height={200}
              className={`border rounded-lg cursor-crosshair bg-white ${
                error ? 'border-destructive' : 'border-input'
              }`}
              onMouseDown={startDrawing}
              onMouseMove={(e) => draw(e, formField.onChange)}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
            />
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => clear(formField.onChange)}
              disabled={disabled}
            >
              <Icons.Eraser className="size-4 mr-2" />
              Clear Signature
            </Button>
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
