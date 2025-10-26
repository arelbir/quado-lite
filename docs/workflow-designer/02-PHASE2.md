# 🎯 PHASE 2: NODE CONFIGURATION & PROPERTIES

**Duration:** 2 days  
**Status:** 📋 Planning  
**Prerequisites:** Phase 1 completed  
**Focus:** Properties panel, node editing, validation

---

## **🎯 OBJECTIVES**

Add configuration capabilities to nodes:
- ✅ Properties panel (right sidebar)
- ✅ Edit node properties
- ✅ Role assignment dropdown
- ✅ Deadline configuration
- ✅ Notification settings
- ✅ Real-time validation
- ✅ Auto-save drafts

---

## **🎨 STEP 1: CREATE PROPERTIES PANEL (1 hour)**

**File:** `src/components/workflow-designer/Panels/PropertiesPanel.tsx`

```typescript
'use client';

import { useWorkflowStore } from '../Hooks/useWorkflowStore';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { Separator } from '@/components/ui/separator';

export function PropertiesPanel() {
  const { selectedNode, updateNodeData, deleteNode } = useWorkflowStore();

  if (!selectedNode) {
    return (
      <Card className="p-6 h-full">
        <div className="flex flex-col items-center justify-center h-full text-center">
          <Icons.MousePointerClick className="size-12 text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground">
            Select a node to edit its properties
          </p>
        </div>
      </Card>
    );
  }

  const handleUpdate = (field: string, value: any) => {
    updateNodeData(selectedNode.id, { [field]: value });
  };

  const handleDelete = () => {
    if (confirm(`Delete "${selectedNode.data.label}" node?`)) {
      deleteNode(selectedNode.id);
    }
  };

  return (
    <Card className="p-4 h-full overflow-y-auto">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h3 className="text-lg font-semibold">Node Properties</h3>
          <p className="text-xs text-muted-foreground">
            Configure selected node
          </p>
        </div>

        <Separator />

        {/* Basic Info */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="label">Step Name *</Label>
            <Input
              id="label"
              value={selectedNode.data.label || ''}
              onChange={(e) => handleUpdate('label', e.target.value)}
              placeholder="Enter step name"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={selectedNode.data.description || ''}
              onChange={(e) => handleUpdate('description', e.target.value)}
              placeholder="Describe this step..."
              rows={3}
            />
          </div>
        </div>

        <Separator />

        {/* Assignment (only for process nodes) */}
        {selectedNode.type === 'process' && (
          <>
            <div className="space-y-4">
              <h4 className="text-sm font-semibold">Assignment</h4>
              
              <div>
                <Label htmlFor="role">Assigned Role *</Label>
                <Select
                  value={selectedNode.data.assignedRole || ''}
                  onValueChange={(value) => handleUpdate('assignedRole', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                    <SelectItem value="QUALITY_MANAGER">Quality Manager</SelectItem>
                    <SelectItem value="PROCESS_OWNER">Process Owner</SelectItem>
                    <SelectItem value="ACTION_OWNER">Action Owner</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="deadline">Deadline (hours) *</Label>
                <Input
                  id="deadline"
                  type="number"
                  min="1"
                  value={selectedNode.data.deadlineHours || 24}
                  onChange={(e) => handleUpdate('deadlineHours', Number(e.target.value))}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Time limit for completing this step
                </p>
              </div>
            </div>

            <Separator />

            {/* Notifications */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold">Notifications</h4>
              
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label htmlFor="notify-assign">On Assignment</Label>
                  <p className="text-xs text-muted-foreground">
                    Notify when step is assigned
                  </p>
                </div>
                <Switch
                  id="notify-assign"
                  checked={selectedNode.data.notifications?.onAssign ?? true}
                  onCheckedChange={(checked) =>
                    handleUpdate('notifications', {
                      ...selectedNode.data.notifications,
                      onAssign: checked,
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="notify-before">Before Deadline (hours)</Label>
                <Input
                  id="notify-before"
                  type="number"
                  min="0"
                  value={selectedNode.data.notifications?.beforeDeadline || 2}
                  onChange={(e) =>
                    handleUpdate('notifications', {
                      ...selectedNode.data.notifications,
                      beforeDeadline: Number(e.target.value),
                    })
                  }
                />
                <p className="text-xs text-muted-foreground mt-1">
                  0 = disabled
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label htmlFor="notify-overdue">On Overdue</Label>
                  <p className="text-xs text-muted-foreground">
                    Notify when deadline passed
                  </p>
                </div>
                <Switch
                  id="notify-overdue"
                  checked={selectedNode.data.notifications?.onOverdue ?? true}
                  onCheckedChange={(checked) =>
                    handleUpdate('notifications', {
                      ...selectedNode.data.notifications,
                      onOverdue: checked,
                    })
                  }
                />
              </div>
            </div>
          </>
        )}

        <Separator />

        {/* Actions */}
        <div>
          <Button
            variant="destructive"
            size="sm"
            className="w-full"
            onClick={handleDelete}
          >
            <Icons.Trash className="size-4 mr-2" />
            Delete Node
          </Button>
        </div>
      </div>
    </Card>
  );
}
```

