/**
 * WORKFLOW TEMPLATES
 * Complete pre-built workflow templates for quick deployment
 */

import { Node, Edge } from 'reactflow';

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: 'approval' | 'review' | 'escalation' | 'standard';
  icon: string;
  estimatedDuration: string;
  nodes: Omit<Node, 'id'>[];
  edges: Omit<Edge, 'id'>[];
  defaultModule?: 'DOF' | 'ACTION' | 'FINDING' | 'AUDIT';
}

export const workflowTemplates: WorkflowTemplate[] = [
  // SIMPLE APPROVAL WORKFLOW
  {
    id: 'simple-approval',
    name: 'Simple Approval',
    description: 'Basic approval workflow: Submit → Review → Approve/Reject → End',
    category: 'approval',
    icon: 'CheckCircle',
    estimatedDuration: '1-2 days',
    defaultModule: 'ACTION',
    nodes: [
      {
        type: 'start',
        position: { x: 250, y: 50 },
        data: { label: 'Start' },
      },
      {
        type: 'process',
        position: { x: 250, y: 150 },
        data: { 
          label: 'Submit Request',
          assignedRole: 'USER',
          deadlineHours: 2,
        },
      },
      {
        type: 'approval',
        position: { x: 250, y: 280 },
        data: { 
          label: 'Manager Approval',
          approvers: [],
          approvalType: 'ANY',
        },
      },
      {
        type: 'end',
        position: { x: 250, y: 400 },
        data: { label: 'End' },
      },
    ],
    edges: [
      { source: 'start', target: 'process' },
      { source: 'process', target: 'approval' },
      { source: 'approval', target: 'end' },
    ],
  },

  // MULTI-LEVEL APPROVAL
  {
    id: 'multi-level-approval',
    name: 'Multi-Level Approval',
    description: 'Sequential approval: Submit → L1 Approval → L2 Approval → End',
    category: 'approval',
    icon: 'Users',
    estimatedDuration: '3-5 days',
    defaultModule: 'DOF',
    nodes: [
      {
        type: 'start',
        position: { x: 250, y: 50 },
        data: { label: 'Start' },
      },
      {
        type: 'process',
        position: { x: 250, y: 150 },
        data: { 
          label: 'Submit Request',
          assignedRole: 'USER',
          deadlineHours: 4,
        },
      },
      {
        type: 'approval',
        position: { x: 250, y: 280 },
        data: { 
          label: 'Manager Approval',
          approvers: [],
          approvalType: 'ANY',
        },
      },
      {
        type: 'approval',
        position: { x: 250, y: 410 },
        data: { 
          label: 'Director Approval',
          approvers: [],
          approvalType: 'ALL',
        },
      },
      {
        type: 'end',
        position: { x: 250, y: 540 },
        data: { label: 'End' },
      },
    ],
    edges: [
      { source: 'start', target: 'process' },
      { source: 'process', target: 'approval-1' },
      { source: 'approval-1', target: 'approval-2' },
      { source: 'approval-2', target: 'end' },
    ],
  },

  // REVIEW WORKFLOW
  {
    id: 'review-workflow',
    name: 'Review & Feedback',
    description: 'Document review: Submit → Review → Revise → Final Approval',
    category: 'review',
    icon: 'FileText',
    estimatedDuration: '2-4 days',
    defaultModule: 'FINDING',
    nodes: [
      {
        type: 'start',
        position: { x: 250, y: 50 },
        data: { label: 'Start' },
      },
      {
        type: 'process',
        position: { x: 250, y: 150 },
        data: { 
          label: 'Submit Document',
          assignedRole: 'AUTHOR',
          deadlineHours: 24,
        },
      },
      {
        type: 'process',
        position: { x: 250, y: 280 },
        data: { 
          label: 'Review',
          assignedRole: 'REVIEWER',
          deadlineHours: 48,
        },
      },
      {
        type: 'decision',
        position: { x: 250, y: 410 },
        data: { 
          label: 'Changes Needed?',
          condition: 'revisionRequired === true',
        },
      },
      {
        type: 'process',
        position: { x: 100, y: 540 },
        data: { 
          label: 'Revise Document',
          assignedRole: 'AUTHOR',
          deadlineHours: 24,
        },
      },
      {
        type: 'approval',
        position: { x: 400, y: 540 },
        data: { 
          label: 'Final Approval',
          approvers: [],
          approvalType: 'ALL',
        },
      },
      {
        type: 'end',
        position: { x: 400, y: 670 },
        data: { label: 'End' },
      },
    ],
    edges: [
      { source: 'start', target: 'process-1' },
      { source: 'process-1', target: 'process-2' },
      { source: 'process-2', target: 'decision' },
      { source: 'decision', target: 'process-3', label: 'Yes' },
      { source: 'process-3', target: 'process-2' },
      { source: 'decision', target: 'approval', label: 'No' },
      { source: 'approval', target: 'end' },
    ],
  },

  // ESCALATION WORKFLOW
  {
    id: 'escalation-workflow',
    name: 'Auto-Escalation',
    description: 'Approval with auto-escalation if deadline exceeded',
    category: 'escalation',
    icon: 'AlertTriangle',
    estimatedDuration: '1-3 days',
    defaultModule: 'ACTION',
    nodes: [
      {
        type: 'start',
        position: { x: 250, y: 50 },
        data: { label: 'Start' },
      },
      {
        type: 'process',
        position: { x: 250, y: 150 },
        data: { 
          label: 'Submit Request',
          assignedRole: 'USER',
          deadlineHours: 2,
        },
      },
      {
        type: 'approval',
        position: { x: 250, y: 280 },
        data: { 
          label: 'Manager Approval',
          approvers: [],
          approvalType: 'ANY',
          deadlineHours: 24,
        },
      },
      {
        type: 'decision',
        position: { x: 250, y: 410 },
        data: { 
          label: 'Approved?',
          condition: 'status === "approved"',
        },
      },
      {
        type: 'approval',
        position: { x: 100, y: 540 },
        data: { 
          label: 'Escalate to Director',
          approvers: [],
          approvalType: 'ANY',
        },
      },
      {
        type: 'end',
        position: { x: 250, y: 670 },
        data: { label: 'End' },
      },
    ],
    edges: [
      { source: 'start', target: 'process' },
      { source: 'process', target: 'approval-1' },
      { source: 'approval-1', target: 'decision' },
      { source: 'decision', target: 'end', label: 'Approved' },
      { source: 'decision', target: 'approval-2', label: 'Timeout' },
      { source: 'approval-2', target: 'end' },
    ],
  },

  // PARALLEL APPROVAL
  {
    id: 'parallel-approval',
    name: 'Parallel Approval',
    description: 'Multiple approvers review simultaneously',
    category: 'approval',
    icon: 'Network',
    estimatedDuration: '1-2 days',
    defaultModule: 'AUDIT',
    nodes: [
      {
        type: 'start',
        position: { x: 250, y: 50 },
        data: { label: 'Start' },
      },
      {
        type: 'process',
        position: { x: 250, y: 150 },
        data: { 
          label: 'Submit Proposal',
          assignedRole: 'USER',
          deadlineHours: 4,
        },
      },
      {
        type: 'approval',
        position: { x: 100, y: 280 },
        data: { 
          label: 'Finance Approval',
          approvers: [],
          approvalType: 'ANY',
        },
      },
      {
        type: 'approval',
        position: { x: 250, y: 280 },
        data: { 
          label: 'Legal Approval',
          approvers: [],
          approvalType: 'ANY',
        },
      },
      {
        type: 'approval',
        position: { x: 400, y: 280 },
        data: { 
          label: 'Technical Approval',
          approvers: [],
          approvalType: 'ANY',
        },
      },
      {
        type: 'decision',
        position: { x: 250, y: 410 },
        data: { 
          label: 'All Approved?',
          condition: 'allApproved === true',
        },
      },
      {
        type: 'end',
        position: { x: 250, y: 540 },
        data: { label: 'End' },
      },
    ],
    edges: [
      { source: 'start', target: 'process' },
      { source: 'process', target: 'approval-1' },
      { source: 'process', target: 'approval-2' },
      { source: 'process', target: 'approval-3' },
      { source: 'approval-1', target: 'decision' },
      { source: 'approval-2', target: 'decision' },
      { source: 'approval-3', target: 'decision' },
      { source: 'decision', target: 'end' },
    ],
  },

  // STANDARD PROCESS
  {
    id: 'standard-process',
    name: 'Standard Process',
    description: 'Basic linear workflow with multiple steps',
    category: 'standard',
    icon: 'Workflow',
    estimatedDuration: '1-3 days',
    nodes: [
      {
        type: 'start',
        position: { x: 250, y: 50 },
        data: { label: 'Start' },
      },
      {
        type: 'process',
        position: { x: 250, y: 150 },
        data: { 
          label: 'Step 1',
          assignedRole: '',
          deadlineHours: 24,
        },
      },
      {
        type: 'process',
        position: { x: 250, y: 280 },
        data: { 
          label: 'Step 2',
          assignedRole: '',
          deadlineHours: 24,
        },
      },
      {
        type: 'process',
        position: { x: 250, y: 410 },
        data: { 
          label: 'Step 3',
          assignedRole: '',
          deadlineHours: 24,
        },
      },
      {
        type: 'end',
        position: { x: 250, y: 540 },
        data: { label: 'End' },
      },
    ],
    edges: [
      { source: 'start', target: 'process-1' },
      { source: 'process-1', target: 'process-2' },
      { source: 'process-2', target: 'process-3' },
      { source: 'process-3', target: 'end' },
    ],
  },
];

// Get templates by category
export const getWorkflowTemplatesByCategory = (category: WorkflowTemplate['category']) => {
  return workflowTemplates.filter(t => t.category === category);
};

// Get template by ID
export const getWorkflowTemplateById = (id: string) => {
  return workflowTemplates.find(t => t.id === id);
};

// Template categories
export const workflowTemplateCategories = [
  { id: 'approval', label: 'Approvals', icon: 'CheckCircle', count: 3 },
  { id: 'review', label: 'Reviews', icon: 'FileText', count: 1 },
  { id: 'escalation', label: 'Escalation', icon: 'AlertTriangle', count: 1 },
  { id: 'standard', label: 'Standard', icon: 'Workflow', count: 1 },
] as const;
