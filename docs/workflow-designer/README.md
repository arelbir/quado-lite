# 🎯 WORKFLOW DESIGNER IMPLEMENTATION PLAN

**Project:** Denetim Uygulaması  
**Feature:** Visual Workflow Designer UI  
**Technology:** React Flow + Next.js 15  
**Total Duration:** 9 days

---

## **📁 PLAN STRUCTURE**

| File | Description | Duration | Status |
|------|-------------|----------|--------|
| `00-OVERVIEW.md` | Architecture, technology choice, schema | - | ✅ Ready |
| `01-PHASE1.md` | Basic canvas & drag-drop | 2 days | 📋 Pending |
| `02-PHASE2.md` | Node configuration & properties | 2 days | 📋 Pending |
| `03-PHASE3-4.md` | Advanced features & integration | 5 days | 📋 Pending |

---

## **🎯 QUICK START**

### **Step 1: Read Overview**
```bash
# Open and read
docs/workflow-designer/00-OVERVIEW.md
```

**What you'll learn:**
- Why React Flow?
- Architecture overview
- Database schema
- Success metrics

### **Step 2: Install Dependencies**
```bash
cd nextjs-admin-shadcn
pnpm add reactflow dagre
pnpm add -D @types/dagre
```

### **Step 3: Start Phase 1**
```bash
# Read Phase 1 plan
docs/workflow-designer/01-PHASE1.md

# Follow step-by-step checklist
# Complete all items before moving to Phase 2
```

---

## **📊 PHASES BREAKDOWN**

### **PHASE 1: Basic Canvas (2 days)**

**Goal:** Working canvas with basic nodes

**Deliverables:**
- ✅ React Flow canvas
- ✅ 3 node types (Start, Process, End)
- ✅ Drag & drop from toolbar
- ✅ Connect nodes with edges
- ✅ Pan & zoom
- ✅ Save/Load JSON

**Files Created:**
- `components/workflow-designer/Canvas/WorkflowCanvas.tsx`
- `components/workflow-designer/Nodes/StartNode.tsx`
- `components/workflow-designer/Nodes/ProcessNode.tsx`
- `components/workflow-designer/Nodes/EndNode.tsx`
- `components/workflow-designer/Panels/ToolbarPanel.tsx`
- `components/workflow-designer/Hooks/useWorkflowStore.ts`
- `app/(main)/admin/workflows/builder/page.tsx`

**Success Criteria:**
- [ ] Can add nodes from toolbar
- [ ] Can drag nodes around
- [ ] Can connect nodes
- [ ] Save button logs to console

---

### **PHASE 2: Properties & Validation (2 days)**

**Goal:** Configure nodes and validate flow

**Deliverables:**
- ✅ Properties panel (right sidebar)
- ✅ Node configuration forms
- ✅ Role assignment dropdown
- ✅ Deadline settings
- ✅ Notification toggles
- ✅ Real-time validation
- ✅ Auto-save to localStorage

**Files Created:**
- `components/workflow-designer/Panels/PropertiesPanel.tsx`
- `components/workflow-designer/Panels/ValidationPanel.tsx`
- `components/workflow-designer/Hooks/useFlowValidation.ts`
- `components/workflow-designer/Hooks/useAutoSave.ts`

**Success Criteria:**
- [ ] Can edit node properties
- [ ] Validation shows errors/warnings
- [ ] Auto-save works every 30s
- [ ] Draft loads on refresh

---

### **PHASE 3: Advanced Nodes (3 days)**

**Goal:** Add complex node types and features

**Deliverables:**
- ✅ Decision node (branching)
- ✅ Approval node (multi-approver)
- ✅ Conditional edges
- ✅ Auto-layout algorithm (Dagre)
- ✅ Enhanced properties panel

**Files Created:**
- `components/workflow-designer/Nodes/DecisionNode.tsx`
- `components/workflow-designer/Nodes/ApprovalNode.tsx`
- `components/workflow-designer/Edges/ConditionalEdge.tsx`
- `components/workflow-designer/Canvas/AutoLayout.ts`

