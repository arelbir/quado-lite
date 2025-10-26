# 🎯 PHASE 1: BASIC CANVAS & DRAG-DROP

**Duration:** 2 days  
**Status:** 📋 Planning  
**Focus:** Foundation - Canvas, nodes, basic interactions

---

## **🎯 OBJECTIVES**

Create the foundation of the workflow designer:
- ✅ Working React Flow canvas
- ✅ Basic node types (Start, Process, End)
- ✅ Drag & drop from toolbar
- ✅ Connect nodes with edges
- ✅ Pan & zoom canvas
- ✅ Select & delete nodes
- ✅ Save workflow JSON
- ✅ Load existing workflows

---

## **📦 STEP 1: INSTALL DEPENDENCIES (30 min)**

### **1.1 Install Packages:**
```bash
cd nextjs-admin-shadcn
pnpm add reactflow dagre
pnpm add -D @types/dagre
```

### **1.2 Verify Installation:**
```bash
pnpm list reactflow
pnpm list dagre
```

**Expected Output:**
```
reactflow 11.10.0
dagre 0.8.5
```

### **✅ Checklist:**
- [ ] reactflow installed
- [ ] dagre installed
- [ ] @types/dagre installed
- [ ] No dependency conflicts

---

## **📂 STEP 2: CREATE FILE STRUCTURE (15 min)**

### **2.1 Create Directories:**
```bash
mkdir -p src/components/workflow-designer/Canvas
mkdir -p src/components/workflow-designer/Nodes
mkdir -p src/components/workflow-designer/Edges
mkdir -p src/components/workflow-designer/Panels
mkdir -p src/components/workflow-designer/Hooks
mkdir -p src/app/(main)/admin/workflows/builder
```

### **2.2 File Structure:**
```
src/
├── components/workflow-designer/
│   ├── Canvas/
│   │   └── WorkflowCanvas.tsx          # Main canvas
│   ├── Nodes/
│   │   ├── StartNode.tsx               # Start node
│   │   ├── ProcessNode.tsx             # Process step
│   │   └── EndNode.tsx                 # End node
│   ├── Edges/
│   │   └── DefaultEdge.tsx             # Default edge
│   ├── Panels/
│   │   └── ToolbarPanel.tsx            # Node palette
│   └── Hooks/
│       └── useWorkflowStore.ts         # Zustand store
└── app/(main)/admin/workflows/
    └── builder/
        └── page.tsx                    # Builder page
```

### **✅ Checklist:**
- [ ] All directories created
- [ ] File structure ready

---

## **🎨 STEP 3: CREATE ZUSTAND STORE (30 min)**

### **3.1 Create Store:**

**File:** `src/components/workflow-designer/Hooks/useWorkflowStore.ts`

```typescript
import { create } from 'zustand';
import { Node, Edge, Connection, addEdge, applyNodeChanges, applyEdgeChanges } from 'reactflow';

interface WorkflowState {
  // State
  nodes: Node[];
  edges: Edge[];
  selectedNode: Node | null;
  
  // Actions
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  onConnect: (connection: Connection) => void;
  selectNode: (nodeId: string | null) => void;
  addNode: (node: Node) => void;
  deleteNode: (nodeId: string) => void;
  updateNodeData: (nodeId: string, data: any) => void;
  reset: () => void;
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  // Initial State
  nodes: [],
  edges: [],
  selectedNode: null,
  
  // Set nodes
  setNodes: (nodes) => set({ nodes }),
  
  // Set edges
  setEdges: (edges) => set({ edges }),
  
  // Handle node changes (position, selection, etc)
  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },
  
  // Handle edge changes
  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  
  // Handle connection between nodes
  onConnect: (connection) => {
    set({
      edges: addEdge(connection, get().edges),
    });
  },
  
  // Select node
  selectNode: (nodeId) => {
    const node = nodeId ? get().nodes.find(n => n.id === nodeId) : null;
    set({ selectedNode: node || null });
  },
  
  // Add node
  addNode: (node) => {
    set({
      nodes: [...get().nodes, node],
    });
  },
  
  // Delete node
  deleteNode: (nodeId) => {
    set({
      nodes: get().nodes.filter(n => n.id !== nodeId),
      edges: get().edges.filter(e => e.source !== nodeId && e.target !== nodeId),
      selectedNode: get().selectedNode?.id === nodeId ? null : get().selectedNode,
    });
  },
  
  // Update node data
  updateNodeData: (nodeId, data) => {
    set({
      nodes: get().nodes.map(node =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...data } }
          : node
      ),
    });
  },
  
  // Reset store
  reset: () => set({ nodes: [], edges: [], selectedNode: null }),
}));
```

### **✅ Checklist:**
- [ ] Store created with all actions
- [ ] TypeScript types defined
- [ ] No compilation errors

---

## **🎨 STEP 4: CREATE NODE COMPONENTS (1 hour)**

### **4.1 Start Node:**

**File:** `src/components/workflow-designer/Nodes/StartNode.tsx`

