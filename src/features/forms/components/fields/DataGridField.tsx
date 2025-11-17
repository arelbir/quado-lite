'use client';

/**
 * DATA GRID FIELD COMPONENT
 * Repeatable rows with nested fields
 */

import { useState } from 'react';
import { useFieldArray, Control, UseFormRegister, FieldErrors } from 'react-hook-form';
import { JSONSchemaProperty } from '../../types/json-schema';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Icons } from '@/components/shared/icons';
import { 
  TextField, 
  TextAreaField, 
  NumberField, 
  SelectField,
  CheckboxField,
  DateField,
} from './index';

interface DataGridFieldProps {
  name: string;
  field: JSONSchemaProperty;
  control: Control<any>;
  register: UseFormRegister<any>;
  errors?: FieldErrors;
  disabled?: boolean;
}

export function DataGridField({ 
  name, 
  field, 
  control, 
  register,
  errors, 
  disabled 
}: DataGridFieldProps) {
  const { fields, append, remove, move } = useFieldArray({
    control,
    name,
  });

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const error = errors?.[name];
  const options = field['ui:options'] || {};
  const itemSchema = field.items;

  if (!itemSchema || itemSchema.type !== 'object' || !itemSchema.properties) {
    return (
      <div className="text-destructive">
        Invalid DataGrid schema: items must be object with properties
      </div>
    );
  }

  const addRow = () => {
    const defaultRow: any = {};
    if (itemSchema.properties) {
      Object.entries(itemSchema.properties).forEach(([key, prop]) => {
        defaultRow[key] = prop.default || '';
      });
    }
    append(defaultRow);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      move(draggedIndex, index);
      setDraggedIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const renderFieldInRow = (rowIndex: number, fieldKey: string, fieldSchema: JSONSchemaProperty) => {
    const fieldName = `${name}.${rowIndex}.${fieldKey}`;
    const nameErrors = errors?.[name] as any;
    const fieldError = nameErrors?.[rowIndex]?.[fieldKey];
    const widget = fieldSchema['ui:widget'];

    const commonProps = {
      name: fieldName,
      field: fieldSchema,
      errors: { [fieldName]: fieldError } as any,
      disabled,
    };

    switch (widget) {
      case 'textarea':
        return <TextAreaField key={fieldName} {...commonProps} register={register} />;
      case 'number':
        return <NumberField key={fieldName} {...commonProps} register={register} />;
      case 'select':
        return <SelectField key={fieldName} {...commonProps} control={control} />;
      case 'checkbox':
        return <CheckboxField key={fieldName} {...commonProps} control={control} />;
      case 'date':
      case 'datetime':
      case 'time':
        return <DateField key={fieldName} {...commonProps} register={register} />;
      default:
        return <TextField key={fieldName} {...commonProps} register={register} />;
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>
          {field.title || name}
          {field.description && (
            <span className="text-sm text-muted-foreground ml-2">({field.description})</span>
          )}
        </Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addRow}
          disabled={disabled}
        >
          <Icons.Plus className="size-4 mr-2" />
          Add Row
        </Button>
      </div>

      {options.help && !error && (
        <p className="text-sm text-muted-foreground">{options.help}</p>
      )}

      {/* Grid */}
      <div className="space-y-3">
        {fields.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="text-muted-foreground">
              <Icons.Rows className="size-12 mx-auto mb-4 opacity-50" />
              <p>No rows yet. Click "Add Row" to get started.</p>
            </div>
          </Card>
        ) : (
          fields.map((item, index) => (
            <Card
              key={item.id}
              draggable={!disabled}
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`p-4 ${draggedIndex === index ? 'opacity-50' : ''} ${
                !disabled ? 'cursor-move' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Drag Handle */}
                {!disabled && (
                  <div className="pt-2 text-muted-foreground">
                    <Icons.Menu className="size-5" />
                  </div>
                )}

                {/* Row Number */}
                <div className="pt-2 text-sm font-semibold text-muted-foreground min-w-[24px]">
                  {index + 1}
                </div>

                {/* Fields */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {itemSchema.properties && Object.entries(itemSchema.properties).map(([fieldKey, fieldSchema]) => (
                    <div key={fieldKey}>
                      {renderFieldInRow(index, fieldKey, fieldSchema as JSONSchemaProperty)}
                    </div>
                  ))}
                </div>

                {/* Remove Button */}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(index)}
                  disabled={disabled}
                  className="shrink-0"
                >
                  <Icons.Trash className="size-4" />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Row Count */}
      {fields.length > 0 && (
        <div className="text-xs text-muted-foreground text-right">
          {fields.length} {fields.length === 1 ? 'row' : 'rows'}
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive">{(error as any).message}</p>
      )}
    </div>
  );
}
