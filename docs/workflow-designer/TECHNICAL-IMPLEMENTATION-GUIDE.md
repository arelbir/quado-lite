# 🔧 WORKFLOW ENGINE - TECHNICAL IMPLEMENTATION GUIDE

**Date:** 2025-01-26  
**Focus:** Code-level implementation details

---

## **1. DATABASE SCHEMA**

```typescript
// drizzle/schema/workflow-runtime.ts

export const workflowInstances = pgTable('WorkflowInstance', {
  id: uuid('id').primaryKey().defaultRandom(),
  workflowId: uuid('workflowId').references(() => visualWorkflows.id).notNull(),
  entityType: varchar('entityType', { length: 50 }).notNull(), // AUDIT, FINDING, etc.
  entityId: uuid('entityId').notNull(),
  currentNodeId: varchar('currentNodeId', { length: 255 }),
  status: varchar('status', { length: 50 }).notNull(), // RUNNING, COMPLETED, FAILED
  startedAt: timestamp('startedAt').defaultNow().notNull(),
  completedAt: timestamp('completedAt'),
  startedBy: uuid('startedBy').references(() => users.id).notNull(),
  variables: jsonb('variables').default({}).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

export const workflowExecutions = pgTable('WorkflowExecution', {
  id: uuid('id').primaryKey().defaultRandom(),
  instanceId: uuid('instanceId').references(() => workflowInstances.id).notNull(),
  nodeId: varchar('nodeId', { length: 255 }).notNull(),
  nodeName: varchar('nodeName', { length: 255 }),
  action: varchar('action', { length: 50 }).notNull(), // ENTER, EXECUTE, EXIT
  status: varchar('status', { length: 50 }).notNull(), // SUCCESS, FAILED
  executedAt: timestamp('executedAt').defaultNow().notNull(),
  executedBy: uuid('executedBy').references(() => users.id),
  input: jsonb('input'),
  output: jsonb('output'),
  error: text('error'),
});

export const workflowTasks = pgTable('WorkflowTask', {
  id: uuid('id').primaryKey().defaultRandom(),
  instanceId: uuid('instanceId').references(() => workflowInstances.id).notNull(),
  nodeId: varchar('nodeId', { length: 255 }).notNull(),
  nodeName: varchar('nodeName', { length: 255 }),
  taskType: varchar('taskType', { length: 50 }).notNull(), // APPROVAL, ACTION, DECISION, USER_SELECTION
  assignedTo: uuid('assignedTo').references(() => users.id).notNull(),
  status: varchar('status', { length: 50 }).notNull(), // PENDING, COMPLETED, SKIPPED
  dueDate: timestamp('dueDate'),
  completedAt: timestamp('completedAt'),
  completedBy: uuid('completedBy').references(() => users.id),
  result: jsonb('result'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});
```

---

## **2. WORKFLOW ENGINE CORE**