### **✅ Checklist:**
- [ ] PropertiesPanel component created
- [ ] Shows message when no node selected
- [ ] Shows properties when node selected
- [ ] All input fields work
- [ ] Update functions work

---

## **🎨 STEP 2: UPDATE BUILDER LAYOUT (30 min)**

**File:** `src/app/(main)/admin/workflows/builder/page.tsx`

Update to include properties panel:

```typescript
'use client';

import { WorkflowCanvas } from '@/components/workflow-designer/Canvas/WorkflowCanvas';
import { ToolbarPanel } from '@/components/workflow-designer/Panels/ToolbarPanel';
import { PropertiesPanel } from '@/components/workflow-designer/Panels/PropertiesPanel';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { useWorkflowStore } from '@/components/workflow-designer/Hooks/useWorkflowStore';

export default function WorkflowBuilderPage() {
  const { nodes, edges, reset } = useWorkflowStore();

  const handleSave = () => {
    const workflow = {
      nodes,
      edges,
      savedAt: new Date().toISOString(),
    };
    console.log('Saving workflow:', workflow);
    alert('Workflow saved! (console.log for now)');
  };

  const handleClear = () => {
    if (confirm('Clear all nodes and edges?')) {
      reset();
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b p-4 flex items-center justify-between bg-background">
        <div>
          <h1 className="text-2xl font-bold">Workflow Builder</h1>
          <p className="text-sm text-muted-foreground">
            Design your workflow visually
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleClear}>
            <Icons.Trash className="size-4 mr-2" />
            Clear
          </Button>
          <Button onClick={handleSave}>
            <Icons.Save className="size-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Toolbar */}
        <div className="w-64 border-r p-4 bg-muted/30 overflow-y-auto">
          <ToolbarPanel />
        </div>

        {/* Center Canvas */}
        <div className="flex-1">
          <WorkflowCanvas />
        </div>

        {/* Right Properties Panel */}
        <div className="w-80 border-l overflow-y-auto">
          <PropertiesPanel />
        </div>
      </div>
    </div>
  );
}
```

### **✅ Checklist:**
- [ ] Layout updated (3 columns)
- [ ] Properties panel on right
- [ ] Responsive layout
- [ ] No overflow issues

---

## **🎨 STEP 3: ADD VALIDATION HOOK (45 min)**

**File:** `src/components/workflow-designer/Hooks/useFlowValidation.ts`

```typescript
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
```

### **✅ Checklist:**
- [ ] Validation hook created
- [ ] All validation rules implemented
- [ ] Returns errors and warnings
- [ ] isValid flag works

---

## **🎨 STEP 4: CREATE VALIDATION PANEL (30 min)**

**File:** `src/components/workflow-designer/Panels/ValidationPanel.tsx`

