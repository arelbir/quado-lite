/**
 * JSON SCHEMA TYPES
 * Standard JSON Schema 7 based form definitions
 * Zero vendor lock-in - pure standard format
 */

/**
 * Base JSON Schema Property
 */
export interface JSONSchemaProperty {
  type: 'string' | 'number' | 'integer' | 'boolean' | 'object' | 'array';
  title?: string;
  description?: string;
  default?: any;
  
  // String validations
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  format?: 'email' | 'uri' | 'date' | 'date-time' | 'time';
  
  // Number validations
  minimum?: number;
  maximum?: number;
  multipleOf?: number;
  
  // Array validations
  minItems?: number;
  maxItems?: number;
  uniqueItems?: boolean;
  items?: JSONSchemaProperty;
  
  // Object properties
  properties?: Record<string, JSONSchemaProperty>;
  
  // Enum/Options
  enum?: any[];
  enumNames?: string[];
  
  // UI Hints (custom extension)
  'ui:widget'?: FormFieldType;
  'ui:options'?: {
    placeholder?: string;
    help?: string;
    rows?: number;
    accept?: string; // for file uploads
    multiple?: boolean;
    inline?: boolean;
  };
  
  // Conditional logic (custom extension)
  'ui:conditional'?: {
    field: string;
    operator: '==' | '!=' | '>' | '<' | '>=' | '<=' | 'contains' | 'notContains';
    value: any;
  };
  
  // Layout hints (custom extension)
  'ui:layout'?: {
    column?: 1 | 2 | 3 | 4 | 6 | 12; // Grid columns (out of 12)
    order?: number;
  };
}

/**
 * Complete Form Schema
 */
export interface FormSchema {
  $schema: 'http://json-schema.org/draft-07/schema#';
  $id?: string;
  title: string;
  description?: string;
  type: 'object';
  properties: Record<string, JSONSchemaProperty>;
  required?: string[];
  
  // Conditional dependencies
  dependencies?: Record<string, string[] | JSONSchemaProperty>;
  
  // Form-level UI config
  'ui:order'?: string[];
  'ui:layout'?: {
    type?: 'single' | 'wizard' | 'accordion';
    columns?: number;
  };
}

/**
 * Form Field Types (UI Widgets)
 */
export type FormFieldType =
  | 'text'
  | 'email'
  | 'tel'
  | 'url'
  | 'password'
  | 'number'
  | 'textarea'
  | 'select'
  | 'multiselect'
  | 'radio'
  | 'checkbox'
  | 'checkboxes'
  | 'date'
  | 'datetime'
  | 'time'
  | 'file'
  | 'files'
  | 'signature'
  | 'richtext'
  | 'rating'
  | 'datagrid'
  | 'hidden';

/**
 * Form Definition (Database model)
 */
export interface FormDefinition {
  id: string;
  name: string;
  description?: string;
  schema: FormSchema;
  version: number;
  status: 'draft' | 'published' | 'archived';
  tags?: string[];
  category?: string;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdById: string;
  updatedById?: string;
  
  // Workflow integration
  workflowId?: string;
  workflowNodeId?: string;
}

/**
 * Form Submission
 */
export interface FormSubmission {
  id: string;
  formId: string;
  formVersion: number;
  data: Record<string, any>;
  
  // Status
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  
  // User info
  submittedBy?: string;
  submittedAt?: Date;
  
  // Workflow context
  workflowInstanceId?: string;
  workflowStepId?: string;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  
  // Files
  attachments?: {
    fieldName: string;
    files: {
      id: string;
      name: string;
      url: string;
      size: number;
      type: string;
    }[];
  }[];
}

/**
 * Validation Result
 */
export interface ValidationResult {
  valid: boolean;
  errors?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'min' | 'max' | 'custom';
}

/**
 * Field Template (for builder palette)
 */
export interface FieldTemplate {
  id: string;
  type: FormFieldType;
  label: string;
  icon: string;
  category: 'basic' | 'input' | 'selection' | 'advanced' | 'audit';
  description: string;
  defaultSchema: Partial<JSONSchemaProperty>;
}
