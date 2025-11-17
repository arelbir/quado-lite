'use client';

import { TextField } from './fields/TextField';
import { TextareaField } from './fields/TextareaField';
import { NumberField } from './fields/NumberField';
import { SelectField } from './fields/SelectField';
import { CheckboxField } from './fields/CheckboxField';
import { DateField } from './fields/DateField';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { CustomFieldDefinition } from '@/types/domain';

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

    case 'file':
      return (
        <div className="text-sm text-muted-foreground p-2 border rounded">
          Field type "file" not yet fully implemented (requires form integration)
        </div>
      );
      /* TODO: Implement with proper form integration
      return (
        <FormField
          control={form.control}
          name={field.name}
          render={({ field: formField }) => (
            <FormItem>
              <FormLabel>
                {field.label}
                {field.required && <span className="text-destructive ml-1">*</span>}
              </FormLabel>
              <FormControl>
                <input
                  type="file"
                  accept={field.validation?.fileTypes?.join(',') || '*'}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // TODO: Integrate with MinIO upload
                      formField.onChange(file.name);
                    }
                  }}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </FormControl>
              {field.helpText && <FormDescription>{field.helpText}</FormDescription>}
              <FormMessage />
            </FormItem>
          )}
        />
      );
      */

    case 'files':
      return (
        <FormField
          control={form.control}
          name={field.name}
          render={({ field: formField }) => (
            <FormItem>
              <FormLabel>
                {field.label}
                {field.required && <span className="text-destructive ml-1">*</span>}
              </FormLabel>
              <FormControl>
                <input
                  type="file"
                  multiple
                  accept={field.validation?.fileTypes?.join(',') || '*'}
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length > 0) {
                      // TODO: Integrate with MinIO upload
                      formField.onChange(files.map(f => f.name));
                    }
                  }}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </FormControl>
              {field.helpText && <FormDescription>{field.helpText}</FormDescription>}
              <FormMessage />
            </FormItem>
          )}
        />
      );
      */

    case 'user-picker':
      return (
        <div className="text-sm text-muted-foreground p-2 border rounded">
          Field type "user-picker" not yet fully implemented (requires form integration)
        </div>
      );
      /* TODO: Implement with proper form integration
      return (
        <FormField
          control={form.control}
          name={field.name}
          render={({ field: formField }) => (
            <FormItem>
              <FormLabel>
                {field.label}
                {field.required && <span className="text-destructive ml-1">*</span>}
              </FormLabel>
              <Select
                onValueChange={formField.onChange}
                defaultValue={formField.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select user..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {/* TODO: Load users from API */}
                  <SelectItem value="placeholder">Loading users...</SelectItem>
                </SelectContent>
              </Select>
              {field.helpText && <FormDescription>{field.helpText}</FormDescription>}
              <FormMessage />
            </FormItem>
          )}
        />
      );
      */
      
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
