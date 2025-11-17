import { useMemo } from 'react';
import { Node, Edge } from 'reactflow';

interface ValidationError {
  type: 'error' | 'warning';
  nodeId?: string;
  message: string;
}

export function useFlowValidation(nodes: Node[], edges: Edge[]) {
  const errors = useMemo(() => {
    const validationErrors: ValidationError[] = [];

    // Rule 1: Must have exactly one start node
    const startNodes = nodes.filter(n => n.type === 'start');
    if (startNodes.length === 0) {
      validationErrors.push({
        type: 'error',
        message: 'Workflow must have a start node',
      });
    } else if (startNodes.length > 1) {
      validationErrors.push({
        type: 'error',
        message: 'Workflow must have only one start node',
      });
    }

    // Rule 2: Must have at least one end node
    const endNodes = nodes.filter(n => n.type === 'end');
    if (endNodes.length === 0) {
      validationErrors.push({
        type: 'error',
        message: 'Workflow must have at least one end node',
      });
    }

    // Rule 3: All process nodes must have required fields
    nodes
      .filter(n => n.type === 'process')
      .forEach(node => {
        if (!node.data.label?.trim()) {
          validationErrors.push({
            type: 'error',
            nodeId: node.id,
            message: `Node "${node.id}" is missing a name`,
          });
        }
        if (!node.data.assignedRole) {
          validationErrors.push({
            type: 'error',
            nodeId: node.id,
            message: `Node "${node.data.label || node.id}" is missing an assigned role`,
          });
        }
        if (!node.data.deadlineHours || node.data.deadlineHours < 1) {
          validationErrors.push({
            type: 'error',
            nodeId: node.id,
            message: `Node "${node.data.label || node.id}" must have a valid deadline`,
          });
        }
      });

    // Rule 3b: Decision nodes must have condition
    nodes
      .filter(n => n.type === 'decision')
      .forEach(node => {
        if (!node.data.condition?.trim()) {
          validationErrors.push({
            type: 'error',
            nodeId: node.id,
            message: `Decision node "${node.data.label || node.id}" is missing a condition`,
          });
        }
      });

    // Rule 3c: Approval nodes must have approvers
    nodes
      .filter(n => n.type === 'approval')
      .forEach(node => {
        if (!node.data.approvers || node.data.approvers.length === 0) {
          validationErrors.push({
            type: 'error',
            nodeId: node.id,
            message: `Approval node "${node.data.label || node.id}" must have at least one approver`,
          });
        }
      });

    // Rule 4: Check for orphaned nodes (no connections)
    if (nodes.length > 0 && edges.length > 0) {
      nodes.forEach(node => {
        const hasIncoming = edges.some(e => e.target === node.id);
        const hasOutgoing = edges.some(e => e.source === node.id);
        
        if (!hasIncoming && node.type !== 'start') {
          validationErrors.push({
            type: 'warning',
            nodeId: node.id,
            message: `Node "${node.data.label || node.id}" has no incoming connections`,
          });
        }
        
        if (!hasOutgoing && node.type !== 'end') {
          validationErrors.push({
            type: 'warning',
            nodeId: node.id,
            message: `Node "${node.data.label || node.id}" has no outgoing connections`,
          });
        }
      });
    }

    // Rule 5: Warn if workflow is empty
    if (nodes.length === 0) {
      validationErrors.push({
        type: 'warning',
        message: 'Workflow is empty. Add some nodes to get started.',
      });
    }

    return validationErrors;
  }, [nodes, edges]);

  const hasErrors = errors.some(e => e.type === 'error');
  const hasWarnings = errors.some(e => e.type === 'warning');

  return {
    errors,
    hasErrors,
    hasWarnings,
    isValid: !hasErrors,
  };
}
