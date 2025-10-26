import { create } from 'zustand';
import { Node, Edge, Connection, addEdge, applyNodeChanges, applyEdgeChanges, NodeChange, EdgeChange } from 'reactflow';

interface WorkflowState {
  // State
  nodes: Node[];
  edges: Edge[];
  selectedNode: Node | null;
  
  // Actions
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  selectNode: (nodeId: string | null) => void;
  addNode: (node: Node) => void;
  deleteNode: (nodeId: string) => void;
  updateNodeData: (nodeId: string, data: any) => void;
  reset: () => void;
}

export const useWorkflowStore = create<WorkflowState>()((set, get) => ({
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
