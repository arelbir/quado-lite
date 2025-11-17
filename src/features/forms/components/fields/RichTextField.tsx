'use client';

/**
 * RICH TEXT EDITOR FIELD
 * WYSIWYG editor with formatting options
 */

import { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { JSONSchemaProperty } from '../../types/json-schema';
import { Control, Controller, FieldErrors } from 'react-hook-form';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';

// Dynamic import to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

interface RichTextFieldProps {
  name: string;
  field: JSONSchemaProperty;
  control: Control<any>;
  errors?: FieldErrors;
  disabled?: boolean;
}

// Quill toolbar configuration
const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ color: [] }, { background: [] }],
    ['link'],
    ['clean'],
  ],
};

const formats = [
  'header',
  'bold',
  'italic',
  'underline',
  'strike',
  'list',
  'bullet',
  'link',
  'color',
  'background',
];

export function RichTextField({ 
  name, 
  field, 
  control, 
  errors, 
  disabled 
}: RichTextFieldProps) {
  const [isMounted, setIsMounted] = useState(false);
  const error = errors?.[name];
  const options = field['ui:options'] || {};

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="space-y-2">
        <Label htmlFor={name}>
          {field.title || name}
          {field.description && (
            <span className="text-sm text-muted-foreground ml-2">({field.description})</span>
          )}
        </Label>
        <div className="h-[200px] border rounded-md bg-muted animate-pulse" />
      </div>
    );
  }

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
          <div className={error ? 'border-2 border-destructive rounded-md' : ''}>
            <ReactQuill
              theme="snow"
              value={formField.value || ''}
              onChange={formField.onChange}
              modules={modules}
              formats={formats}
              placeholder={options.placeholder || 'Enter text...'}
              readOnly={disabled}
              className="bg-background"
            />
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
