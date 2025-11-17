'use client';

/**
 * WIZARD FORM RENDERER
 * Renders multi-page forms with step navigation
 */

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { WizardFormSchema, WizardState, getStepFields, calculateWizardProgress } from '../../types/wizard-schema';
import { formSchemaToZod } from '../../lib/validation-engine';
import { WizardProgress } from './WizardProgress';
import { WizardNavigation } from './WizardNavigation';
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
} from '../fields';
import { RadioField } from '../fields/RadioField';
import { CheckboxesField } from '../fields/CheckboxesField';
import { SignatureField } from '../fields/SignatureField';
import { RatingField } from '../fields/RatingField';

interface WizardRendererProps {
  schema: WizardFormSchema;
  defaultValues?: Record<string, any>;
  onSubmit: (data: Record<string, any>) => void | Promise<void>;
  onSaveDraft?: (data: Record<string, any>, currentStep: number) => void | Promise<void>;
  submitLabel?: string;
}

export function WizardRenderer({
  schema,
  defaultValues,
  onSubmit,
  onSaveDraft,
  submitLabel = 'Submit',
}: WizardRendererProps) {
  const { steps, autoSave, autoSaveInterval = 30 } = schema['ui:wizard'];
  
  const [wizardState, setWizardState] = useState<WizardState>({
    currentStep: 0,
    completedSteps: [],
    visitedSteps: [0],
    stepData: {},
    errors: {},
    isDirty: false,
  });

  const zodSchema = formSchemaToZod(schema);
  
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    trigger,
    getValues,
  } = useForm({
    resolver: zodResolver(zodSchema),
    defaultValues,
    mode: 'onChange',
  });

  const formData = watch();
  const currentStepFields = getStepFields(schema, wizardState.currentStep);

  // Auto-save functionality
  useEffect(() => {
    if (!autoSave || !onSaveDraft) return;

    const interval = setInterval(() => {
      if (wizardState.isDirty) {
        const data = getValues();
        onSaveDraft(data, wizardState.currentStep);
        setWizardState(prev => ({ ...prev, isDirty: false, lastSaved: new Date() }));
      }
    }, autoSaveInterval * 1000);

    return () => clearInterval(interval);
  }, [autoSave, autoSaveInterval, onSaveDraft, wizardState.isDirty, wizardState.currentStep, getValues]);

  // Mark as dirty when data changes
  useEffect(() => {
    setWizardState(prev => ({ ...prev, isDirty: true }));
  }, [formData]);

  const goToStep = useCallback(async (stepIndex: number) => {
    // Validate current step if going forward
    if (stepIndex > wizardState.currentStep) {
      const currentStep = steps[wizardState.currentStep];
      if (!currentStep) return;
      const fieldKeys = currentStep.fields;
      
      const isValid = await trigger(fieldKeys as any);
      if (!isValid) return;
      
      // Mark current step as completed
      if (!wizardState.completedSteps.includes(wizardState.currentStep)) {
        setWizardState(prev => ({
          ...prev,
          completedSteps: [...prev.completedSteps, wizardState.currentStep],
        }));
      }
    }

    setWizardState(prev => ({
      ...prev,
      currentStep: stepIndex,
      visitedSteps: prev.visitedSteps.includes(stepIndex)
        ? prev.visitedSteps
        : [...prev.visitedSteps, stepIndex],
    }));

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [wizardState, steps, trigger]);

  const goBack = useCallback(() => {
    if (wizardState.currentStep > 0) {
      goToStep(wizardState.currentStep - 1);
    }
  }, [wizardState.currentStep, goToStep]);

  const goNext = useCallback(async () => {
    if (wizardState.currentStep < steps.length - 1) {
      await goToStep(wizardState.currentStep + 1);
    }
  }, [wizardState.currentStep, steps.length, goToStep]);

  const canGoBack = wizardState.currentStep > 0;
  const canGoNext = wizardState.currentStep < steps.length - 1;
  const canSubmit = wizardState.currentStep === steps.length - 1;

  const handleFinalSubmit = async (data: Record<string, any>) => {
    // Validate current step
    const currentStep = steps[wizardState.currentStep];
    if (!currentStep) return;
    const fieldKeys = currentStep.fields;
    const isValid = await trigger(fieldKeys as any);
    
    if (!isValid) return;

    await onSubmit(data);
  };

  // Render field based on type
  const renderField = (fieldName: string) => {
    const field = currentStepFields[fieldName];
    if (!field) return null;

    const widget = field['ui:widget'];
    const commonProps = {
      name: fieldName,
      field,
      errors,
    };

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
      default:
        return <TextField key={fieldName} {...commonProps} register={register} />;
    }
  };

  const currentStep = steps[wizardState.currentStep];
  
  if (!currentStep) {
    return <div>Invalid step</div>;
  }

  return (
    <form onSubmit={handleSubmit(handleFinalSubmit)} className="space-y-6">
      {/* Form Title */}
      {schema.title && (
        <div className="border-b pb-4">
          <h2 className="text-2xl font-bold">{schema.title}</h2>
          {schema.description && (
            <p className="text-muted-foreground mt-1">{schema.description}</p>
          )}
        </div>
      )}

      {/* Progress Indicator */}
      <WizardProgress
        schema={schema}
        state={wizardState}
        onStepClick={goToStep}
      />

      {/* Current Step */}
      <div className="min-h-[400px]">
        <div className="mb-6">
          <h3 className="text-xl font-semibold">{currentStep.title}</h3>
          {currentStep.description && (
            <p className="text-muted-foreground text-sm mt-1">
              {currentStep.description}
            </p>
          )}
        </div>

        {/* Step Fields */}
        <div className="space-y-4">
          {currentStep.fields.map(renderField)}
        </div>
      </div>

      {/* Auto-save indicator */}
      {autoSave && wizardState.lastSaved && (
        <div className="text-xs text-muted-foreground text-right">
          Last saved: {wizardState.lastSaved.toLocaleTimeString()}
        </div>
      )}

      {/* Navigation */}
      <WizardNavigation
        canGoBack={canGoBack}
        canGoNext={canGoNext}
        canSubmit={canSubmit}
        isSubmitting={isSubmitting}
        onBack={goBack}
        onNext={goNext}
        submitLabel={submitLabel}
        currentStep={wizardState.currentStep + 1}
        totalSteps={steps.length}
      />
    </form>
  );
}
