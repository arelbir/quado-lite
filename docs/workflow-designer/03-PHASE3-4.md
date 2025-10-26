# 🎯 PHASE 3-4: ADVANCED FEATURES & INTEGRATION

**Duration:** 5 days  
**Status:** 📋 Planning  
**Prerequisites:** Phase 1 & 2 completed  
**Focus:** Advanced nodes, testing, database integration

---

## **PHASE 3: ADVANCED NODES (3 days)**

### **🎯 OBJECTIVES**

- ✅ Decision nodes (conditional branching)
- ✅ Approval nodes (manager approval)
- ✅ Parallel nodes (concurrent execution)
- ✅ Conditional edges
- ✅ Auto-layout algorithm

---

### **🎨 STEP 1: CREATE DECISION NODE (1 hour)**

**File:** `src/components/workflow-designer/Nodes/DecisionNode.tsx`

```typescript
'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card } from '@/components/ui/card';
import { Icons } from '@/components/icons';

export const DecisionNode = memo(({ data, selected }: NodeProps) => {
  return (
    <div className="relative">
      <Card 
        className={`min-w-[180px] p-3 border-2 bg-yellow-50 ${
          selected ? 'border-primary shadow-lg' : 'border-yellow-400'
        }`}
        style={{ 
          clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' 
        }}
      >
        <Handle
          type="target"
          position={Position.Top}
          className="!bg-yellow-500 !w-3 !h-3 !border-2 !border-white"
        />
        
        <div className="text-center">
          <Icons.GitBranch className="size-4 text-yellow-700 mx-auto mb-1" />
          <span className="font-semibold text-sm">{data.label || 'Decision'}</span>
        </div>
        
        <Handle
          type="source"
          position={Position.Bottom}
          id="true"
          className="!bg-green-500 !w-3 !h-3 !border-2 !border-white !left-1/4"
        />
        <Handle
          type="source"
          position={Position.Bottom}
          id="false"
          className="!bg-red-500 !w-3 !h-3 !border-2 !border-white !left-3/4"
        />
      </Card>
    </div>
  );
});

DecisionNode.displayName = 'DecisionNode';
```

### **✅ Checklist:**
- [ ] DecisionNode created
- [ ] Diamond shape
- [ ] Multiple output handles (true/false)
- [ ] Registered in nodeTypes

---

### **🎨 STEP 2: CREATE APPROVAL NODE (1 hour)**

**File:** `src/components/workflow-designer/Nodes/ApprovalNode.tsx`

```typescript
'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';

export const ApprovalNode = memo(({ data, selected }: NodeProps) => {
  return (
    <Card 
      className={`min-w-[200px] p-3 border-2 bg-purple-50 ${
        selected ? 'border-primary shadow-lg' : 'border-purple-400'
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-purple-500 !w-3 !h-3 !border-2 !border-white"
      />
      
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Icons.ShieldCheck className="size-4 text-purple-600" />
          <span className="font-semibold text-sm">
            {data.label || 'Approval Required'}
          </span>
        </div>
        
        <Badge variant="secondary" className="text-xs">
          {data.approvalType || 'Single'} Approval
        </Badge>
        
        {data.approvers && data.approvers.length > 0 && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Icons.Users className="size-3" />
            <span>{data.approvers.length} approver(s)</span>
          </div>
        )}
      </div>
      
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-purple-500 !w-3 !h-3 !border-2 !border-white"
      />
    </Card>
  );
});

ApprovalNode.displayName = 'ApprovalNode';
```

### **✅ Checklist:**
- [ ] ApprovalNode created
- [ ] Shows approval type
- [ ] Shows approvers count
- [ ] Registered in nodeTypes

---

### **🎨 STEP 3: UPDATE TOOLBAR (15 min)**

Add new nodes to toolbar:

```typescript
<Button
  variant="outline"
  size="sm"
  className="w-full justify-start gap-2"
  onClick={() => handleAddNode('decision')}
>
  <Icons.GitBranch className="size-4 text-yellow-500" />
  <span>Decision</span>
</Button>

<Button
  variant="outline"
  size="sm"
  className="w-full justify-start gap-2"
  onClick={() => handleAddNode('approval')}
>
  <Icons.ShieldCheck className="size-4 text-purple-500" />
  <span>Approval</span>
