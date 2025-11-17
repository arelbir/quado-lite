/**
 * WIZARD (MULTI-PAGE) FORM SCHEMA
 * Extension for multi-step forms
 */

import { FormSchema, JSONSchemaProperty } from './json-schema';

/**
 * Wizard Step
 */
export interface WizardStep {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  
  // Fields in this step
  fields: string[]; // Array of field keys
  
  // Validation
  validateOnNext?: boolean; // Validate when clicking Next
  required?: boolean; // All fields must be filled
  
  // Conditional display
  condition?: {
    field: string;
    operator: '==' | '!=' | '>' | '<' | '>=' | '<=' | 'contains';
    value: any;
  };
  
  // UI
  order?: number;
  skippable?: boolean; // Can skip this step
}

/**
 * Wizard Schema (extends FormSchema)
 */
export interface WizardFormSchema extends FormSchema {
  // Wizard-specific config
  'ui:wizard': {
    enabled: true;
    steps: WizardStep[];
    
    // Progress display
    showProgress?: boolean;
    progressType?: 'bar' | 'steps' | 'dots';
    
    // Navigation
    showStepNumbers?: boolean;
    allowJumpToStep?: boolean; // Click on completed steps
    
    // Persistence
    autoSave?: boolean; // Auto-save draft
    autoSaveInterval?: number; // Seconds
    
    // Completion
    showReviewStep?: boolean; // Final review before submit
    reviewStepTitle?: string;
  };
}

/**
 * Wizard State
 */
export interface WizardState {
  currentStep: number;
  completedSteps: number[];
  visitedSteps: number[];
  stepData: Record<number, Record<string, any>>; // Data per step
  errors: Record<number, Record<string, string[]>>; // Errors per step
  isDirty: boolean;
  lastSaved?: Date;
}

/**
 * Wizard Navigation
 */
export interface WizardNavigation {
  canGoBack: boolean;
  canGoNext: boolean;
  canSubmit: boolean;
  canJumpTo: (stepIndex: number) => boolean;
  goToStep: (stepIndex: number) => void;
  goBack: () => void;
  goNext: () => void;
  submit: () => void;
}

/**
 * Helper: Check if form is wizard
 */
export function isWizardForm(schema: FormSchema): schema is WizardFormSchema {
  return 'ui:wizard' in schema && (schema as any)['ui:wizard']?.enabled === true;
}

/**
 * Helper: Get step fields
 */
export function getStepFields(
  schema: WizardFormSchema,
  stepIndex: number
): Record<string, JSONSchemaProperty> {
  const step = schema['ui:wizard'].steps[stepIndex];
  if (!step) return {};
  
  const fields: Record<string, JSONSchemaProperty> = {};
  step.fields.forEach((fieldKey) => {
    if (schema.properties[fieldKey]) {
      fields[fieldKey] = schema.properties[fieldKey];
    }
  });
  
  return fields;
}

/**
 * Helper: Calculate wizard progress
 */
export function calculateWizardProgress(state: WizardState, totalSteps: number): number {
  return Math.round((state.completedSteps.length / totalSteps) * 100);
}

/**
 * Helper: Get uncompleted required steps
 */
export function getUncompletedSteps(
  schema: WizardFormSchema,
  state: WizardState
): number[] {
  return schema['ui:wizard'].steps
    .map((step, index) => ({ step, index }))
    .filter(({ step, index }) => 
      step.required && !state.completedSteps.includes(index)
    )
    .map(({ index }) => index);
}
