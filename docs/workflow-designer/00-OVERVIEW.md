# 🎯 WORKFLOW DESIGNER - OVERVIEW & ARCHITECTURE

**Project:** Denetim Uygulaması  
**Feature:** Visual Workflow Designer UI  
**Status:** Planning Phase  
**Date:** 2025-01-26

---

## **📋 EXECUTIVE SUMMARY**

Projenin mevcut JSON-based workflow sistemine görsel bir designer UI eklemesi. React Flow kullanılarak drag-drop arayüz ile workflow'lar oluşturulacak, düzenlenecek ve test edilecek.

---

## **🎯 CURRENT STATE ANALYSIS**

### **Mevcut Workflow Sistemi:**

**Güçlü Yönler:**
- ✅ JSON-based workflow definitions (flexible)
- ✅ Role-based step assignments
- ✅ Conditional transitions
- ✅ Deadline tracking & notifications
- ✅ 8 workflow definition (seed data)
- ✅ Modules: DOF (8-step CAPA), Actions, Findings, Audits

**Workflow Structure (Current):**
```typescript
interface WorkflowDefinition {
  name: string;
  module: 'DOF' | 'ACTION' | 'FINDING' | 'AUDIT';
  steps: Array<{
    name: string;
    assignedRole: string;
    deadlineHours: number;
    transitions: string[];
    conditions?: Condition[];
  }>;
}
```

**Eksikler:**
- ❌ No visual editor
- ❌ Hard to understand complex flows
- ❌ Manual JSON editing (error-prone)
- ❌ No drag-drop interface
- ❌ Difficult to modify workflows
- ❌ No visual validation

---

## **💡 SOLUTION: REACT FLOW VISUAL DESIGNER**

### **Why React Flow?**

**Pros:**
- ✅ **Production-ready** - 100k+ weekly downloads
- ✅ **Modern** - React 18+ compatible
- ✅ **Customizable** - Custom nodes/edges
- ✅ **TypeScript** - Full type support
- ✅ **Performance** - Large graph rendering
- ✅ **Active** - Well maintained (v11.10)
- ✅ **MIT License** - Free for commercial use
- ✅ **Documentation** - Excellent docs
- ✅ **Ecosystem** - Plugins available

**Alternatives Considered:**
| Library | Pros | Cons | Decision |
|---------|------|------|----------|
| **React Flow** | Modern, flexible, active | Learning curve | ✅ **Selected** |
| BPMN.js | Enterprise standard | Too complex, overkill | ❌ |
| Diagram.js | Simple | Outdated, unmaintained | ❌ |
| Custom Canvas | Full control | Too much work, reinventing wheel | ❌ |

---

## **🏗️ ARCHITECTURE OVERVIEW**

### **1. Module Structure:**

```
/admin/workflows/
├── definitions/              # List all workflows
│   ├── page.tsx             # Main list page
│   └── [id]/                # View workflow details
│       └── page.tsx
├── builder/                  # Workflow Designer
│   ├── page.tsx             # Create new workflow
│   └── [id]/                # Edit existing workflow
│       └── page.tsx
├── analytics/               # Performance metrics (exists)
│   └── page.tsx
└── my-tasks/                # User tasks (exists)
    └── page.tsx
```

### **2. Component Architecture:**

```
components/workflow-designer/
├── Canvas/
│   ├── WorkflowCanvas.tsx          # Main React Flow canvas
│   ├── AutoLayout.tsx              # Dagre auto-layout
│   └── MiniMapOverlay.tsx          # Custom minimap
├── Nodes/
│   ├── StartNode.tsx               # Workflow start
│   ├── ProcessNode.tsx             # Regular step
│   ├── ApprovalNode.tsx            # Manager approval
│   ├── DecisionNode.tsx            # Conditional branch
│   ├── ParallelNode.tsx            # Parallel execution
│   └── EndNode.tsx                 # Workflow end
├── Edges/
│   ├── DefaultEdge.tsx             # Normal transition
│   └── ConditionalEdge.tsx         # With conditions
├── Panels/
│   ├── ToolbarPanel.tsx            # Node palette
│   ├── PropertiesPanel.tsx         # Node configuration
│   ├── ValidationPanel.tsx         # Flow validation
│   └── VersionPanel.tsx            # Version history
├── Dialogs/
│   ├── SaveDialog.tsx              # Save workflow
│   ├── TestDialog.tsx              # Test mode
│   └── PublishDialog.tsx           # Activate workflow
└── Hooks/
    ├── useWorkflowStore.ts         # Zustand store
    ├── useFlowValidation.ts        # Validation logic
    └── useAutoSave.ts              # Auto-save draft
```

