/**
 * i18n Button Labels
 * Centralized button label helpers
 */

'use client';

import { useTranslations } from 'next-intl';

/**
 * Hook for translated button labels
 */
export function useButtonLabels() {
  const t = useTranslations('common.actions');
  const tAudit = useTranslations('audit');
  const tAction = useTranslations('action');
  const tFinding = useTranslations('finding');
  const tDof = useTranslations('dof');

  return {
    // Common actions
    create: t('create'),
    edit: t('edit'),
    delete: t('delete'),
    cancel: t('cancel'),
    save: t('save'),
    submit: t('submit'),
    approve: t('approve'),
    reject: t('reject'),
    close: t('close'),
    download: t('download'),
    upload: t('upload'),
    export: t('export'),
    import: t('import'),
    search: t('search'),
    filter: t('filter'),
    clear: t('clear'),
    back: t('back'),
    next: t('next'),
    finish: t('finish'),
    view: t('view'),
    add: t('add'),
    remove: t('remove'),
    update: t('update'),

    // Module-specific
    audit: {
      create: tAudit('create'),
      edit: tAudit('edit'),
      delete: tAudit('delete'),
      view: tAudit('view'),
    },

    action: {
      create: tAction('create'),
      edit: tAction('edit'),
      delete: tAction('delete'),
      view: tAction('view'),
      complete: tAction('complete'),
      approve: tAction('approve'),
      reject: tAction('reject'),
      cancel: tAction('cancel'),
    },

    finding: {
      create: tFinding('create'),
      edit: tFinding('edit'),
      delete: tFinding('delete'),
      view: tFinding('view'),
      assign: tFinding('assign'),
      close: tFinding('close'),
    },

    dof: {
      create: tDof('create'),
      edit: tDof('edit'),
      delete: tDof('delete'),
      view: tDof('view'),
      submit: tDof('submit'),
      approve: tDof('approve'),
      reject: tDof('reject'),
    },
  };
}
