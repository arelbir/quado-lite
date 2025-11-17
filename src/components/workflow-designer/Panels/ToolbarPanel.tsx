'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icons } from '@/components/shared/icons';
import { useWorkflowStore } from '../Hooks/useWorkflowStore';
import { useTranslations } from 'next-intl';

export function ToolbarPanel() {
  const t = useTranslations('workflow');
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
          approvalType: 'ANY', // ANY or ALL
        }),
      },
    };

    addNode(newNode);
  };

  return (
    <Card className="p-4">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold mb-3">{t('toolbar.addNode')}</h3>
        
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2"
          onClick={() => handleAddNode('start')}
        >
          <Icons.Play className="size-4 text-green-500" />
          <span>{t('step.start')}</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2"
          onClick={() => handleAddNode('process')}
        >
          <Icons.CheckCircle2 className="size-4 text-blue-500" />
          <span>{t('step.process')}</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2"
          onClick={() => handleAddNode('end')}
        >
          <Icons.Flag className="size-4 text-red-500" />
          <span>{t('step.end')}</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2"
          onClick={() => handleAddNode('decision')}
        >
          <Icons.GitBranch className="size-4 text-yellow-500" />
          <span>{t('step.decision')}</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2"
          onClick={() => handleAddNode('approval')}
        >
          <Icons.ShieldCheck className="size-4 text-purple-500" />
          <span>{t('step.approval')}</span>
        </Button>
      </div>
    </Card>
  );
}
