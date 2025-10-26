'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card } from '@/components/ui/card';
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
