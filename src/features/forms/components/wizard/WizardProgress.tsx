'use client';

/**
 * WIZARD PROGRESS INDICATOR
 * Shows progress through wizard steps
 */

import { WizardFormSchema, WizardState } from '../../types/wizard-schema';
import { Icons } from '@/components/shared/icons';

// Simple cn utility
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

interface WizardProgressProps {
  schema: WizardFormSchema;
  state: WizardState;
  onStepClick?: (stepIndex: number) => void;
}

export function WizardProgress({ schema, state, onStepClick }: WizardProgressProps) {
  const { steps, progressType = 'steps', showStepNumbers = true, allowJumpToStep = true } = schema['ui:wizard'];
  const totalSteps = steps.length;
  const progress = Math.round((state.completedSteps.length / totalSteps) * 100);

  if (progressType === 'bar') {
    return (
      <div className="w-full mb-8">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Step {state.currentStep + 1} of {totalSteps}</span>
          <span>{progress}% Complete</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  }

  if (progressType === 'dots') {
    return (
      <div className="flex justify-center gap-2 mb-8">
        {steps.map((step, index) => (
          <button
            key={step.id}
            type="button"
            onClick={() => allowJumpToStep && state.completedSteps.includes(index) && onStepClick?.(index)}
            disabled={!allowJumpToStep || !state.completedSteps.includes(index)}
            className={cn(
              'size-3 rounded-full transition-all',
              index === state.currentStep && 'bg-primary ring-2 ring-primary ring-offset-2',
              index < state.currentStep && 'bg-primary',
              index > state.currentStep && 'bg-secondary',
              allowJumpToStep && state.completedSteps.includes(index) && 'cursor-pointer hover:scale-110'
            )}
            aria-label={`${step.title} - ${index < state.currentStep ? 'Completed' : index === state.currentStep ? 'Current' : 'Pending'}`}
          />
        ))}
      </div>
    );
  }

  // Default: steps view
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = state.completedSteps.includes(index);
          const isCurrent = index === state.currentStep;
          const isClickable = allowJumpToStep && (isCompleted || state.visitedSteps.includes(index));

          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step Circle */}
              <button
                type="button"
                onClick={() => isClickable && onStepClick?.(index)}
                disabled={!isClickable}
                className={cn(
                  'flex items-center justify-center size-10 rounded-full border-2 transition-all',
                  isCurrent && 'border-primary bg-primary text-primary-foreground',
                  isCompleted && !isCurrent && 'border-primary bg-primary text-primary-foreground',
                  !isCurrent && !isCompleted && 'border-muted bg-background text-muted-foreground',
                  isClickable && 'cursor-pointer hover:scale-110'
                )}
              >
                {isCompleted && !isCurrent ? (
                  <Icons.Check className="size-5" />
                ) : showStepNumbers ? (
                  <span className="font-semibold">{index + 1}</span>
                ) : (
                  <span className="size-2 rounded-full bg-current" />
                )}
              </button>

              {/* Step Label */}
              <div className="ml-3 flex-1">
                <div className={cn(
                  'text-sm font-medium',
                  isCurrent && 'text-foreground',
                  !isCurrent && 'text-muted-foreground'
                )}>
                  {step.title}
                </div>
                {step.description && (
                  <div className="text-xs text-muted-foreground line-clamp-1">
                    {step.description}
                  </div>
                )}
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className={cn(
                  'h-0.5 w-full mx-4',
                  isCompleted ? 'bg-primary' : 'bg-secondary'
                )} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
