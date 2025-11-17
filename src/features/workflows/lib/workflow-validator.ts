/**
 * WORKFLOW VALIDATOR
 * Comprehensive workflow validation system
 */

import { Node, Edge } from 'reactflow';

export interface ValidationIssue {
  id: string;
  type: 'error' | 'warning' | 'info';
  nodeId?: string;
  message: string;
  suggestion?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  info: ValidationIssue[];
}

/**
 * Validate entire workflow
 */
export function validateWorkflow(nodes: Node[], edges: Edge[]): ValidationResult {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];
  const info: ValidationIssue[] = [];

  // 1. Check for empty workflow
  if (nodes.length === 0) {
    errors.push({
      id: 'empty-workflow',
      type: 'error',
      message: 'Workflow is empty',
      suggestion: 'Add at least a start and end node',
    });
    return { isValid: false, errors, warnings, info };
  }

  // 2. Check for start node
  const startNodes = nodes.filter(n => n.type === 'start');
  if (startNodes.length === 0) {
    errors.push({
      id: 'no-start',
      type: 'error',
      message: 'Workflow must have a start node',
      suggestion: 'Add a start node from the toolbar',
    });
  } else if (startNodes.length > 1) {
    warnings.push({
      id: 'multiple-starts',
      type: 'warning',
      message: 'Workflow has multiple start nodes',
      suggestion: 'Consider using only one start node',
    });
  }

  // 3. Check for end node
  const endNodes = nodes.filter(n => n.type === 'end');
  if (endNodes.length === 0) {
    errors.push({
      id: 'no-end',
      type: 'error',
      message: 'Workflow must have an end node',
      suggestion: 'Add an end node from the toolbar',
    });
  }

  // 4. Check for orphaned nodes
  const orphanedNodes = findOrphanedNodes(nodes, edges);
  orphanedNodes.forEach(node => {
    warnings.push({
      id: `orphaned-${node.id}`,
      type: 'warning',
      nodeId: node.id,
      message: `Node "${node.data.label || node.id}" is not connected`,
      suggestion: 'Connect this node or remove it',
    });
  });

  // 5. Check for nodes without outgoing edges (except end nodes)
  nodes.forEach(node => {
    if (node.type !== 'end') {
      const hasOutgoing = edges.some(e => e.source === node.id);
      if (!hasOutgoing) {
        warnings.push({
          id: `no-outgoing-${node.id}`,
          type: 'warning',
          nodeId: node.id,
          message: `Node "${node.data.label || node.id}" has no outgoing connections`,
          suggestion: 'Add a connection from this node',
        });
      }
    }
  });

  // 6. Check for circular dependencies
  const cycles = detectCycles(nodes, edges);
  if (cycles.length > 0) {
    warnings.push({
      id: 'circular-dependency',
      type: 'warning',
      message: 'Workflow contains circular dependencies',
      suggestion: 'Avoid infinite loops in your workflow',
    });
  }

  // 7. Validate process nodes
  nodes.filter(n => n.type === 'process').forEach(node => {
    if (!node.data.assignedRole || node.data.assignedRole === '') {
      warnings.push({
        id: `no-role-${node.id}`,
        type: 'warning',
        nodeId: node.id,
        message: `Process "${node.data.label}" has no assigned role`,
        suggestion: 'Assign a role to this process step',
      });
    }
    if (!node.data.deadlineHours || node.data.deadlineHours <= 0) {
      warnings.push({
        id: `no-deadline-${node.id}`,
        type: 'warning',
        nodeId: node.id,
        message: `Process "${node.data.label}" has no deadline`,
        suggestion: 'Set a deadline for this process',
      });
    }
  });

  // 8. Validate approval nodes
  nodes.filter(n => n.type === 'approval').forEach(node => {
    if (!node.data.approvers || node.data.approvers.length === 0) {
      warnings.push({
        id: `no-approvers-${node.id}`,
        type: 'warning',
        nodeId: node.id,
        message: `Approval "${node.data.label}" has no approvers`,
        suggestion: 'Add at least one approver',
      });
    }
  });

  // 9. Validate decision nodes
  nodes.filter(n => n.type === 'decision').forEach(node => {
    if (!node.data.condition || node.data.condition === '') {
      warnings.push({
        id: `no-condition-${node.id}`,
        type: 'warning',
        nodeId: node.id,
        message: `Decision "${node.data.label}" has no condition`,
        suggestion: 'Define a condition for this decision',
      });
    }
    
    // Check if decision has at least 2 outgoing edges
    const outgoingEdges = edges.filter(e => e.source === node.id);
    if (outgoingEdges.length < 2) {
      warnings.push({
        id: `decision-paths-${node.id}`,
        type: 'warning',
        nodeId: node.id,
        message: `Decision "${node.data.label}" should have at least 2 paths`,
        suggestion: 'Add Yes/No paths from this decision',
      });
    }
  });

  // 10. Check reachability from start to end
  if (startNodes.length > 0 && endNodes.length > 0) {
    const reachableFromStart = getReachableNodes(startNodes[0].id, nodes, edges);
    const unreachableNodes = nodes.filter(n => !reachableFromStart.has(n.id) && n.type !== 'start');
    
    unreachableNodes.forEach(node => {
      warnings.push({
        id: `unreachable-${node.id}`,
        type: 'warning',
        nodeId: node.id,
        message: `Node "${node.data.label}" is not reachable from start`,
        suggestion: 'Ensure this node is connected to the workflow',
      });
    });

    // Check if end node is reachable
    endNodes.forEach(endNode => {
      if (!reachableFromStart.has(endNode.id)) {
        errors.push({
          id: `end-unreachable-${endNode.id}`,
          type: 'error',
          nodeId: endNode.id,
          message: 'End node is not reachable from start',
          suggestion: 'Create a path from start to end node',
        });
      }
    });
  }

  // 11. Info messages
  info.push({
    id: 'node-count',
    type: 'info',
    message: `Workflow has ${nodes.length} nodes and ${edges.length} connections`,
  });

  const processNodes = nodes.filter(n => n.type === 'process');
  if (processNodes.length > 0) {
    const totalHours = processNodes.reduce((sum, n) => sum + (n.data.deadlineHours || 0), 0);
    info.push({
      id: 'estimated-duration',
      type: 'info',
      message: `Estimated duration: ${totalHours} hours (${Math.ceil(totalHours / 24)} days)`,
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    info,
  };
}

/**
 * Find orphaned nodes (nodes with no connections)
 */
function findOrphanedNodes(nodes: Node[], edges: Edge[]): Node[] {
  return nodes.filter(node => {
    const hasIncoming = edges.some(e => e.target === node.id);
    const hasOutgoing = edges.some(e => e.source === node.id);
    return !hasIncoming && !hasOutgoing && node.type !== 'start' && node.type !== 'end';
  });
}

/**
 * Detect cycles in workflow
 */
function detectCycles(nodes: Node[], edges: Edge[]): string[][] {
  const graph = new Map<string, string[]>();
  
  nodes.forEach(node => {
    graph.set(node.id, []);
  });
  
  edges.forEach(edge => {
    const neighbors = graph.get(edge.source) || [];
    neighbors.push(edge.target);
    graph.set(edge.source, neighbors);
  });

  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  const cycles: string[][] = [];

  function dfs(nodeId: string, path: string[]): boolean {
    visited.add(nodeId);
    recursionStack.add(nodeId);
    path.push(nodeId);

    const neighbors = graph.get(nodeId);
    if (neighbors) {
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (dfs(neighbor, [...path])) {
            return true;
          }
        } else if (recursionStack.has(neighbor)) {
          cycles.push([...path, neighbor]);
          return true;
        }
      }
    }

    recursionStack.delete(nodeId);
    return false;
  }

  nodes.forEach(node => {
    if (!visited.has(node.id)) {
      dfs(node.id, []);
    }
  });

  return cycles;
}

/**
 * Get all nodes reachable from a starting node
 */
function getReachableNodes(startId: string, nodes: Node[], edges: Edge[]): Set<string> {
  const reachable = new Set<string>();
  const queue = [startId];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (reachable.has(current)) continue;
    
    reachable.add(current);
    
    const outgoingEdges = edges.filter(e => e.source === current);
    outgoingEdges.forEach(edge => {
      if (!reachable.has(edge.target)) {
        queue.push(edge.target);
      }
    });
  }

  return reachable;
}

/**
 * Quick validation for specific checks
 */
export function hasStartNode(nodes: Node[]): boolean {
  return nodes.some(n => n.type === 'start');
}

export function hasEndNode(nodes: Node[]): boolean {
  return nodes.some(n => n.type === 'end');
}

export function getNodeIssueCount(nodeId: string, validation: ValidationResult): number {
  return [
    ...validation.errors,
    ...validation.warnings,
  ].filter(issue => issue.nodeId === nodeId).length;
}
