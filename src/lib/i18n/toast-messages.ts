/**
 * i18n Toast Messages
 * Centralized toast message helpers with translations
 */

'use client';

import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

/**
 * Hook for translated toast messages
 */
export function useToastMessages() {
  const tCommon = useTranslations('common');
  const tErrors = useTranslations('errors');
  const tAudit = useTranslations('audit');
  const tAction = useTranslations('action');
  const tFinding = useTranslations('finding');
  const tDof = useTranslations('dof');

  return {
    // Common success messages
    success: (message?: string) => {
      toast.success(message || tCommon('status.success'));
    },
    
    // Common error messages
    error: (message?: string) => {
      toast.error(message || tErrors('api.operationFailed'));
    },
    
    // Loading state
    loading: (message?: string) => {
      toast.loading(message || tCommon('status.loading'));
    },

    // Audit messages
    audit: {
      created: () => toast.success(tAudit('messages.created')),
      updated: () => toast.success(tAudit('messages.updated')),
      deleted: () => toast.success(tAudit('messages.deleted')),
      notFound: () => toast.error(tAudit('messages.notFound')),
    },

    // Action messages
    action: {
      created: () => toast.success(tAction('messages.created')),
      updated: () => toast.success(tAction('messages.updated')),
      deleted: () => toast.success(tAction('messages.deleted')),
      completed: () => toast.success(tAction('messages.completed')),
      approved: () => toast.success(tAction('messages.approved')),
      rejected: () => toast.success(tAction('messages.rejected')),
      cancelled: () => toast.success(tAction('messages.cancelled')),
      notFound: () => toast.error(tAction('messages.notFound')),
    },

    // Finding messages
    finding: {
      created: () => toast.success(tFinding('messages.created')),
      updated: () => toast.success(tFinding('messages.updated')),
      deleted: () => toast.success(tFinding('messages.deleted')),
      assigned: () => toast.success(tFinding('messages.assigned')),
      closed: () => toast.success(tFinding('messages.closed')),
      rejected: () => toast.success(tFinding('messages.rejected')),
      notFound: () => toast.error(tFinding('messages.notFound')),
    },

    // DOF messages
    dof: {
      created: () => toast.success(tDof('messages.created')),
      updated: () => toast.success(tDof('messages.updated')),
      deleted: () => toast.success(tDof('messages.deleted')),
      submitted: () => toast.success(tDof('messages.submitted')),
      approved: () => toast.success(tDof('messages.approved')),
      rejected: () => toast.success(tDof('messages.rejected')),
      stepCompleted: () => toast.success(tDof('messages.stepCompleted')),
      activityCompleted: () => toast.success(tDof('messages.activityCompleted')),
      notFound: () => toast.error(tDof('messages.notFound')),
    },

    // Validation errors
    validation: {
      required: () => toast.error(tErrors('validation.required')),
      email: () => toast.error(tErrors('validation.email')),
      invalidFormat: () => toast.error(tErrors('validation.invalidFormat')),
    },

    // Auth errors
    auth: {
      unauthorized: () => toast.error(tErrors('auth.unauthorized')),
      sessionExpired: () => toast.error(tErrors('auth.sessionExpired')),
      permissionDenied: () => toast.error(tErrors('auth.permissionDenied')),
    },
  };
}
