'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icons } from '@/components/shared/icons';
import { useWorkflowStore } from '../Hooks/useWorkflowStore';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

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

  const onDragStart = (event: React.DragEvent, nodeType: 'start' | 'process' | 'end' | 'decision' | 'approval') => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const nodeTypes = [
    { type: 'start' as const, icon: Icons.Play, color: 'text-green-500', label: t('step.start') },
    { type: 'process' as const, icon: Icons.CheckCircle2, color: 'text-blue-500', label: t('step.process') },
    { type: 'end' as const, icon: Icons.Flag, color: 'text-red-500', label: t('step.end') },
    { type: 'decision' as const, icon: Icons.GitBranch, color: 'text-yellow-500', label: t('step.decision') },
    { type: 'approval' as const, icon: Icons.ShieldCheck, color: 'text-purple-500', label: t('step.approval') },
  ];

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold mb-2">{t('toolbar.addNode')}</h3>
          <p className="text-xs text-muted-foreground mb-3">
            Drag to canvas or click to add
          </p>
        </div>
        
        <Separator />
        
        <div className="space-y-2">
          {nodeTypes.map(({ type, icon: Icon, color, label }) => (
            <div
              key={type}
              draggable
              onDragStart={(e) => onDragStart(e, type)}
              className="cursor-move"
            >
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2 hover:bg-accent"
                onClick={() => handleAddNode(type)}
              >
                <Icon className={`size-4 ${color}`} />
                <span>{label}</span>
                <Badge variant="secondary" className="ml-auto text-xs">
                  {type}
                </Badge>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
