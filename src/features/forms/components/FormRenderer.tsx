'use client';

/**
 * FORM RENDERER COMPONENT
 * Dynamic form renderer based on JSON Schema
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormSchema } from '../types/json-schema';
import { formSchemaToZod, evaluateConditional } from '../lib/validation-engine';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/shared/icons';
import {
  TextField,
  TextAreaField,
  NumberField,
  SelectField,
  CheckboxField,
  DateField,
  FileField,
  DataGridField,
} from './fields';
import { RadioField } from './fields/RadioField';
import { CheckboxesField } from './fields/CheckboxesField';
import { SignatureField } from './fields/SignatureField';
import { RatingField } from './fields/RatingField';
import { RichTextField } from './fields/RichTextField';

interface FormRendererProps {
  schema: FormSchema;
  defaultValues?: Record<string, any>;
  onSubmit: (data: Record<string, any>) => void | Promise<void>;
  submitLabel?: string;
  disabled?: boolean;
  readOnly?: boolean;
}

export function FormRenderer({
  schema,
  defaultValues,
  onSubmit,
  submitLabel = 'Submit',
  disabled = false,
  readOnly = false,
}: FormRendererProps) {
  const zodSchema = formSchemaToZod(schema);
  
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(zodSchema),
    defaultValues,
  });

  const formData = watch();

  // Get field order
  const fieldOrder = schema['ui:order'] || Object.keys(schema.properties);

  // Render field based on type
  const renderField = (fieldName: string) => {
    const field = schema.properties[fieldName];
    if (!field) return null;

    // Check conditional logic
    if (field['ui:conditional']) {
      const shouldShow = evaluateConditional(field['ui:conditional'], formData);
      if (!shouldShow) return null;
    }

    const widget = field['ui:widget'];
    const commonProps = {
      name: fieldName,
      field,
      errors,
      disabled: disabled || readOnly,
    };

    // Select appropriate component
    switch (widget) {
      case 'textarea':
        return <TextAreaField key={fieldName} {...commonProps} register={register} />;
      
      case 'number':
        return <NumberField key={fieldName} {...commonProps} register={register} />;
      
      case 'select':
      case 'multiselect':
        return <SelectField key={fieldName} {...commonProps} control={control} />;
      
      case 'checkbox':
        return <CheckboxField key={fieldName} {...commonProps} control={control} />;
      
      case 'checkboxes':
        return <CheckboxesField key={fieldName} {...commonProps} control={control} />;
      
      case 'radio':
        return <RadioField key={fieldName} {...commonProps} control={control} />;
      
      case 'date':
      case 'datetime':
      case 'time':
        return <DateField key={fieldName} {...commonProps} register={register} />;
      
      case 'file':
      case 'files':
        return <FileField key={fieldName} {...commonProps} control={control} />;
      
      case 'signature':
        return <SignatureField key={fieldName} {...commonProps} control={control} />;
      
      case 'rating':
        return <RatingField key={fieldName} {...commonProps} control={control} />;
      
      case 'datagrid':
        return <DataGridField key={fieldName} {...commonProps} control={control} register={register} />;
      
      case 'richtext':
        return <RichTextField key={fieldName} {...commonProps} control={control} />;
      
      default:
        // Text input (email, tel, url, password, text)
        return <TextField key={fieldName} {...commonProps} register={register} readOnly={readOnly} />;
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Form Title */}
      {schema.title && (
        <div className="border-b pb-4">
          <h2 className="text-2xl font-bold">{schema.title}</h2>
          {schema.description && (
            <p className="text-muted-foreground mt-1">{schema.description}</p>
          )}
        </div>
      )}

      {/* Form Fields */}
      <div className="space-y-4">
        {fieldOrder.map(renderField)}
      </div>

      {/* Submit Button */}
      {!readOnly && (
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button type="submit" disabled={disabled || isSubmitting}>
            {isSubmitting && <Icons.Loader2 className="size-4 mr-2 animate-spin" />}
            {submitLabel}
          </Button>
        </div>
      )}
    </form>
  );
}