```typescript
// lib/workflow/engine.ts

import { db } from '@/drizzle/db';
import { ConditionEvaluator } from './condition-evaluator';
import { RoleResolver } from './role-resolver';

export class WorkflowEngine {
  private conditionEvaluator = new ConditionEvaluator();
  private roleResolver = new RoleResolver();

  /**
   * Start a new workflow instance
   */
  async start(params: {
    workflowId: string;
    entityType: string;
    entityId: string;
    startedBy: string;
    variables?: Record<string, any>;
  }) {
    // Load workflow definition
    const workflow = await db.visualWorkflow.findUnique({
      where: { id: params.workflowId },
    });

    if (!workflow) {
      throw new Error('Workflow not found');
    }

    // Find start node
    const startNode = workflow.nodes.find((n: any) => n.type === 'start');
    if (!startNode) {
      throw new Error('Workflow must have a start node');
    }

    // Create instance
    const instance = await db.workflowInstance.create({
      data: {
        workflowId: params.workflowId,
        entityType: params.entityType,
        entityId: params.entityId,
        currentNodeId: startNode.id,
        status: 'RUNNING',
        startedBy: params.startedBy,
        variables: params.variables || {},
      },
    });

    // Execute first node
    await this.executeNode(instance.id, startNode.id);

    return instance;
  }

  /**
   * Execute a specific node
   */
  async executeNode(instanceId: string, nodeId: string) {
    const instance = await this.getInstance(instanceId);
    const workflow = await this.getWorkflow(instance.workflowId);
    const node = this.getNode(workflow, nodeId);

    // Log execution start
    await db.workflowExecution.create({
      data: {
        instanceId,
        nodeId,
        nodeName: node.data.label,
        action: 'ENTER',
        status: 'SUCCESS',
      },
    });

    try {
      // Execute based on node type
      switch (node.type) {
        case 'start':
          await this.executeStart(instance, node);
          break;
        case 'process':
          await this.executeProcess(instance, node);
          break;
        case 'decision':
          await this.executeDecision(instance, node);
          break;
        case 'approval':
          await this.executeApproval(instance, node);
          break;
        case 'end':
          await this.executeEnd(instance, node);
          break;
      }

      // Log success
      await db.workflowExecution.create({
        data: {
          instanceId,
          nodeId,
          nodeName: node.data.label,
          action: 'EXIT',
          status: 'SUCCESS',
        },
      });
    } catch (error) {
      // Log error
      await db.workflowExecution.create({
        data: {
          instanceId,
          nodeId,
          nodeName: node.data.label,
          action: 'EXECUTE',
          status: 'FAILED',
          error: error.message,
        },
      });

      // Mark instance as failed
      await db.workflowInstance.update({
        where: { id: instanceId },
        data: { status: 'FAILED' },
      });

      throw error;
    }
  }

  /**
   * Execute start node - auto advance to next
   */
  private async executeStart(instance: any, node: any) {
    const nextNodes = this.getNextNodes(instance.workflowId, node.id);
    if (nextNodes.length > 0) {
      await this.executeNode(instance.id, nextNodes[0].id);
    }
  }

  /**
   * Execute process node - update entity, assign, etc.
   */
  private async executeProcess(instance: any, node: any) {
    const entity = await this.getEntity(instance.entityType, instance.entityId);

    // Update status if specified
    if (node.data.status) {
      await this.updateEntityStatus(instance.entityType, instance.entityId, node.data.status);
    }

    // Assign if specified
    if (node.data.assignedTo) {
      const assignees = await this.roleResolver.resolve(node.data.assignedTo, {
        entity,
        workflow: instance,
        user: await this.getUser(instance.startedBy),
      });

      await this.assignEntity(instance.entityType, instance.entityId, assignees[0]);
    }

    // Auto-advance
    const nextNodes = this.getNextNodes(instance.workflowId, node.id);
    if (nextNodes.length > 0) {
      await this.executeNode(instance.id, nextNodes[0].id);
    }
  }

  /**
   * Execute decision node - evaluate condition and branch
   */
  private async executeDecision(instance: any, node: any) {
    const entity = await this.getEntity(instance.entityType, instance.entityId);
    const user = await this.getUser(instance.startedBy);

    // Evaluate condition
    const result = this.conditionEvaluator.evaluate(node.data.condition, {
      entity,
      user,
      workflow: instance,
      variables: instance.variables,
    });

    // Find edge based on result
    const workflow = await this.getWorkflow(instance.workflowId);
    const edge = workflow.edges.find((e: any) => 
      e.source === node.id && 
      e.sourceHandle === (result ? 'yes' : 'no')
    );

    if (edge) {
      await this.executeNode(instance.id, edge.target);
    }
  }

  /**
   * Execute approval node - create task and wait
   */
  private async executeApproval(instance: any, node: any) {
    const entity = await this.getEntity(instance.entityType, instance.entityId);
    const user = await this.getUser(instance.startedBy);

    // Resolve assignees
    const assignees = await this.roleResolver.resolve(node.data.assignedTo, {
      entity,
      workflow: instance,
      user,
    });

    // Create task for each assignee
    for (const assigneeId of assignees) {
      await db.workflowTask.create({
        data: {
          instanceId: instance.id,
          nodeId: node.id,
          nodeName: node.data.label,
          taskType: 'APPROVAL',
          assignedTo: assigneeId,
          status: 'PENDING',
          metadata: {
            approvalType: node.data.approvalType,
          },
        },
      });
    }

    // Update current node
    await db.workflowInstance.update({
      where: { id: instance.id },
      data: { currentNodeId: node.id },
    });

    // Don't auto-advance - wait for approval
  }

  /**
   * Execute end node - mark workflow as complete
   */
  private async executeEnd(instance: any, node: any) {
    await db.workflowInstance.update({
      where: { id: instance.id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        currentNodeId: node.id,
      },
    });
  }

  /**
   * Complete a task (approval, etc.) and advance workflow
   */
  async completeTask(taskId: string, userId: string, result: any) {
    const task = await db.workflowTask.findUnique({ where: { id: taskId } });
    if (!task) throw new Error('Task not found');

    // Update task
    await db.workflowTask.update({
      where: { id: taskId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        completedBy: userId,
        result,
      },
    });

    // Check if all tasks for this node are complete
    const allTasks = await db.workflowTask.findMany({
      where: {
        instanceId: task.instanceId,
        nodeId: task.nodeId,
      },
    });

    const node = await this.getNodeFromInstance(task.instanceId, task.nodeId);
    const approvalType = node.data.approvalType || 'ANY';

    let shouldAdvance = false;

    if (approvalType === 'ANY') {
      // ANY: One approval is enough
      shouldAdvance = true;
    } else if (approvalType === 'ALL') {
      // ALL: All must approve
      shouldAdvance = allTasks.every(t => t.status === 'COMPLETED');
    }

    if (shouldAdvance) {
      // Determine next node based on result
      const workflow = await this.getWorkflowFromInstance(task.instanceId);
      const edge = workflow.edges.find((e: any) => 
        e.source === task.nodeId && 
        e.sourceHandle === (result.approved ? 'approved' : 'rejected')
      );

      if (edge) {
        await this.executeNode(task.instanceId, edge.target);
      }
    }
  }
}
```

---

## **3. CONDITION EVALUATOR**

