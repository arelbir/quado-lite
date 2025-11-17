'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card } from '@/components/ui/card';
import { Icons } from '@/components/shared/icons';
import { useTranslations } from 'next-intl';

export const EndNode = memo(({ data, selected }: NodeProps) => {
  const t = useTranslations('workflow');
  return (
    <Card className={`min-w-[180px] p-3 border-2 ${selected ? 'border-primary shadow-lg' : 'border-border'}`}>
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-red-500 !w-3 !h-3 !border-2 !border-white"
      />
      
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center size-8 rounded-full bg-red-500">
          <Icons.Flag className="size-4 text-white" />
        </div>
        <span className="font-semibold text-sm">{data.label || t('step.end')}</span>
      </div>
    </Card>
  );
});

EndNode.displayName = 'EndNode';
