'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card } from '@/components/ui/card';
import { Icons } from '@/components/icons';

export const DecisionNode = memo(({ data, selected }: NodeProps) => {
  return (
    <Card className={`min-w-[200px] p-3 border-2 ${selected ? 'border-primary shadow-lg' : 'border-yellow-200 dark:border-yellow-800'} bg-yellow-50 dark:bg-yellow-950`}>
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-yellow-500 dark:!bg-yellow-400 !w-3 !h-3 !border-2 !border-background"
      />
      
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Icons.GitBranch className="size-4 text-yellow-600 dark:text-yellow-400" />
          <span className="font-semibold text-sm text-yellow-900 dark:text-yellow-100">{data.label || 'Decision'}</span>
        </div>
        
        {data.condition && (
          <div className="text-xs text-yellow-700 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-900 rounded px-2 py-1 border border-yellow-200 dark:border-yellow-700">
            {data.condition}
          </div>
        )}
      </div>
      
      {/* Yes/True handle (right) */}
      <Handle
        type="source"
        position={Position.Right}
        id="yes"
        className="!bg-green-500 dark:!bg-green-400 !w-3 !h-3 !border-2 !border-background"
        style={{ top: '50%' }}
      />
      
      {/* No/False handle (bottom) */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="no"
        className="!bg-red-500 dark:!bg-red-400 !w-3 !h-3 !border-2 !border-background"
      />
    </Card>
  );
});

DecisionNode.displayName = 'DecisionNode';
