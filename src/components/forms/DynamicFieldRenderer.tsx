'use client';

import { TextField } from './fields/TextField';
import { NumberField } from './fields/NumberField';
import { SelectField } from './fields/SelectField';
import { TextareaField } from './fields/TextareaField';
import { CheckboxField } from './fields/CheckboxField';
import { DateField } from './fields/DateField';
import type { CustomFieldDefinition } from '@/lib/types';

interface DynamicFieldRendererProps {
  field: CustomFieldDefinition;
  value: any;
  onChange: (value: any) => void;
  disabled?: boolean;
}

/**
 * DynamicFieldRenderer - Renders appropriate field component based on field type
 */
export function DynamicFieldRenderer({
  field,
  value,
  onChange,
  disabled,
}: DynamicFieldRendererProps) {
  const commonProps = {
    field,
    value,
    onChange,
    disabled,
  };

  switch (field.fieldType) {
    case 'text':
    case 'email':
    case 'url':
    case 'phone':
      return <TextField {...commonProps} />;

    case 'number':
      return <NumberField {...commonProps} />;

    case 'textarea':
      return <TextareaField {...commonProps} />;

    case 'select':
    case 'radio':
      return <SelectField {...commonProps} />;

    case 'checkbox':
      return <CheckboxField {...commonProps} />;

    case 'date':
    case 'datetime':
    case 'time':
      return <DateField {...commonProps} />;

    // TODO: Implement remaining field types
    case 'file':
    case 'files':
    case 'user-picker':
    case 'department-picker':
    case 'multi-select':
    case 'color':
    case 'rating':
    case 'slider':
      return (
        <div className="text-sm text-muted-foreground p-2 border rounded">
          Field type "{field.fieldType}" not yet implemented
        </div>
      );

    default:
      console.warn(`Unsupported field type: ${field.fieldType}`);
      return null;
  }
}
