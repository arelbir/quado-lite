'use client';

import { useCallback, useMemo, useRef } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  ReactFlowProvider,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useWorkflowStore } from '../Hooks/useWorkflowStore';
import { StartNode } from '../Nodes/StartNode';
import { ProcessNode } from '../Nodes/ProcessNode';
import { EndNode } from '../Nodes/EndNode';
import { DecisionNode } from '../Nodes/DecisionNode';
import { ApprovalNode } from '../Nodes/ApprovalNode';
import { useTranslations } from 'next-intl';

function WorkflowCanvasInner() {
  const t = useTranslations('workflow');
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();
  
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
    addNode,
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

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow') as 'start' | 'process' | 'end' | 'decision' | 'approval';

      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const nodeId = `${type}-${Date.now()}`;
      
      const newNode = {
        id: nodeId,
        type,
        position,
        data: {
          label: 
            type === 'start' ? t('step.start') : 
            type === 'end' ? t('step.end') : 
            type === 'decision' ? t('step.decision') :
            type === 'approval' ? t('step.approval') :
            t('step.newStep'),
          ...(type === 'process' && {
            assignedRole: '',
            deadlineHours: 24,
          }),
          ...(type === 'decision' && {
            condition: '',
          }),
          ...(type === 'approval' && {
            approvers: [],
            approvalType: 'ANY',
          }),
        },
      };

      addNode(newNode);
    },
    [screenToFlowPosition, t, addNode]
  );

  return (
    <div ref={reactFlowWrapper} className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#94a3b8', strokeWidth: 2 },
        }}
        fitView
        snapToGrid
        snapGrid={[15, 15]}
        deleteKeyCode="Delete"
        multiSelectionKeyCode="Shift"
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

export function WorkflowCanvas() {
  return (
    <ReactFlowProvider>
      <WorkflowCanvasInner />
    </ReactFlowProvider>
  );
}
