/**
 * i18n Status Helpers
 * Helper functions for translated status labels
 */

'use client';

import { useTranslations } from 'next-intl';
import type { 
  AuditStatus, 
  PlanStatus, 
  FindingStatus, 
  ActionStatus, 
  ActionType,
  DofStatus, 
  RiskType, 
  ActivityType 
} from '@/lib/constants/status-labels';

/**
 * Get translated audit status label
 */
export function useAuditStatusLabel() {
  const t = useTranslations('status.audit');
  return (status: AuditStatus) => t(status);
}

/**
 * Get translated plan status label
 */
export function usePlanStatusLabel() {
  const t = useTranslations('status.plan');
  return (status: PlanStatus) => t(status);
}

/**
 * Get translated finding status label
 */
export function useFindingStatusLabel() {
  const t = useTranslations('status.finding');
  return (status: FindingStatus) => t(status);
}

/**
 * Get translated action status label
 */
export function useActionStatusLabel() {
  const t = useTranslations('status.action');
  return (status: ActionStatus) => t(status);
}

/**
 * Get translated action type label
 */
export function useActionTypeLabel() {
  const t = useTranslations('status.actionType');
  return (type: ActionType) => t(type);
}

/**
 * Get translated DOF status label
 */
export function useDofStatusLabel() {
  const t = useTranslations('status.dof');
  return (status: DofStatus) => t(status);
}

/**
 * Get translated risk type label
 */
export function useRiskTypeLabel() {
  const t = useTranslations('status.risk');
  return (type: RiskType) => t(type);
}

/**
 * Get translated activity type label
 */
export function useActivityTypeLabel() {
  const t = useTranslations('status.activity');
  return (type: ActivityType) => t(type);
}
