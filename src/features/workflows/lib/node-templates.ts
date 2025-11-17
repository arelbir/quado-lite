/**
 * NODE TEMPLATES
 * Pre-configured node templates for quick workflow building
 */

export interface NodeTemplate {
  id: string;
  name: string;
  description: string;
  type: 'start' | 'process' | 'end' | 'decision' | 'approval';
  icon: string;
  color: string;
  defaultData: Record<string, any>;
  category: 'basic' | 'approval' | 'review' | 'conditional';
}

export const nodeTemplates: NodeTemplate[] = [
  // BASIC TEMPLATES
  {
    id: 'simple-task',
    name: 'Simple Task',
    description: 'Basic process step with 24h deadline',
    type: 'process',
    icon: 'CheckCircle2',
    color: 'text-blue-500',
    category: 'basic',
    defaultData: {
      label: 'New Task',
      assignedRole: '',
      deadlineHours: 24,
      description: '',
    },
  },
  {
    id: 'urgent-task',
    name: 'Urgent Task',
    description: 'High priority task with 4h deadline',
    type: 'process',
    icon: 'AlertCircle',
    color: 'text-orange-500',
    category: 'basic',
    defaultData: {
      label: 'Urgent Task',
      assignedRole: '',
      deadlineHours: 4,
      priority: 'high',
      description: 'Requires immediate attention',
    },
  },
  {
    id: 'long-task',
    name: 'Long-term Task',
    description: 'Extended task with 7 day deadline',
    type: 'process',
    icon: 'Clock',
    color: 'text-blue-600',
    category: 'basic',
    defaultData: {
      label: 'Long-term Task',
      assignedRole: '',
      deadlineHours: 168, // 7 days
      description: '',
    },
  },

  // APPROVAL TEMPLATES
  {
    id: 'single-approval',
    name: 'Single Approval',
    description: 'One person approval required',
    type: 'approval',
    icon: 'ShieldCheck',
    color: 'text-purple-500',
    category: 'approval',
    defaultData: {
      label: 'Approval Required',
      approvers: [],
      approvalType: 'ANY',
      description: 'Single approver needed',
    },
  },
  {
    id: 'manager-approval',
    name: 'Manager Approval',
    description: 'Department manager approval',
    type: 'approval',
    icon: 'UserCheck',
    color: 'text-purple-600',
    category: 'approval',
    defaultData: {
      label: 'Manager Approval',
      approvers: [],
      approvalType: 'ALL',
      requiredRole: 'MANAGER',
      description: 'Requires manager approval',
    },
  },
  {
    id: 'multi-approval',
    name: 'Multi Approval',
    description: 'Multiple approvers (all must approve)',
    type: 'approval',
    icon: 'UsersRound',
    color: 'text-purple-700',
    category: 'approval',
    defaultData: {
      label: 'Multi-level Approval',
      approvers: [],
      approvalType: 'ALL',
      description: 'All approvers must approve',
    },
  },

  // CONDITIONAL TEMPLATES
  {
    id: 'yes-no-decision',
    name: 'Yes/No Decision',
    description: 'Simple binary decision point',
    type: 'decision',
    icon: 'GitBranch',
    color: 'text-yellow-500',
    category: 'conditional',
    defaultData: {
      label: 'Decision Point',
      condition: 'status === "approved"',
      description: 'Binary decision',
    },
  },
  {
    id: 'value-check',
    name: 'Value Check',
    description: 'Check if value meets condition',
    type: 'decision',
    icon: 'CheckSquare',
    color: 'text-yellow-600',
    category: 'conditional',
    defaultData: {
      label: 'Value Check',
      condition: 'amount > 1000',
      description: 'Conditional value check',
    },
  },
  {
    id: 'role-based-route',
    name: 'Role-based Routing',
    description: 'Route based on user role',
    type: 'decision',
    icon: 'UserCog',
    color: 'text-yellow-700',
    category: 'conditional',
    defaultData: {
      label: 'Role Check',
      condition: 'userRole === "MANAGER"',
      description: 'Route by role',
    },
  },

  // REVIEW TEMPLATES
  {
    id: 'document-review',
    name: 'Document Review',
    description: 'Review and provide feedback',
    type: 'process',
    icon: 'FileText',
    color: 'text-green-500',
    category: 'review',
    defaultData: {
      label: 'Document Review',
      assignedRole: 'REVIEWER',
      deadlineHours: 48,
      description: 'Review document and provide feedback',
      requiresAttachment: true,
    },
  },
  {
    id: 'quality-check',
    name: 'Quality Check',
    description: 'Quality assurance review',
    type: 'process',
    icon: 'ShieldAlert',
    color: 'text-green-600',
    category: 'review',
    defaultData: {
      label: 'Quality Check',
      assignedRole: 'QA',
      deadlineHours: 24,
      description: 'Quality assurance review',
      checklistRequired: true,
    },
  },
  {
    id: 'final-review',
    name: 'Final Review',
    description: 'Final approval review',
    type: 'approval',
    icon: 'CheckCheck',
    color: 'text-green-700',
    category: 'review',
    defaultData: {
      label: 'Final Review',
      approvers: [],
      approvalType: 'ALL',
      description: 'Final sign-off required',
      isFinal: true,
    },
  },
];

// Group templates by category
export const getTemplatesByCategory = (category: NodeTemplate['category']) => {
  return nodeTemplates.filter(t => t.category === category);
};

// Get template by ID
export const getTemplateById = (id: string) => {
  return nodeTemplates.find(t => t.id === id);
};

// Get all categories
export const templateCategories = [
  { id: 'basic', label: 'Basic Tasks', icon: 'CheckCircle2' },
  { id: 'approval', label: 'Approvals', icon: 'ShieldCheck' },
  { id: 'review', label: 'Reviews', icon: 'FileText' },
  { id: 'conditional', label: 'Decisions', icon: 'GitBranch' },
] as const;
