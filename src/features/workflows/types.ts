/**
 * WORKFLOW TYPES - GENERIC & EXTENSIBLE
 * Framework-level types for workflow system
 * Domain-agnostic and reusable across any entity type
 */

/**
 * Generic workflow module configuration
 * Can be used for any entity type in the system
 */
export interface WorkflowModuleConfig {
  id: string;
  displayName: string;
  entityType: string;
  icon?: string;
  color?: string;
  description?: string;
}

/**
 * Workflow metadata for any entity
 */
export interface WorkflowMetadata {
  entityType: string;
  entityId: string;
  customFields?: Record<string, any>;
  [key: string]: any;
}

/**
 * Generic workflow status
 */
export type WorkflowStatus = 
  | 'DRAFT'
  | 'ACTIVE'
  | 'INACTIVE'
  | 'ARCHIVED'
  | 'COMPLETED';

/**
 * Node types for workflow builder
 */
export type WorkflowNodeType = 
  | 'start'
  | 'process'
  | 'end'
  | 'decision'
  | 'approval';

/**
 * Workflow instance state
 */
export interface WorkflowInstanceState {
  id: string;
  workflowDefinitionId: string;
  entityType: string;
  entityId: string;
  currentStepId?: string;
  status: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}
