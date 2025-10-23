/**
 * SOLID Prensipleri - Type Definitions
 * 
 * DIP (Dependency Inversion Principle):
 * - High-level components depend on abstractions (interfaces)
 * - Not on concrete implementations
 * 
 * ISP (Interface Segregation Principle):
 * - Small, focused interfaces
 */

// Base interface - Common properties for all tasks
export interface BaseTaskItem {
  id: string;
  title: string;
  description?: string;
  status: string;
  link: string;
  createdAt?: Date;
}

// Specific task types (LSP - Liskov Substitution)
export interface ActionTask extends BaseTaskItem {
  type: "action";
  assignedTo?: {
    id: string;
    name: string;
  } | null;
  finding?: {
    id: string;
    details: string;
  } | null;
}

export interface DofTask extends BaseTaskItem {
  type: "dof";
  problemTitle?: string;
  assignedTo?: {
    id: string;
    name: string;
  } | null;
  finding?: {
    id: string;
    details: string;
  } | null;
}

export interface ApprovalTask extends BaseTaskItem {
  type: "approval";
  itemType: "action" | "dof";
  assignedTo?: {
    id: string;
    name: string;
  } | null;
}

export interface FindingTask extends BaseTaskItem {
  type: "finding";
  audit?: {
    id: string;
    title: string;
  } | null;
  assignedTo?: {
    id: string;
    name: string;
  } | null;
}

// Union type - Any task type (LSP)
export type TaskItem = ActionTask | DofTask | ApprovalTask | FindingTask;

// Task category for grouping
export interface TaskCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  tasks: TaskItem[];
  count: number;
  emptyMessage: string;
}

// Summary stats
export interface TaskSummary {
  totalActions: number;
  pendingActions: number;
  totalDofs: number;
  totalApprovals: number;
  totalFindings: number;
}