### **3. Data Flow:**

```
User Action → UI Component → Zustand Store → React Flow State
                                    ↓
                            Validation Hook
                                    ↓
                            Server Action → Database
```

---

## **🗄️ DATABASE SCHEMA**

### **New Table: WorkflowDefinition**

```typescript
export const workflowDefinitions = pgTable('WorkflowDefinition', {
  // Identification
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  
  // Module & Status
  module: varchar('module', { length: 50 }).notNull(), // 'DOF', 'ACTION', 'FINDING', 'AUDIT'
  status: varchar('status', { length: 20 }).default('DRAFT'), // 'DRAFT', 'ACTIVE', 'ARCHIVED'
  version: integer('version').default(1),
  
  // React Flow Data (visual representation)
  flowData: json('flowData').$type<ReactFlowData>().notNull(),
  
  // Compiled Steps (execution engine)
  steps: json('steps').$type<WorkflowStep[]>().notNull(),
  
  // Metadata
  createdById: uuid('createdById').references(() => user.id).notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
  publishedAt: timestamp('publishedAt'),
  publishedById: uuid('publishedById').references(() => user.id),
});

// Relations
export const workflowDefinitionRelations = relations(workflowDefinitions, ({ one, many }) => ({
  creator: one(user, { fields: [workflowDefinitions.createdById], references: [user.id] }),
  publisher: one(user, { fields: [workflowDefinitions.publishedById], references: [user.id] }),
  versions: many(workflowVersions), // History
}));

// Version History
export const workflowVersions = pgTable('WorkflowVersion', {
  id: uuid('id').primaryKey().defaultRandom(),
  workflowId: uuid('workflowId').references(() => workflowDefinitions.id).notNull(),
  version: integer('version').notNull(),
  flowData: json('flowData').$type<ReactFlowData>().notNull(),
  steps: json('steps').$type<WorkflowStep[]>().notNull(),
  createdById: uuid('createdById').references(() => user.id).notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
  notes: text('notes'), // Change notes
});
```

### **Data Types:**

```typescript
// React Flow Data Structure
interface ReactFlowData {
  nodes: Node[];
  edges: Edge[];
  viewport: { x: number; y: number; zoom: number };
}

// Node Data (stored in Node.data)
interface WorkflowNodeData {
  stepId: string;
  label: string;
  description?: string;
  type: 'start' | 'process' | 'approval' | 'decision' | 'parallel' | 'end';
  
  // Assignment
  assignedRole: string; // Role code
  assignedUserIds?: string[]; // Optional: specific users
  
  // Timing
  deadlineHours?: number;
  estimatedDuration?: number;
  
  // Notifications
  notifications: {
    onAssign: boolean;
    beforeDeadline?: number; // hours before
    onOverdue: boolean;
  };
  
  // Conditions (for decision nodes)
  conditions?: Array<{
    field: string;
    operator: 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains';
    value: any;
    targetStepId: string; // Which step to go to
  }>;
  
  // Approval specific
  approvalType?: 'single' | 'multiple' | 'unanimous';
  approvers?: string[]; // Role codes
}

// Edge Data (stored in Edge.data)
interface WorkflowEdgeData {
  label?: string;
  condition?: {
    type: 'always' | 'if' | 'else';
    expression?: string;
  };
  style?: {
    stroke?: string;
    strokeWidth?: number;
    animated?: boolean;
  };
}

// Compiled Step (for execution)
interface WorkflowStep {
  id: string;
  name: string;
  type: string;
  order: number; // Execution order
  assignedRole: string;
  deadlineHours?: number;
  nextSteps: string[]; // IDs of next steps
  conditions?: Condition[];
  config: Record<string, any>; // Additional config
}
```

---

## **🎯 KEY FEATURES**

### **Phase 1 Features:**
- ✅ Drag & drop canvas
- ✅ Basic nodes (Start, Process, End)
- ✅ Connect nodes with edges
- ✅ Pan & zoom
- ✅ Node selection & deletion
- ✅ Save/Load JSON

