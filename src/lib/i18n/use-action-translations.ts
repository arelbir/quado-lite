import { useTranslations } from 'next-intl';

export function useActionTranslations() {
  const t = useTranslations('action');
  
  return {
    // Page
    newAction: t('newAction'),
    createActionFor: t('createActionFor'),
    actionDetails: t('actionDetails'),
    
    // Finding Context
    findingContext: t('findingContext'),
    findingDetails: t('findingDetails'),
    
    // Form - Details
    detailsLabel: t('detailsLabel'),
    detailsPlaceholder: t('detailsPlaceholder'),
    detailsDescription: t('detailsDescription'),
    
    // Form - Assigned To
    assignedToLabel: t('assignedToLabel'),
    assignedToDescription: t('assignedToDescription'),
    assignedToPlaceholder: t('assignedToPlaceholder'),
    
    // Form - Manager
    managerLabel: t('managerLabel'),
    managerDescription: t('managerDescription'),
    managerPlaceholder: t('managerPlaceholder'),
    
    // Form - Due Date
    dueDateLabel: t('dueDateLabel'),
    dueDateDescription: t('dueDateDescription'),
    dueDatePlaceholder: t('dueDatePlaceholder'),
    
    // Workflow
    workflowInfo: t('workflowInfo'),
    workflowDescription: t('workflowDescription'),
    workflowSteps: {
      assigned: t('workflowSteps.assigned'),
      assignedDesc: t('workflowSteps.assignedDesc'),
      inProgress: t('workflowSteps.inProgress'),
      inProgressDesc: t('workflowSteps.inProgressDesc'),
      approval: t('workflowSteps.approval'),
      approvalDesc: t('workflowSteps.approvalDesc'),
      completed: t('workflowSteps.completed'),
      completedDesc: t('workflowSteps.completedDesc'),
    },
    
    // Buttons
    createButton: t('createButton'),
    cancelButton: t('cancelButton'),
    backButton: t('backButton'),
    
    // Validation
    validation: {
      detailsRequired: t('validation.detailsRequired'),
      detailsMinLength: t('validation.detailsMinLength'),
      assignedToRequired: t('validation.assignedToRequired'),
      invalidUserId: t('validation.invalidUserId'),
      dueDateInvalid: t('validation.dueDateInvalid'),
    },
    
    // Toast
    toast: {
      createSuccess: t('toast.createSuccess'),
      createError: t('toast.createError'),
      createErrorGeneric: t('toast.createErrorGeneric'),
      loading: t('toast.loading'),
    },
  };
}