```typescript
'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Icons } from '@/components/icons';
import { useWorkflowStore } from '../Hooks/useWorkflowStore';
import { useFlowValidation } from '../Hooks/useFlowValidation';

export function ValidationPanel() {
  const { nodes, edges } = useWorkflowStore();
  const { errors, hasErrors, hasWarnings, isValid } = useFlowValidation(nodes, edges);

  if (errors.length === 0) {
    return (
      <Alert className="bg-green-50 border-green-200">
        <Icons.CheckCircle2 className="size-4 text-green-600" />
        <AlertDescription className="text-green-800">
          ✓ No issues found. Workflow is valid!
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-2">
      {errors.map((error, index) => (
        <Alert
          key={index}
          variant={error.type === 'error' ? 'destructive' : 'default'}
          className={error.type === 'warning' ? 'bg-yellow-50 border-yellow-200' : ''}
        >
          {error.type === 'error' ? (
            <Icons.AlertCircle className="size-4" />
          ) : (
            <Icons.AlertTriangle className="size-4 text-yellow-600" />
          )}
          <AlertDescription className={error.type === 'warning' ? 'text-yellow-800' : ''}>
            {error.message}
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
}
```

### **✅ Checklist:**
- [ ] ValidationPanel component created
- [ ] Shows success when valid
- [ ] Shows errors in red
- [ ] Shows warnings in yellow
- [ ] Clear visual feedback

---

## **🎨 STEP 5: ADD VALIDATION TO BUILDER (15 min)**

Update builder page to show validation:

```typescript
// Add at bottom of page, before closing main content div
<div className="border-t p-4 bg-background">
  <ValidationPanel />
</div>
```

Full location in layout:

```typescript
<div className="flex-1 flex flex-col overflow-hidden">
  {/* Canvas area */}
  <div className="flex-1">
    <WorkflowCanvas />
  </div>
  
  {/* Validation Panel at bottom */}
  <div className="border-t p-4 bg-background">
    <ValidationPanel />
  </div>
</div>
```

### **✅ Checklist:**
- [ ] ValidationPanel added to layout
- [ ] Shows at bottom of canvas
- [ ] Updates in real-time
- [ ] Doesn't block canvas

---

## **🎨 STEP 6: ADD AUTO-SAVE (30 min)**

**File:** `src/components/workflow-designer/Hooks/useAutoSave.ts`

```typescript
import { useEffect, useRef } from 'react';
import { useWorkflowStore } from './useWorkflowStore';

export function useAutoSave(enabled: boolean = true, intervalMs: number = 30000) {
  const { nodes, edges } = useWorkflowStore();
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!enabled) return;

    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      const draft = {
        nodes,
        edges,
        lastSaved: new Date().toISOString(),
      };
      
      // Save to localStorage
      localStorage.setItem('workflow-draft', JSON.stringify(draft));
      console.log('Auto-saved at', new Date().toLocaleTimeString());
    }, intervalMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [nodes, edges, enabled, intervalMs]);
}

// Helper to load draft
export function loadDraft() {
  const draft = localStorage.getItem('workflow-draft');
  if (draft) {
    try {
      return JSON.parse(draft);
    } catch {
      return null;
    }
  }
  return null;
}

// Helper to clear draft
export function clearDraft() {
  localStorage.removeItem('workflow-draft');
}
```

Add to builder page:

```typescript
import { useAutoSave, loadDraft, clearDraft } from '@/components/workflow-designer/Hooks/useAutoSave';
import { useEffect } from 'react';

// Inside component:
const { setNodes, setEdges } = useWorkflowStore();

// Load draft on mount
useEffect(() => {
  const draft = loadDraft();
  if (draft && confirm('Found unsaved work. Load it?')) {
    setNodes(draft.nodes || []);
    setEdges(draft.edges || []);
  }
}, []);

// Auto-save every 30 seconds
useAutoSave(true, 30000);

// Clear draft on successful save
const handleSave = () => {
  // ... existing save logic
  clearDraft();
};
```

