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