```typescript
'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card } from '@/components/ui/card';
import { Icons } from '@/components/icons';

export const StartNode = memo(({ data, selected }: NodeProps) => {
  return (
    <Card className={`min-w-[180px] p-3 border-2 ${selected ? 'border-primary shadow-lg' : 'border-border'}`}>
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center size-8 rounded-full bg-green-500">
          <Icons.Play className="size-4 text-white" />
        </div>
        <span className="font-semibold text-sm">{data.label || 'Start'}</span>
      </div>
      
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-green-500 !w-3 !h-3 !border-2 !border-white"
      />
    </Card>
  );
});

StartNode.displayName = 'StartNode';
```

### **4.2 Process Node:**

**File:** `src/components/workflow-designer/Nodes/ProcessNode.tsx`

```typescript
'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';

export const ProcessNode = memo(({ data, selected }: NodeProps) => {
  return (
    <Card className={`min-w-[200px] p-3 border-2 ${selected ? 'border-primary shadow-lg' : 'border-border'}`}>
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-blue-500 !w-3 !h-3 !border-2 !border-white"
      />
      
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Icons.CheckCircle2 className="size-4 text-blue-500" />
          <span className="font-semibold text-sm">{data.label || 'Process Step'}</span>
        </div>
        
        {data.assignedRole && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Icons.User className="size-3" />
            <span>{data.assignedRole}</span>
          </div>
        )}
        
        {data.deadlineHours && (
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

### **4.3 End Node:**

**File:** `src/components/workflow-designer/Nodes/EndNode.tsx`

```typescript
'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card } from '@/components/ui/card';
import { Icons } from '@/components/icons';

export const EndNode = memo(({ data, selected }: NodeProps) => {
  return (
    <Card className={`min-w-[180px] p-3 border-2 ${selected ? 'border-primary shadow-lg' : 'border-border'}`}>
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-red-500 !w-3 !h-3 !border-2 !border-white"
      />
      
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center size-8 rounded-full bg-red-500">
          <Icons.Flag className="size-4 text-white" />
        </div>
        <span className="font-semibold text-sm">{data.label || 'End'}</span>
      </div>
    </Card>
  );
});

EndNode.displayName = 'EndNode';
```

### **✅ Checklist:**
- [ ] StartNode created
- [ ] ProcessNode created
- [ ] EndNode created
- [ ] All nodes render correctly
- [ ] Handles positioned properly

---

## **🎨 STEP 5: CREATE TOOLBAR (45 min)**

**File:** `src/components/workflow-designer/Panels/ToolbarPanel.tsx`

```typescript
'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { useWorkflowStore } from '../Hooks/useWorkflowStore';

export function ToolbarPanel() {
  const addNode = useWorkflowStore((state) => state.addNode);
  const nodes = useWorkflowStore((state) => state.nodes);

  const handleAddNode = (type: 'start' | 'process' | 'end') => {
    const nodeId = `${type}-${Date.now()}`;
    
    // Position new nodes in center
    const newNode = {
      id: nodeId,
      type,
      position: { 
        x: 250 + nodes.length * 50, 
        y: 100 + nodes.length * 50 
      },
      data: {
        label: type === 'start' ? 'Start' : type === 'end' ? 'End' : 'New Step',
        ...(type === 'process' && {
          assignedRole: '',
          deadlineHours: 24,
        }),
      },
    };

    addNode(newNode);
  };

  return (
    <Card className="p-4">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold mb-3">Add Node</h3>
        
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2"
          onClick={() => handleAddNode('start')}
        >
          <Icons.Play className="size-4 text-green-500" />
          <span>Start</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2"
          onClick={() => handleAddNode('process')}
        >
          <Icons.CheckCircle2 className="size-4 text-blue-500" />
          <span>Process Step</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2"
          onClick={() => handleAddNode('end')}
        >
          <Icons.Flag className="size-4 text-red-500" />
          <span>End</span>
        </Button>
      </div>
    </Card>
  );
}
```

### **✅ Checklist:**
- [ ] Toolbar component created
- [ ] Add node buttons work
- [ ] Nodes positioned correctly

---

## **🎨 STEP 6: CREATE MAIN CANVAS (1 hour)**

**File:** `src/components/workflow-designer/Canvas/WorkflowCanvas.tsx`

```typescript
'use client';

import { useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useWorkflowStore } from '../Hooks/useWorkflowStore';
import { StartNode } from '../Nodes/StartNode';
import { ProcessNode } from '../Nodes/ProcessNode';
import { EndNode } from '../Nodes/EndNode';

const nodeTypes = {
  start: StartNode,
  process: ProcessNode,
  end: EndNode,
};

export function WorkflowCanvas() {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    selectNode,
  } = useWorkflowStore();

  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: any) => {
      selectNode(node.id);
    },
    [selectNode]
  );

  const handlePaneClick = useCallback(() => {
    selectNode(null);
  }, [selectNode]);

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        nodeTypes={nodeTypes}
        fitView
        snapToGrid
        snapGrid={[15, 15]}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
        />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            switch (node.type) {
              case 'start':
                return '#22c55e';
              case 'end':
                return '#ef4444';
              default:
                return '#3b82f6';
            }
          }}
          maskColor="rgba(0, 0, 0, 0.1)"
        />
      </ReactFlow>
    </div>
  );
}
```

### **✅ Checklist:**
- [ ] Canvas component created
- [ ] React Flow integrated
- [ ] Background, Controls, MiniMap added
- [ ] Node types registered
- [ ] Click handlers work

---

## **🎨 STEP 7: CREATE BUILDER PAGE (30 min)**

**File:** `src/app/(main)/admin/workflows/builder/page.tsx`

```typescript
'use client';

