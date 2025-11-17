'use client';

import { useMemo } from 'react';
import { useWorkflowStore } from '../Hooks/useWorkflowStore';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/shared/icons';
import { validateWorkflow } from '@/features/workflows/lib/workflow-validator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useState } from 'react';

export function ValidationPanel() {
  const nodes = useWorkflowStore((state) => state.nodes);
  const edges = useWorkflowStore((state) => state.edges);
  const selectNode = useWorkflowStore((state) => state.selectNode);

  const [showErrors, setShowErrors] = useState(true);
  const [showWarnings, setShowWarnings] = useState(true);
  const [showInfo, setShowInfo] = useState(false);

  const validation = useMemo(() => {
    return validateWorkflow(nodes, edges);
  }, [nodes, edges]);

  const handleIssueClick = (nodeId?: string) => {
    if (nodeId) {
      selectNode(nodeId);
    }
  };

  return (
    <Card className="p-3">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {validation.isValid ? (
              <Icons.CheckCircle2 className="size-4 text-green-500" />
            ) : (
              <Icons.AlertCircle className="size-4 text-orange-500" />
            )}
            <span className="font-semibold text-sm">Validation</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={validation.isValid ? 'default' : 'destructive'}>
              {validation.isValid ? 'Valid' : `${validation.errors.length + validation.warnings.length} issues`}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {nodes.length} nodes • {edges.length} edges
            </span>
          </div>
        </div>

        {/* Issues */}
        {(validation.errors.length > 0 || validation.warnings.length > 0 || validation.info.length > 0) && (
          <div className="space-y-2">
            {/* Errors */}
            {validation.errors.length > 0 && (
              <Collapsible open={showErrors} onOpenChange={setShowErrors}>
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between text-xs font-medium hover:bg-accent p-2 rounded">
                    <div className="flex items-center gap-2">
                      <Icons.CircleX className="size-3 text-red-500" />
                      <span>Errors ({validation.errors.length})</span>
                    </div>
                    <Icons.ChevronDown className={`size-3 transition-transform ${showErrors ? 'rotate-180' : ''}`} />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="space-y-1 mt-1">
                    {validation.errors.map((error) => (
                      <div
                        key={error.id}
                        className={`text-xs p-2 rounded bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 ${
                          error.nodeId ? 'cursor-pointer hover:bg-red-100 dark:hover:bg-red-950/30' : ''
                        }`}
                        onClick={() => handleIssueClick(error.nodeId)}
                      >
                        <div className="font-medium text-red-700 dark:text-red-400">{error.message}</div>
                        {error.suggestion && (
                          <div className="text-red-600/80 dark:text-red-400/80 mt-1">{error.suggestion}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Warnings */}
            {validation.warnings.length > 0 && (
              <Collapsible open={showWarnings} onOpenChange={setShowWarnings}>
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between text-xs font-medium hover:bg-accent p-2 rounded">
                    <div className="flex items-center gap-2">
                      <Icons.AlertTriangle className="size-3 text-yellow-600" />
                      <span>Warnings ({validation.warnings.length})</span>
                    </div>
                    <Icons.ChevronDown className={`size-3 transition-transform ${showWarnings ? 'rotate-180' : ''}`} />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="space-y-1 mt-1">
                    {validation.warnings.map((warning) => (
                      <div
                        key={warning.id}
                        className={`text-xs p-2 rounded bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 ${
                          warning.nodeId ? 'cursor-pointer hover:bg-yellow-100 dark:hover:bg-yellow-950/30' : ''
                        }`}
                        onClick={() => handleIssueClick(warning.nodeId)}
                      >
                        <div className="font-medium text-yellow-700 dark:text-yellow-400">{warning.message}</div>
                        {warning.suggestion && (
                          <div className="text-yellow-600/80 dark:text-yellow-400/80 mt-1">{warning.suggestion}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Info */}
            {validation.info.length > 0 && (
              <Collapsible open={showInfo} onOpenChange={setShowInfo}>
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between text-xs font-medium hover:bg-accent p-2 rounded">
                    <div className="flex items-center gap-2">
                      <Icons.Info className="size-3 text-blue-500" />
                      <span>Info ({validation.info.length})</span>
                    </div>
                    <Icons.ChevronDown className={`size-3 transition-transform ${showInfo ? 'rotate-180' : ''}`} />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="space-y-1 mt-1">
                    {validation.info.map((info) => (
                      <div key={info.id} className="text-xs p-2 rounded bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
                        <div className="text-blue-700 dark:text-blue-400">{info.message}</div>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