```typescript
// lib/workflow/condition-evaluator.ts

import * as jsep from 'jsep';

export class ConditionEvaluator {
  evaluate(condition: string, context: any): boolean {
    try {
      // Parse to AST
      const ast = jsep(condition);
      
      // Evaluate
      return this.evaluateNode(ast, context);
    } catch (error) {
      console.error('Condition evaluation error:', error);
      return false;
    }
  }

  private evaluateNode(node: any, context: any): any {
    switch (node.type) {
      case 'Literal':
        return node.value;

      case 'Identifier':
        return this.resolveIdentifier(node.name, context);

      case 'MemberExpression':
        return this.resolveMemberExpression(node, context);

      case 'BinaryExpression':
        return this.evaluateBinaryExpression(node, context);

      case 'LogicalExpression':
        return this.evaluateLogicalExpression(node, context);

      case 'UnaryExpression':
        return this.evaluateUnaryExpression(node, context);

      case 'CallExpression':
        return this.evaluateCallExpression(node, context);

      default:
        throw new Error(`Unsupported node type: ${node.type}`);
    }
  }

  private resolveIdentifier(name: string, context: any): any {
    // Special keywords
    if (name === 'TODAY') return new Date();
    if (name === 'NOW') return new Date();
    
    // Context lookup
    return context[name];
  }

  private resolveMemberExpression(node: any, context: any): any {
    let object = this.evaluateNode(node.object, context);
    let property = node.computed
      ? this.evaluateNode(node.property, context)
      : node.property.name;

    return object?.[property];
  }

  private evaluateBinaryExpression(node: any, context: any): any {
    const left = this.evaluateNode(node.left, context);
    const right = this.evaluateNode(node.right, context);

    switch (node.operator) {
      case '===': return left === right;
      case '!==': return left !== right;
      case '>': return left > right;
      case '<': return left < right;
      case '>=': return left >= right;
      case '<=': return left <= right;
      case '+': return left + right;
      case '-': return left - right;
      case '*': return left * right;
      case '/': return left / right;
      default: throw new Error(`Unsupported operator: ${node.operator}`);
    }
  }

  private evaluateLogicalExpression(node: any, context: any): any {
    const left = this.evaluateNode(node.left, context);
    
    if (node.operator === '&&' || node.operator === 'AND') {
      return left && this.evaluateNode(node.right, context);
    }
    
    if (node.operator === '||' || node.operator === 'OR') {
      return left || this.evaluateNode(node.right, context);
    }
    
    throw new Error(`Unsupported logical operator: ${node.operator}`);
  }

  private evaluateUnaryExpression(node: any, context: any): any {
    const argument = this.evaluateNode(node.argument, context);
    
    switch (node.operator) {
      case '!': return !argument;
      case '-': return -argument;
      case '+': return +argument;
      default: throw new Error(`Unsupported unary operator: ${node.operator}`);
    }
  }

  private evaluateCallExpression(node: any, context: any): any {
    const callee = this.evaluateNode(node.callee, context);
    const args = node.arguments.map((arg: any) => this.evaluateNode(arg, context));
    
    if (typeof callee === 'function') {
      return callee(...args);
    }
    
    throw new Error('Callee is not a function');
  }
}
```

---

## **4. ROLE RESOLVER**

```typescript
// lib/workflow/role-resolver.ts

export class RoleResolver {
  async resolve(roleDefinition: any, context: any): Promise<string[]> {
    // Static user ID
    if (typeof roleDefinition === 'string' && roleDefinition.startsWith('user_')) {
      return [roleDefinition];
    }

    // Dynamic placeholder
    if (typeof roleDefinition === 'string' && roleDefinition.includes('{')) {
      return this.resolvePlaceholder(roleDefinition, context);
    }

    // Static role name
    if (typeof roleDefinition === 'string') {
      return this.resolveRoleName(roleDefinition);
    }

    // Computed role
    if (roleDefinition.type === 'COMPUTED') {
      return this.resolveComputed(roleDefinition, context);
    }

    throw new Error('Invalid role definition');
  }

  private async resolvePlaceholder(placeholder: string, context: any): Promise<string[]> {
    // Extract path: {entity.manager} → entity.manager
    const path = placeholder.replace(/[{}]/g, '');
    const value = this.getNestedValue(context, path);

    if (!value) {
      throw new Error(`Cannot resolve: ${placeholder}`);
    }

    return Array.isArray(value) ? value : [value];
  }

  private async resolveRoleName(roleName: string): Promise<string[]> {
    const users = await db.user.findMany({
      where: { role: roleName, status: 'ACTIVE' },
      select: { id: true },
    });

    return users.map(u => u.id);
  }

  private async resolveComputed(definition: any, context: any): Promise<string[]> {
    const evaluator = new ConditionEvaluator();

    for (const rule of definition.rules) {
      if (evaluator.evaluate(rule.condition, context)) {
        return this.resolve(rule.assignTo, context);
      }
    }

    return this.resolve(definition.default, context);
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
}
```

---

**Status:** Implementation-ready  
**Dependencies:** jsep (expression parser)  
**Next:** Create database migration
