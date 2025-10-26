'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card } from '@/components/ui/card';
import { Icons } from '@/components/icons';

export const ApprovalNode = memo(({ data, selected }: NodeProps) => {
  return (
    <Card className={`min-w-[220px] p-3 border-2 ${selected ? 'border-primary shadow-lg' : 'border-purple-200 dark:border-purple-800'} bg-purple-50 dark:bg-purple-950`}>
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-purple-500 dark:!bg-purple-400 !w-3 !h-3 !border-2 !border-background"
      />
      
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Icons.ShieldCheck className="size-4 text-purple-600 dark:text-purple-400" />
          <span className="font-semibold text-sm text-purple-900 dark:text-purple-100">{data.label || 'Approval'}</span>
        </div>
        
        {data.approvers && data.approvers.length > 0 && (
          <div className="text-xs space-y-1">
            <div className="text-purple-600 dark:text-purple-400 font-medium">Approvers:</div>
            {data.approvers.slice(0, 2).map((approver: string, i: number) => (
              <div key={i} className="flex items-center gap-1 bg-purple-100 dark:bg-purple-900 rounded px-2 py-1 border border-purple-200 dark:border-purple-700">
                <Icons.User className="size-3 text-purple-600 dark:text-purple-400" />
                <span className="text-purple-900 dark:text-purple-100">{approver}</span>
              </div>
            ))}
            {data.approvers.length > 2 && (
              <div className="text-xs text-purple-600 dark:text-purple-400 pl-2">
                +{data.approvers.length - 2} more
              </div>
            )}
          </div>
        )}
        
        {data.approvalType && (
          <div className="text-xs bg-purple-100 dark:bg-purple-900 rounded px-2 py-1 border border-purple-200 dark:border-purple-700 text-purple-900 dark:text-purple-100">
            <span className="font-medium">Type:</span> {data.approvalType}
          </div>
        )}
      </div>
      
      {/* Approved handle (right) */}
      <Handle
        type="source"
        position={Position.Right}
        id="approved"
        className="!bg-green-500 dark:!bg-green-400 !w-3 !h-3 !border-2 !border-background"
        style={{ top: '50%' }}
      />
      
      {/* Rejected handle (bottom) */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="rejected"
        className="!bg-red-500 dark:!bg-red-400 !w-3 !h-3 !border-2 !border-background"
      />
    </Card>
  );
});

ApprovalNode.displayName = 'ApprovalNode';
