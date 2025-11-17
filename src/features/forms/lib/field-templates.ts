/**
 * FIELD TEMPLATES
 * Pre-configured field types for the form builder
 */

import { FieldTemplate } from '../types/json-schema';

export const fieldTemplates: FieldTemplate[] = [
  // ============================================================================
  // BASIC FIELDS
  // ============================================================================
  {
    id: 'text',
    type: 'text',
    label: 'Text Input',
    icon: 'Type',
    category: 'basic',
    description: 'Single line text input',
    defaultSchema: {
      type: 'string',
      title: 'Text Field',
      'ui:widget': 'text',
      'ui:options': {
        placeholder: 'Enter text...',
      },
    },
  },
  {
    id: 'textarea',
    type: 'textarea',
    label: 'Text Area',
    icon: 'AlignLeft',
    category: 'basic',
    description: 'Multi-line text input',
    defaultSchema: {
      type: 'string',
      title: 'Text Area',
      'ui:widget': 'textarea',
      'ui:options': {
        placeholder: 'Enter text...',
        rows: 4,
      },
    },
  },
  {
    id: 'number',
    type: 'number',
    label: 'Number',
    icon: 'Hash',
    category: 'basic',
    description: 'Numeric input',
    defaultSchema: {
      type: 'number',
      title: 'Number Field',
      'ui:widget': 'number',
    },
  },
  
  // ============================================================================
  // INPUT FIELDS
  // ============================================================================
  {
    id: 'email',
    type: 'email',
    label: 'Email',
    icon: 'Mail',
    category: 'input',
    description: 'Email address input',
    defaultSchema: {
      type: 'string',
      format: 'email',
      title: 'Email',
      'ui:widget': 'email',
      'ui:options': {
        placeholder: 'email@example.com',
      },
    },
  },
  {
    id: 'tel',
    type: 'tel',
    label: 'Phone',
    icon: 'Phone',
    category: 'input',
    description: 'Phone number input',
    defaultSchema: {
      type: 'string',
      title: 'Phone Number',
      'ui:widget': 'tel',
      'ui:options': {
        placeholder: '+90 555 123 45 67',
      },
    },
  },
  {
    id: 'url',
    type: 'url',
    label: 'URL',
    icon: 'Link',
    category: 'input',
    description: 'Website URL input',
    defaultSchema: {
      type: 'string',
      format: 'uri',
      title: 'URL',
      'ui:widget': 'url',
      'ui:options': {
        placeholder: 'https://example.com',
      },
    },
  },
  
  // ============================================================================
  // SELECTION FIELDS
  // ============================================================================
  {
    id: 'select',
    type: 'select',
    label: 'Dropdown',
    icon: 'ChevronDown',
    category: 'selection',
    description: 'Single selection dropdown',
    defaultSchema: {
      type: 'string',
      title: 'Select',
      'ui:widget': 'select',
      enum: ['Option 1', 'Option 2', 'Option 3'],
      enumNames: ['Option 1', 'Option 2', 'Option 3'],
    },
  },
  {
    id: 'radio',
    type: 'radio',
    label: 'Radio Group',
    icon: 'CircleDot',
    category: 'selection',
    description: 'Single selection radio buttons',
    defaultSchema: {
      type: 'string',
      title: 'Radio Group',
      'ui:widget': 'radio',
      enum: ['Option 1', 'Option 2', 'Option 3'],
      enumNames: ['Option 1', 'Option 2', 'Option 3'],
      'ui:options': {
        inline: false,
      },
    },
  },
  {
    id: 'checkbox',
    type: 'checkbox',
    label: 'Checkbox',
    icon: 'CheckSquare',
    category: 'selection',
    description: 'Single checkbox',
    defaultSchema: {
      type: 'boolean',
      title: 'Checkbox',
      'ui:widget': 'checkbox',
      default: false,
    },
  },
  {
    id: 'checkboxes',
    type: 'checkboxes',
    label: 'Checkboxes',
    icon: 'ListChecks',
    category: 'selection',
    description: 'Multiple checkboxes',
    defaultSchema: {
      type: 'array',
      title: 'Checkboxes',
      'ui:widget': 'checkboxes',
      items: {
        type: 'string',
        enum: ['Option 1', 'Option 2', 'Option 3'],
      },
      uniqueItems: true,
    },
  },
  
  // ============================================================================
  // DATE & TIME
  // ============================================================================
  {
    id: 'date',
    type: 'date',
    label: 'Date',
    icon: 'Calendar',
    category: 'input',
    description: 'Date picker',
    defaultSchema: {
      type: 'string',
      format: 'date',
      title: 'Date',
      'ui:widget': 'date',
    },
  },
  {
    id: 'datetime',
    type: 'datetime',
    label: 'Date & Time',
    icon: 'CalendarClock',
    category: 'input',
    description: 'Date and time picker',
    defaultSchema: {
      type: 'string',
      format: 'date-time',
      title: 'Date & Time',
      'ui:widget': 'datetime',
    },
  },
  {
    id: 'time',
    type: 'time',
    label: 'Time',
    icon: 'Clock',
    category: 'input',
    description: 'Time picker',
    defaultSchema: {
      type: 'string',
      format: 'time',
      title: 'Time',
      'ui:widget': 'time',
    },
  },
  
  // ============================================================================
  // ADVANCED FIELDS
  // ============================================================================
  {
    id: 'file',
    type: 'file',
    label: 'File Upload',
    icon: 'Upload',
    category: 'advanced',
    description: 'Single file upload',
    defaultSchema: {
      type: 'string',
      title: 'File Upload',
      'ui:widget': 'file',
      'ui:options': {
        accept: '*/*',
      },
    },
  },
  {
    id: 'files',
    type: 'files',
    label: 'Multiple Files',
    icon: 'Files',
    category: 'advanced',
    description: 'Multiple file upload',
    defaultSchema: {
      type: 'array',
      title: 'File Upload',
      'ui:widget': 'files',
      'ui:options': {
        accept: '*/*',
        multiple: true,
      },
      items: {
        type: 'string',
      },
    },
  },
  {
    id: 'signature',
    type: 'signature',
    label: 'Signature',
    icon: 'PenTool',
    category: 'advanced',
    description: 'Digital signature pad',
    defaultSchema: {
      type: 'string',
      title: 'Signature',
      'ui:widget': 'signature',
    },
  },
  {
    id: 'richtext',
    type: 'richtext',
    label: 'Rich Text',
    icon: 'FileText',
    category: 'advanced',
    description: 'Rich text editor',
    defaultSchema: {
      type: 'string',
      title: 'Rich Text',
      'ui:widget': 'richtext',
    },
  },
  {
    id: 'rating',
    type: 'rating',
    label: 'Rating',
    icon: 'Star',
    category: 'advanced',
    description: 'Star rating',
    defaultSchema: {
      type: 'number',
      title: 'Rating',
      'ui:widget': 'rating',
      minimum: 1,
      maximum: 5,
    },
  },
  
  // ============================================================================
  // AUDIT SPECIFIC
  // ============================================================================
  {
    id: 'datagrid',
    type: 'datagrid',
    label: 'Data Grid',
    icon: 'Table',
    category: 'audit',
    description: 'Repeatable data rows',
    defaultSchema: {
      type: 'array',
      title: 'Data Grid',
      'ui:widget': 'datagrid',
      items: {
        type: 'object',
        properties: {
          item: {
            type: 'string',
            title: 'Item',
          },
          value: {
            type: 'string',
            title: 'Value',
          },
        },
      },
    },
  },
];

/**
 * Get field template by type
 */
export function getFieldTemplate(type: string): FieldTemplate | undefined {
  return fieldTemplates.find((t) => t.type === type);
}

/**
 * Get templates by category
 */
export function getFieldTemplatesByCategory(category: string): FieldTemplate[] {
  return fieldTemplates.filter((t) => t.category === category);
}

/**
 * Get all categories
 */
export function getFieldCategories(): string[] {
  return Array.from(new Set(fieldTemplates.map((t) => t.category)));
}
