'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { useWorkflowStore } from '../Hooks/useWorkflowStore';

export function ToolbarPanel() {
  const addNode = useWorkflowStore((state) => state.addNode);
  const nodes = useWorkflowStore((state) => state.nodes);

  const handleAddNode = (type: 'start' | 'process' | 'end' | 'decision' | 'approval') => {
    const nodeId = `${type}-${Date.now()}`;
    
    // Position new nodes in center with slight offset
    const newNode = {
      id: nodeId,
      type,
      position: { 
        x: 250 + nodes.length * 50, 
        y: 100 + nodes.length * 50 
      },
      data: {
        label: 
          type === 'start' ? 'Start' : 
          type === 'end' ? 'End' : 
          type === 'decision' ? 'Decision' :
          type === 'approval' ? 'Approval' :
          'New Step',
        ...(type === 'process' && {
          assignedRole: '',
          deadlineHours: 24,
        }),
        ...(type === 'decision' && {
          condition: '',
        }),
        ...(type === 'approval' && {
          approvers: [],
          approvalType: 'ANY', // ANY or ALL
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
      </div>
    </Card>
  );
}
