/**
 * Custom Field Types
 * Types for hybrid form system with dynamic custom fields
 */

export type CustomFieldType =
  | 'text'           // Single line text
  | 'textarea'       // Multi-line text
  | 'number'         // Numeric input
  | 'email'          // Email with validation
  | 'url'            // URL with validation
  | 'phone'          // Phone number
  | 'select'         // Single select dropdown
  | 'multi-select'   // Multiple select
  | 'radio'          // Radio buttons
  | 'checkbox'       // Single checkbox
  | 'date'           // Date picker
  | 'datetime'       // Date + time picker
  | 'time'           // Time picker
  | 'file'           // File upload (single)
  | 'files'          // File upload (multiple)
  | 'user-picker'    // User selection
  | 'department-picker' // Department selection
  | 'color'          // Color picker
  | 'rating'         // Star rating (1-5)
  | 'slider';        // Numeric slider

// Generic entity type - can be any string (Document, Workflow, CustomEntity, etc.)
export type EntityType = string;

export type CustomFieldStatus = 'ACTIVE' | 'ARCHIVED';

export interface CustomFieldValidation {
  min?: number;
  max?: number;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  accept?: string[]; // For file uploads
  rows?: number; // For textarea
}

export interface CustomFieldOption {
  value: string;
  label: string;
  color?: string;
}

export interface CustomFieldDefinition {
  id: string;
  entityType: EntityType;
  fieldKey: string;
  fieldType: CustomFieldType;
  label: string;
  placeholder?: string;
  helpText?: string;
  required: boolean;
  validation?: CustomFieldValidation;
  options?: CustomFieldOption[];
  order: number;
  section?: string;
  status: CustomFieldStatus;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomFieldValue {
  id: string;
  definitionId: string;
  entityType: string;
  entityId: string;
  value: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomFieldWithValue {
  definition: CustomFieldDefinition;
  value: any;
}

/**
 * Form data structure
 */
export interface HybridFormData {
  core: Record<string, any>;
  custom: Record<string, any>;
}

/**
 * Field renderer props
 */
export interface FieldRendererProps {
  field: CustomFieldDefinition;
  value: any;
  onChange: (value: any) => void;
  disabled?: boolean;
}