</Button>
```

### **✅ Checklist:**
- [ ] Decision button added
- [ ] Approval button added
- [ ] Both nodes can be added

---

### **🎨 STEP 4: AUTO-LAYOUT ALGORITHM (1.5 hours)**

**File:** `src/components/workflow-designer/Canvas/AutoLayout.ts`

```typescript
import dagre from 'dagre';
import { Node, Edge } from 'reactflow';

export function getLayoutedElements(nodes: Node[], edges: Edge[]) {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  
  // Configure layout
  dagreGraph.setGraph({ 
    rankdir: 'TB', // Top to Bottom
    nodesep: 100,  // Horizontal spacing
    ranksep: 100,  // Vertical spacing
  });

  // Add nodes
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { 
      width: 250, 
      height: 100 
    });
  });

  // Add edges
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // Run layout
  dagre.layout(dagreGraph);

  // Apply layout to nodes
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - 125, // Center horizontally
        y: nodeWithPosition.y - 50,  // Center vertically
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}
```

Add button to header:

```typescript
import { getLayoutedElements } from '@/components/workflow-designer/Canvas/AutoLayout';

const handleAutoLayout = () => {
  const { nodes: layoutedNodes } = getLayoutedElements(nodes, edges);
  setNodes(layoutedNodes);
};

// In header:
<Button variant="outline" onClick={handleAutoLayout}>
  <Icons.Sparkles className="size-4 mr-2" />
  Auto Layout
</Button>
```

### **✅ Checklist:**
- [ ] Auto-layout function created
- [ ] Dagre integrated
- [ ] Button added to header
- [ ] Layout arranges nodes nicely

---

### **🎨 STEP 5: CONDITIONAL EDGES (1 hour)**

**File:** `src/components/workflow-designer/Edges/ConditionalEdge.tsx`

```typescript
'use client';

import { EdgeProps, getBezierPath } from 'reactflow';

export function ConditionalEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  style = {},
  markerEnd,
}: EdgeProps) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const isConditional = data?.condition?.type === 'if';
  const conditionLabel = data?.label || (isConditional ? 'IF' : '');

  return (
    <>
      <path
        id={id}
        style={{
          ...style,
          stroke: isConditional ? '#eab308' : style.stroke,
          strokeWidth: 2,
          strokeDasharray: isConditional ? '5,5' : undefined,
        }}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />
      {conditionLabel && (
        <text>
          <textPath
            href={`#${id}`}
            style={{ fontSize: 12 }}
            startOffset="50%"
            textAnchor="middle"
          >
            {conditionLabel}
          </textPath>
        </text>
      )}
    </>
  );
}
```

Register in canvas:

```typescript
const edgeTypes = {
  default: ConditionalEdge,
};

<ReactFlow
  edgeTypes={edgeTypes}
  // ... other props