**Success Criteria:**
- [ ] Decision nodes create branches
- [ ] Approval nodes configure approvers
- [ ] Auto-layout arranges nodes nicely
- [ ] All node types work together

---

### **PHASE 4: Database Integration (2 days)**

**Goal:** Persist workflows to database

**Deliverables:**
- ✅ Database schema (WorkflowDefinition)
- ✅ Migration file
- ✅ Server actions (save, load, list)
- ✅ Workflow list page
- ✅ Edit existing workflows
- ✅ Version control

**Files Created:**
- `drizzle/schema/workflow.ts`
- `server/actions/workflow-actions.ts`
- `app/(main)/admin/workflows/definitions/page.tsx`
- `app/(main)/admin/workflows/builder/[id]/page.tsx`

**Success Criteria:**
- [ ] Workflows save to database
- [ ] Can load and edit existing workflows
- [ ] List page shows all workflows
- [ ] Version history maintained

---

## **✅ OVERALL CHECKLIST**

### **Prerequisites:**
- [ ] Next.js project running
- [ ] Database configured
- [ ] Auth system working
- [ ] shadcn/ui installed

### **Phase Completion:**
- [ ] Phase 1 complete (Basic canvas)
- [ ] Phase 2 complete (Properties & validation)
- [ ] Phase 3 complete (Advanced nodes)
- [ ] Phase 4 complete (Database integration)

### **Testing:**
- [ ] All node types work
- [ ] Validation catches errors
- [ ] Save/load works
- [ ] Auto-layout works
- [ ] No console errors
- [ ] Good performance (60 FPS)

### **Documentation:**
- [ ] User guide written
- [ ] API documentation
- [ ] Component documentation
- [ ] Team trained

### **Deployment:**
- [ ] Feature flag enabled
- [ ] Monitoring added
- [ ] Performance tracked
- [ ] User feedback collected

---

## **🎯 KEY FEATURES**

### **Canvas Features:**
- ✅ Drag & drop nodes
- ✅ Connect with edges
- ✅ Pan & zoom
- ✅ Grid background
- ✅ Minimap
- ✅ Auto-layout
- ✅ Snap to grid

### **Node Types:**
1. **Start Node** - Workflow entry point
2. **Process Node** - Regular step (role, deadline, notifications)
3. **End Node** - Workflow termination
4. **Decision Node** - Conditional branching (if/else)
5. **Approval Node** - Manager approval (single/multiple/unanimous)
6. **Parallel Node** - Concurrent execution (future)

### **Configuration:**
- ✅ Step name & description
- ✅ Role assignment (dropdown)
- ✅ Deadline (hours)
- ✅ Notifications (on assign, before deadline, on overdue)
- ✅ Conditions (for decision nodes)
- ✅ Approvers (for approval nodes)

### **Validation:**
- ✅ Exactly 1 start node
- ✅ At least 1 end node
- ✅ No orphaned nodes
- ✅ All required fields filled
- ✅ Valid role assignments
- ✅ Positive deadlines

### **Persistence:**
- ✅ Auto-save to localStorage (draft)
- ✅ Save to database (versions)
- ✅ Load existing workflows
- ✅ Version history
- ✅ Publish/activate

---

## **📚 TECH STACK**

| Technology | Version | Purpose |
|------------|---------|---------|
| **React Flow** | 11.10.0 | Visual canvas |
| **Dagre** | 0.8.5 | Auto-layout |
| **Zustand** | 4.4.7 | State management |
| **Next.js** | 15.x | Framework |
| **TypeScript** | 5.x | Type safety |
| **Drizzle ORM** | Latest | Database |
| **shadcn/ui** | Latest | UI components |

---

