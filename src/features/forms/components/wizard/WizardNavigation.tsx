'use client';

/**
 * WIZARD NAVIGATION
 * Back/Next/Submit buttons for wizard
 */

import { Button } from '@/components/ui/button';
import { Icons } from '@/components/shared/icons';

interface WizardNavigationProps {
  canGoBack: boolean;
  canGoNext: boolean;
  canSubmit: boolean;
  isSubmitting?: boolean;
  onBack: () => void;
  onNext: () => void;
  submitLabel?: string;
  currentStep?: number;
  totalSteps?: number;
}

export function WizardNavigation({
  canGoBack,
  canGoNext,
  canSubmit,
  isSubmitting = false,
  onBack,
  onNext,
  submitLabel = 'Submit',
  currentStep,
  totalSteps,
}: WizardNavigationProps) {
  return (
    <div className="flex items-center justify-between pt-6 border-t">
      {/* Back Button */}
      <Button
        type="button"
        variant="outline"
        onClick={onBack}
        disabled={!canGoBack || isSubmitting}
      >
        <Icons.ChevronLeft className="size-4 mr-2" />
        Back
      </Button>

      {/* Step Counter */}
      {currentStep && totalSteps && (
        <span className="text-sm text-muted-foreground">
          Step {currentStep} of {totalSteps}
        </span>
      )}

      {/* Next/Submit Button */}
      {canGoNext ? (
        <Button
          type="button"
          onClick={onNext}
          disabled={isSubmitting}
        >
          Next
          <Icons.ChevronRight className="size-4 ml-2" />
        </Button>
      ) : canSubmit ? (
        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting && <Icons.Loader2 className="size-4 mr-2 animate-spin" />}
          {submitLabel}
        </Button>
      ) : null}
    </div>
  );
}