### **Phase 2 Features:**
- ✅ Properties panel (right sidebar)
- ✅ Node configuration
- ✅ Role assignment dropdown
- ✅ Deadline configuration
- ✅ Notification settings
- ✅ Real-time validation

### **Phase 3 Features:**
- ✅ Decision nodes (branching)
- ✅ Approval nodes
- ✅ Parallel execution
- ✅ Conditional edges
- ✅ Auto-layout algorithm

### **Phase 4 Features:**
- ✅ Flow validation (no orphans, cycles)
- ✅ Test mode (simulate execution)
- ✅ Version control
- ✅ Publish workflow
- ✅ Integration with workflow engine

---

## **📦 DEPENDENCIES**

```json
{
  "dependencies": {
    "reactflow": "^11.10.0",           // Main library
    "@xyflow/react": "^11.10.0",       // New package name
    "dagre": "^0.8.5",                 // Auto-layout algorithm
    "zustand": "^4.4.7"                // Already installed
  },
  "devDependencies": {
    "@types/dagre": "^0.7.52"          // TypeScript types
  }
}
```

**Installation:**
```bash
pnpm add reactflow dagre
pnpm add -D @types/dagre
```

**Bundle Size:**
- reactflow: ~200KB (gzipped: ~60KB)
- dagre: ~50KB (gzipped: ~15KB)
- **Total:** ~250KB (~75KB gzipped)

---

## **🔐 SECURITY & PERMISSIONS**

### **Access Control:**
- **Create Workflow:** SUPER_ADMIN, QUALITY_MANAGER
- **Edit Draft:** Creator or SUPER_ADMIN
- **Publish:** SUPER_ADMIN only
- **View:** All users (read-only)
- **Test:** Creator or SUPER_ADMIN

### **Validation Rules:**
1. Workflow must have exactly 1 start node
2. Workflow must have at least 1 end node
3. All nodes must be connected (no orphans)
4. No circular dependencies (cycle detection)
5. All required fields must be filled
6. Role assignments must be valid
7. Deadlines must be positive numbers

---

## **📊 SUCCESS METRICS**

### **User Experience:**
- Workflow creation time: < 5 minutes (vs 30+ minutes manual JSON)
- Error rate: < 1% (vs 20%+ manual JSON)
- User satisfaction: > 90%

### **Technical:**
- Page load time: < 2s
- Save operation: < 500ms
- Canvas performance: 60 FPS with 50+ nodes
- Test coverage: > 80%

---

## **🚀 ROADMAP OVERVIEW**

| Phase | Duration | Focus | Status |
|-------|----------|-------|--------|
| **Phase 1** | 2 days | Basic canvas, drag-drop | 📋 Planning |
| **Phase 2** | 2 days | Properties panel, configuration | 📋 Planning |
| **Phase 3** | 3 days | Advanced nodes, conditions | 📋 Planning |
| **Phase 4** | 2 days | Validation, testing, integration | 📋 Planning |
| **Total** | 9 days | Full implementation | 📋 Planning |

---

## **📁 DELIVERABLES**

### **Phase 1:**
- [ ] WorkflowCanvas component
- [ ] Basic node types
- [ ] Toolbar with node palette
- [ ] Save/Load functionality
- [ ] Basic styling

### **Phase 2:**
- [ ] PropertiesPanel component
- [ ] Node configuration forms
- [ ] Role selector integration
- [ ] Validation hooks
- [ ] Auto-save

### **Phase 3:**
- [ ] Advanced node types
- [ ] Conditional edges
- [ ] Auto-layout
- [ ] Test simulator
- [ ] UI polish

### **Phase 4:**
- [ ] Database schema & migration
- [ ] Server actions
- [ ] Workflow engine integration
- [ ] Version control
- [ ] Documentation

---

## **📝 NEXT STEPS**

1. ✅ Read overview (this document)
2. 📖 Read Phase 1 plan (`01-PHASE1.md`)
3. 🔨 Install dependencies
4. 💻 Start Phase 1 implementation
5. ✅ Complete Phase 1 checklist
6. 📖 Move to Phase 2

---

**Status:** ✅ Overview Complete  
**Next Document:** `01-PHASE1.md`