## **🎨 UI MOCKUP**

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ Workflow Builder                          [Auto Layout] [Save] ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃                                                                 ┃
┃  ┌──────────┐  ┃                          ┃  ┌──────────────┐ ┃
┃  │ + START  │  ┃     ┌──────────┐         ┃  │  Properties  │ ┃
┃  │ + STEP   │  ┃     │  START   │         ┃  │              │ ┃
┃  │ + DECISION│  ┃     └────┬─────┘         ┃  │ Step Name:   │ ┃
┃  │ + APPROVAL│  ┃          │               ┃  │ [Problem Def]│ ┃
┃  │ + END    │  ┃          ▼               ┃  │              │ ┃
┃  └──────────┘  ┃     ┌──────────┐         ┃  │ Role:        │ ┃
┃                ┃     │ PROBLEM  │         ┃  │ [OWNER ▼]    │ ┃
┃  [Node         ┃     │   DEF    │ ◄────┐  ┃  │              │ ┃
┃   Palette]     ┃     └────┬─────┘      │  ┃  │ Deadline:    │ ┃
┃                ┃          │            │  ┃  │ [72] hours   │ ┃
┃                ┃          ▼            │  ┃  │              │ ┃
┃                ┃     ┌──────────┐      │  ┃  │ ☑ Notify on  │ ┃
┃                ┃     │   ROOT   │      │  ┃  │   assignment │ ┃
┃                ┃     │ ANALYSIS │      │  ┃  │              │ ┃
┃                ┃     └────┬─────┘      │  ┃  │ [Delete]     │ ┃
┃                ┃          │            │  ┃  └──────────────┘ ┃
┃                ┃          ▼            │  ┃                   ┃
┃                ┃     ┌──────────┐      │  ┃                   ┃
┃                ┃     │ APPROVAL │──────┘  ┃                   ┃
┃                ┃     └────┬─────┘         ┃                   ┃
┃                ┃          │               ┃                   ┃
┃                ┃          ▼               ┃                   ┃
┃                ┃     ┌──────────┐         ┃                   ┃
┃                ┃     │   END    │         ┃                   ┃
┃                ┃     └──────────┘         ┃                   ┃
┃                ┃                          ┃                   ┃
┃ [Toolbar]      ┃    [Canvas Area]         ┃  [Properties]     ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃ ✓ Validation: No issues found                                  ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

---

## **🚀 HOW TO USE THIS PLAN**

### **Daily Workflow:**

1. **Morning:**
   - Read current phase plan
   - Review checklist
   - Set daily goals

2. **Development:**
   - Follow step-by-step instructions
   - Test each component
   - Check off completed items

3. **Evening:**
   - Review progress
   - Update checklist
   - Commit code

### **Phase Transition:**

1. **Complete all checklist items**
2. **Test thoroughly**
3. **Commit with message:** `feat: Complete Phase X - [description]`
4. **Read next phase plan**
5. **Start next phase**

### **Blocked?**

1. Check troubleshooting section in phase doc
2. Review React Flow documentation
3. Check console for errors
4. Ask team for help

---

## **📞 SUPPORT**

### **Documentation:**
- React Flow: https://reactflow.dev/
- Dagre: https://github.com/dagrejs/dagre
- Zustand: https://zustand-demo.pmnd.rs/

### **Internal:**
- See `00-OVERVIEW.md` for architecture
- See individual phase docs for implementation details
- Check existing workflow system in `src/server/seed/09-workflows.ts`

---

## **✅ SUCCESS CRITERIA**

Project is complete when:
- [ ] All 4 phases finished
- [ ] All checklists checked
- [ ] All tests passing
- [ ] Documentation complete
- [ ] Team trained
- [ ] Feature deployed
- [ ] Users can create workflows visually
- [ ] Workflows execute correctly

---

## **🎉 FINAL DELIVERABLES**

1. **Visual workflow designer** - Full UI
2. **Database schema** - Workflow storage
3. **Server actions** - CRUD operations
4. **List page** - Browse workflows
5. **Edit mode** - Modify existing
6. **Version control** - History tracking
7. **Validation** - Error checking
8. **Documentation** - User guide

---

**Current Status:** 📋 Planning Complete, Ready to Start  
**Next Action:** Read `00-OVERVIEW.md` and install dependencies

**Good luck! 🚀**