/>
```

### **✅ Checklist:**
- [ ] ConditionalEdge created
- [ ] Dashed line for conditions
- [ ] Label shows on edge
- [ ] Registered in edgeTypes

---

### **🎨 STEP 6: ENHANCE PROPERTIES PANEL (1 hour)**

Add decision/approval specific fields:

```typescript
{/* Decision Node Config */}
{selectedNode.type === 'decision' && (
  <>
    <Separator />
    <div className="space-y-4">
      <h4 className="text-sm font-semibold">Decision Condition</h4>
      
      <div>
        <Label>Field to Check</Label>
        <Input
          value={selectedNode.data.conditionField || ''}
          onChange={(e) => handleUpdate('conditionField', e.target.value)}
          placeholder="e.g., riskLevel"
        />
      </div>
      
      <div>
        <Label>Operator</Label>
        <Select
          value={selectedNode.data.conditionOperator || 'eq'}
          onValueChange={(value) => handleUpdate('conditionOperator', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="eq">Equals (=)</SelectItem>
            <SelectItem value="neq">Not Equals (≠)</SelectItem>
            <SelectItem value="gt">Greater Than (&gt;)</SelectItem>
            <SelectItem value="lt">Less Than (&lt;)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label>Value</Label>
        <Input
          value={selectedNode.data.conditionValue || ''}
          onChange={(e) => handleUpdate('conditionValue', e.target.value)}
          placeholder="Value to compare"
        />
      </div>
    </div>
  </>
)}

{/* Approval Node Config */}
{selectedNode.type === 'approval' && (
  <>
    <Separator />
    <div className="space-y-4">
      <h4 className="text-sm font-semibold">Approval Settings</h4>
      
      <div>
        <Label>Approval Type</Label>
        <Select
          value={selectedNode.data.approvalType || 'single'}
          onValueChange={(value) => handleUpdate('approvalType', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="single">Single Approver</SelectItem>
            <SelectItem value="multiple">Any Approver</SelectItem>
            <SelectItem value="unanimous">All Approvers</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label>Approver Roles</Label>
        <div className="space-y-2">
          {['SUPER_ADMIN', 'QUALITY_MANAGER'].map((role) => (
            <div key={role} className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`approver-${role}`}
                checked={selectedNode.data.approvers?.includes(role) || false}
                onChange={(e) => {
                  const current = selectedNode.data.approvers || [];
                  const updated = e.target.checked
                    ? [...current, role]
                    : current.filter((r: string) => r !== role);
                  handleUpdate('approvers', updated);
                }}
              />
              <Label htmlFor={`approver-${role}`}>{role}</Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  </>
)}
```

### **✅ Checklist:**
- [ ] Decision config added
- [ ] Approval config added
- [ ] All fields work
- [ ] Data saved to node

---

## **PHASE 4: DATABASE & INTEGRATION (2 days)**

### **🎯 OBJECTIVES**

- ✅ Database schema & migration
- ✅ Save to database
- ✅ Load from database
- ✅ Version control
- ✅ List workflows page
- ✅ Workflow execution integration

---

### **🎨 STEP 1: DATABASE SCHEMA (30 min)**

**File:** `src/drizzle/schema/workflow.ts`

```typescript
import { pgTable, uuid, varchar, text, integer, boolean, timestamp, json } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { user } from './user';

export const workflowDefinitions = pgTable('WorkflowDefinition', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  
  module: varchar('module', { length: 50 }).notNull(), // 'DOF', 'ACTION', 'FINDING', 'AUDIT'
  status: varchar('status', { length: 20 }).default('DRAFT'), // 'DRAFT', 'ACTIVE', 'ARCHIVED'
  version: integer('version').default(1).notNull(),
  
  // React Flow visual data
  flowData: json('flowData').notNull(),
  
  // Compiled steps for execution
  steps: json('steps').notNull(),
  
  createdById: uuid('createdById').references(() => user.id).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
  
  publishedAt: timestamp('publishedAt'),
  publishedById: uuid('publishedById').references(() => user.id),
});

export const workflowVersions = pgTable('WorkflowVersion', {
  id: uuid('id').primaryKey().defaultRandom(),
  workflowId: uuid('workflowId').references(() => workflowDefinitions.id, { onDelete: 'cascade' }).notNull(),
  version: integer('version').notNull(),
  flowData: json('flowData').notNull(),
  steps: json('steps').notNull(),
  createdById: uuid('createdById').references(() => user.id).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  notes: text('notes'),
});

export const workflowDefinitionRelations = relations(workflowDefinitions, ({ one, many }) => ({
  creator: one(user, { 
    fields: [workflowDefinitions.createdById], 
    references: [user.id] 
  }),
  publisher: one(user, { 
    fields: [workflowDefinitions.publishedById], 
    references: [user.id] 
  }),
  versions: many(workflowVersions),
}));

export const workflowVersionRelations = relations(workflowVersions, ({ one }) => ({
  workflow: one(workflowDefinitions, {
    fields: [workflowVersions.workflowId],
    references: [workflowDefinitions.id],
  }),
  creator: one(user, {
    fields: [workflowVersions.createdById],
    references: [user.id],
  }),
}));
```

### **✅ Checklist:**
- [ ] Schema created
- [ ] Relations defined
- [ ] Export in main schema file

---

### **🎨 STEP 2: CREATE MIGRATION (15 min)**

```bash
pnpm drizzle-kit generate
```

Review and run migration:

```bash
pnpm drizzle-kit push
```

### **✅ Checklist:**
- [ ] Migration generated
- [ ] Migration applied
- [ ] Tables created in DB

---

### **🎨 STEP 3: SERVER ACTIONS (2 hours)**

**File:** `src/server/actions/workflow-actions.ts`

```typescript
'use server';

import { db } from '@/drizzle/db';
import { workflowDefinitions, workflowVersions } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { withAuth } from '@/lib/helpers';

interface SaveWorkflowInput {
  id?: string;
  name: string;
  description?: string;
  module: string;
  flowData: any;
  steps: any[];
}

export async function saveWorkflow(input: SaveWorkflowInput) {
  return withAuth(async (user) => {
    try {
      if (input.id) {
        // Update existing
        const existing = await db.query.workflowDefinitions.findFirst({
          where: eq(workflowDefinitions.id, input.id),
        });

        if (!existing) {
          return { success: false, error: 'Workflow not found' };
        }

        // Create version history
        await db.insert(workflowVersions).values({
          workflowId: existing.id,
          version: existing.version,
          flowData: existing.flowData,
          steps: existing.steps,
          createdById: user.id,
        });

        // Update workflow
        await db.update(workflowDefinitions)
          .set({
            name: input.name,
            description: input.description,
            module: input.module,
            flowData: input.flowData,
            steps: input.steps,
            version: existing.version + 1,
            updatedAt: new Date(),
          })
          .where(eq(workflowDefinitions.id, input.id));

        revalidatePath('/admin/workflows');
        return { success: true, id: input.id };
      } else {
        // Create new
        const [workflow] = await db.insert(workflowDefinitions).values({
          name: input.name,
          description: input.description,
          module: input.module,
          flowData: input.flowData,
          steps: input.steps,
          status: 'DRAFT',
          version: 1,
          createdById: user.id,
        }).returning();

        revalidatePath('/admin/workflows');
        return { success: true, id: workflow.id };
      }
    } catch (error) {
      console.error('Save workflow error:', error);
      return { success: false, error: 'Failed to save workflow' };
    }
  }, { requireAdmin: true });
}

export async function getWorkflow(id: string) {
  return withAuth(async (user) => {
    const workflow = await db.query.workflowDefinitions.findFirst({
      where: eq(workflowDefinitions.id, id),
      with: {
        creator: true,
        publisher: true,
      },
    });

    if (!workflow) {
      return { success: false, error: 'Workflow not found' };
    }

    return { success: true, workflow };
  });
}

export async function getWorkflows() {
  return withAuth(async (user) => {
    const workflows = await db.query.workflowDefinitions.findMany({
      with: {
        creator: true,
      },
      orderBy: (workflows, { desc }) => [desc(workflows.createdAt)],
    });

    return { success: true, workflows };
  });
}

export async function publishWorkflow(id: string) {
  return withAuth(async (user) => {
    await db.update(workflowDefinitions)
      .set({
        status: 'ACTIVE',
        publishedAt: new Date(),
        publishedById: user.id,
      })
      .where(eq(workflowDefinitions.id, id));

    revalidatePath('/admin/workflows');
    return { success: true };
  }, { requireAdmin: true });
}
```

### **✅ Checklist:**
- [ ] Save workflow action
- [ ] Get workflow action
- [ ] Get workflows list action
- [ ] Publish workflow action
- [ ] withAuth pattern used
- [ ] Revalidation paths set

---

### **🎨 STEP 4: UPDATE BUILDER TO SAVE (30 min)**

Replace console.log save with real save:

```typescript
import { saveWorkflow } from '@/server/actions/workflow-actions';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const [workflowId, setWorkflowId] = useState<string>();
const [workflowName, setWorkflowName] = useState('Untitled Workflow');
const router = useRouter();

const handleSave = async () => {
  const { isValid } = useFlowValidation(nodes, edges);
  
  if (!isValid) {
    alert('Please fix validation errors before saving');
    return;
  }

  // Compile steps from nodes
  const steps = nodes.map((node, index) => ({
    id: node.id,
    name: node.data.label,
    type: node.type,
    order: index,
    assignedRole: node.data.assignedRole,
    deadlineHours: node.data.deadlineHours,
    nextSteps: edges.filter(e => e.source === node.id).map(e => e.target),
    config: node.data,
  }));

  const result = await saveWorkflow({
    id: workflowId,
    name: workflowName,
    module: 'DOF', // TODO: Make selectable
    flowData: { nodes, edges, viewport: { x: 0, y: 0, zoom: 1 } },
    steps,
  });

  if (result.success) {
    setWorkflowId(result.id);
    clearDraft();
    alert('Workflow saved successfully!');
    router.refresh();
  } else {
    alert('Failed to save: ' + result.error);
  }
};
```

### **✅ Checklist:**
- [ ] Save to database works
- [ ] Shows success message
- [ ] Clears draft after save
- [ ] Refreshes page

---

### **🎨 STEP 5: CREATE WORKFLOW LIST PAGE (1 hour)**

**File:** `src/app/(main)/admin/workflows/definitions/page.tsx`

```typescript
import { getWorkflows } from '@/server/actions/workflow-actions';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import Link from 'next/link';

export default async function WorkflowDefinitionsPage() {
  const { workflows } = await getWorkflows();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Workflow Definitions</h1>
          <p className="text-muted-foreground">
            Manage your workflow templates
          </p>
        </div>
        <Link href="/admin/workflows/builder">
          <Button>
            <Icons.Plus className="size-4 mr-2" />
            New Workflow
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {workflows?.map((workflow) => (
          <Card key={workflow.id} className="p-4">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{workflow.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    v{workflow.version}
                  </p>
                </div>
                <Badge
                  variant={workflow.status === 'ACTIVE' ? 'default' : 'secondary'}
                >
                  {workflow.status}
                </Badge>
              </div>

              {workflow.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {workflow.description}
                </p>
              )}

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Icons.User className="size-3" />
                <span>{workflow.creator?.name}</span>
              </div>

              <div className="flex gap-2">
                <Link href={`/admin/workflows/builder/${workflow.id}`}>
                  <Button size="sm" variant="outline" className="flex-1">
                    <Icons.Edit className="size-3 mr-1" />
                    Edit
                  </Button>
                </Link>
                <Button size="sm" variant="outline">
                  <Icons.Eye className="size-3 mr-1" />
                  View
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

### **✅ Checklist:**
- [ ] List page created
- [ ] Shows all workflows
- [ ] Edit button works
- [ ] New workflow button works

---

### **🎨 STEP 6: ENABLE EDIT MODE (45 min)**

**File:** `src/app/(main)/admin/workflows/builder/[id]/page.tsx`

```typescript
'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getWorkflow } from '@/server/actions/workflow-actions';
import { useWorkflowStore } from '@/components/workflow-designer/Hooks/useWorkflowStore';
import WorkflowBuilderPage from '../page';

export default function EditWorkflowPage() {
  const params = useParams();
  const { setNodes, setEdges } = useWorkflowStore();

  useEffect(() => {
    const loadWorkflow = async () => {
      const result = await getWorkflow(params.id as string);
      if (result.success && result.workflow) {
        setNodes(result.workflow.flowData.nodes || []);
        setEdges(result.workflow.flowData.edges || []);
      }
    };
    
    loadWorkflow();
  }, [params.id, setNodes, setEdges]);

  return <WorkflowBuilderPage />;
}
```

### **✅ Checklist:**
- [ ] Edit page created
- [ ] Loads existing workflow
- [ ] Can edit and save
- [ ] URL parameter works

---

## **✅ PHASE 3-4 COMPLETION CHECKLIST**

### **Phase 3 - Advanced:**
- [ ] DecisionNode created
- [ ] ApprovalNode created  
- [ ] Auto-layout works
- [ ] Conditional edges work
- [ ] Properties panel updated
- [ ] All nodes in toolbar

### **Phase 4 - Integration:**
- [ ] Database schema created
- [ ] Migration applied
- [ ] Server actions work
- [ ] Save to DB works
- [ ] Load from DB works
- [ ] List page works
- [ ] Edit mode works

### **Overall:**
- [ ] All validation passing
- [ ] No console errors
- [ ] Good performance
- [ ] Clean code
- [ ] Documentation updated

---

## **📸 FINAL RESULT**

Full workflow designer with all features:
- ✅ 6 node types (Start, Process, End, Decision, Approval, Parallel)
- ✅ Properties panel with full configuration
- ✅ Validation panel with real-time feedback
- ✅ Auto-layout algorithm
- ✅ Auto-save to localStorage
- ✅ Save/load from database
- ✅ Version control
- ✅ Workflow list page
- ✅ Edit existing workflows

---

## **🚀 NEXT STEPS**

After completing all phases:

1. **Testing:** Test all features thoroughly
2. **Documentation:** Update user guide
3. **Training:** Train team on new feature
4. **Migration:** Convert existing JSON workflows
5. **Monitor:** Track usage and performance

---

## **📚 RESOURCES**

- [React Flow Docs](https://reactflow.dev/)
- [Dagre Layout](https://github.com/dagrejs/dagre)
- [Zustand Docs](https://zustand-demo.pmnd.rs/)

---

**Status:** 📋 Ready to Implement  
**Total Time:** ~9 days  
**Complexity:** High  
**Impact:** High 🎯