import { WorkflowCanvas } from '@/components/workflow-designer/Canvas/WorkflowCanvas';
import { ToolbarPanel } from '@/components/workflow-designer/Panels/ToolbarPanel';
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
    // TODO: Save to database (Phase 4)
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
            Drag nodes from the toolbar and connect them
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
      <div className="flex-1 flex">
        {/* Toolbar */}
        <div className="w-64 border-r p-4 bg-muted/30">
          <ToolbarPanel />
        </div>

        {/* Canvas */}
        <div className="flex-1">
          <WorkflowCanvas />
        </div>
      </div>
    </div>
  );
}
```

### **✅ Checklist:**
- [ ] Builder page created
- [ ] Layout correct (toolbar + canvas)
- [ ] Header with save/clear buttons
- [ ] Basic functionality works

---

## **🎨 STEP 8: ADD TO MENU (15 min)**

### **8.1 Update Menu Seed:**

**File:** `src/server/seed/04-menus.ts`

Add workflow builder to workflow operations:

```typescript
{
  path: "/workflow-operations",
  label: "workflowOperations",
  icon: "Workflow",
  parentId: null,
  status: "active",
  createBy: adminId,
  type: 'dir',
  children: [
    // ... existing children
    {
      path: "/admin/workflows/builder",
      label: "workflowBuilder",
      icon: "Workflow",
      parentId: null,
      status: "active",
      createBy: adminId,
      type: 'menu',
    },
  ],
},
```

### **8.2 Add Translation:**

**File:** `src/i18n/locales/tr/navigation.json`
```json
{
  "menu": {
    "workflowBuilder": "İş Akışı Tasarımcısı"
  }
}
```

**File:** `src/i18n/locales/en/navigation.json`
```json
{
  "menu": {
    "workflowBuilder": "Workflow Builder"
  }
}
```

### **✅ Checklist:**
- [ ] Menu item added
- [ ] Translations added (TR + EN)
- [ ] Menu appears in sidebar

---

## **✅ PHASE 1 COMPLETION CHECKLIST**

### **Installation:**
- [ ] Dependencies installed
- [ ] No conflicts

### **File Structure:**
- [ ] All directories created
- [ ] All files created

### **Components:**
- [ ] Zustand store working
- [ ] StartNode renders
- [ ] ProcessNode renders
- [ ] EndNode renders
- [ ] Toolbar works
- [ ] Canvas renders
- [ ] Builder page works

### **Functionality:**
- [ ] Can add nodes from toolbar
- [ ] Can drag nodes around
- [ ] Can connect nodes with edges
- [ ] Can select nodes
- [ ] Can delete nodes (via keyboard)
- [ ] Can pan canvas
- [ ] Can zoom canvas
- [ ] MiniMap shows nodes
- [ ] Save button logs to console

### **Menu:**
- [ ] Menu item added
- [ ] Translations work
- [ ] Can navigate to builder

---

## **🐛 TROUBLESHOOTING**

### **Issue: React Flow styles not loading**
**Solution:** Ensure `import 'reactflow/dist/style.css'` is in WorkflowCanvas.tsx

### **Issue: Nodes not draggable**
**Solution:** Check `onNodesChange` is connected to store

### **Issue: Can't connect nodes**
**Solution:** Check `onConnect` is connected to store

### **Issue: Handles not showing**
**Solution:** Ensure Handle components have correct position

---

## **📸 EXPECTED RESULT**

After Phase 1, you should have:
- ✅ Working canvas with grid background
- ✅ Toolbar with 3 node types
- ✅ Ability to add, move, connect nodes
- ✅ MiniMap showing overview
- ✅ Save button (logs to console)

**Screenshot Description:**
```
+----------------------------------+
| Workflow Builder    [Clear][Save]|
+----------------------------------+
| [Toolbar]  |      [Canvas]       |
| ┌────────┐ |   ┌─────────┐       |
| │ START  │ |   │  START  │       |
| │ STEP   │ |   └────┬────┘       |
| │ END    │ |        │             |
| └────────┘ |        ▼             |
|            |   ┌─────────┐        |
|            |   │ PROCESS │        |
|            |   └────┬────┘        |
|            |        │             |
|            |        ▼             |
|            |   ┌─────────┐        |
|            |   │   END   │        |
|            |   └─────────┘        |
+----------------------------------+
```

---

## **📝 NEXT STEPS**

1. ✅ Complete all Phase 1 checklist items
2. ✅ Test all functionality
3. ✅ Commit changes
4. 📖 Read Phase 2 plan (`02-PHASE2.md`)
5. 🔨 Start Phase 2 implementation

---

**Status:** 📋 Ready to Implement  
**Next:** Phase 2 - Node Configuration
