'use client';

import { useCallback, useMemo } from 'react';
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
import { DecisionNode } from '../Nodes/DecisionNode';
import { ApprovalNode } from '../Nodes/ApprovalNode';

export function WorkflowCanvas() {
  // Memoize nodeTypes to prevent React Flow warning
  const nodeTypes = useMemo(() => ({
    start: StartNode,
    process: ProcessNode,
    end: EndNode,
    decision: DecisionNode,
    approval: ApprovalNode,
  }), []);

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
              case 'decision':
                return '#eab308';
              case 'approval':
                return '#a855f7';
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