### **✅ Checklist:**
- [ ] Auto-save hook created
- [ ] Saves to localStorage every 30s
- [ ] Load draft on page load
- [ ] Clear draft on save
- [ ] Console logs auto-save

---

## **🎨 STEP 7: ENHANCE NODE DISPLAY (30 min)**

Update ProcessNode to show validation errors:

```typescript
'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';

export const ProcessNode = memo(({ data, selected }: NodeProps) => {
  const hasErrors = !data.label?.trim() || !data.assignedRole || !data.deadlineHours;

  return (
    <Card 
      className={`min-w-[200px] p-3 border-2 ${
        hasErrors ? 'border-red-500' : 
        selected ? 'border-primary shadow-lg' : 
        'border-border'
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-blue-500 !w-3 !h-3 !border-2 !border-white"
      />
      
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Icons.CheckCircle2 className={`size-4 ${hasErrors ? 'text-red-500' : 'text-blue-500'}`} />
          <span className="font-semibold text-sm">
            {data.label || 'Unnamed Step'}
          </span>
          {hasErrors && (
            <Icons.AlertCircle className="size-3 text-red-500 ml-auto" />
          )}
        </div>
        
        {data.assignedRole ? (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Icons.User className="size-3" />
            <span>{data.assignedRole}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-xs text-red-500">
            <Icons.AlertCircle className="size-3" />
            <span>No role assigned</span>
          </div>
        )}
        
        {data.deadlineHours > 0 && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Icons.Clock className="size-3" />
            <span>{data.deadlineHours}h deadline</span>
          </div>
        )}
      </div>
      
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-blue-500 !w-3 !h-3 !border-2 !border-white"
      />
    </Card>
  );
});

ProcessNode.displayName = 'ProcessNode';
```

### **✅ Checklist:**
- [ ] ProcessNode shows validation errors
- [ ] Red border when errors
- [ ] Alert icon visible
- [ ] Missing data highlighted

---

## **✅ PHASE 2 COMPLETION CHECKLIST**

### **Components:**
- [ ] PropertiesPanel created and working
- [ ] ValidationPanel created and working
- [ ] Validation hook implemented
- [ ] Auto-save hook implemented

### **Functionality:**
- [ ] Can edit node name
- [ ] Can edit node description
- [ ] Can assign role (dropdown works)
- [ ] Can set deadline
- [ ] Can toggle notifications
- [ ] Validation shows errors
- [ ] Validation shows warnings
- [ ] Auto-save works (check console)
- [ ] Draft loads on refresh
- [ ] Draft clears on save

### **Layout:**
- [ ] Properties panel on right
- [ ] Validation panel at bottom
- [ ] Layout responsive
- [ ] No overflow issues

### **Visual:**
- [ ] Nodes show validation errors
- [ ] Selected node highlighted
- [ ] Clear visual feedback
- [ ] Icons appropriate

---

## **📸 EXPECTED RESULT**

After Phase 2:
```
+------------------------------------------------------+
| Workflow Builder                    [Clear] [Save]  |
+------------------------------------------------------+
| [Toolbar]  |    [Canvas]       | [Properties]       |
|            |                   |                     |
| START      |   ┌─────────┐     | Node Properties    |
| STEP       |   │  START  │     |                    |
| END        |   └────┬────┘     | Name: Problem Def  |
|            |        │           | Description: ...   |
|            |        ▼           |                    |
|            |   ┌─────────┐     | Assigned Role:     |
|            |   │PROBLEM  │     | [PROCESS_OWNER ▼]  |
|            |   │   DEF   │     |                    |
|            |   └─────────┘     | Deadline: [72] hrs |
|            |                   |                    |
|            |                   | Notifications:     |
|            |                   | ☑ On assignment    |
|            +-------------------+ ☑ Before deadline  |
|            | ✓ No issues       |                    |
+------------------------------------------------------+
```

---

**Status:** 📋 Ready to Implement  
**Next:** Phase 3 - Advanced Nodes & Testing
