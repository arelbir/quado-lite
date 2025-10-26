'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Icons } from '@/components/icons';
import { useWorkflowStore } from '../Hooks/useWorkflowStore';
import { useFlowValidation } from '../Hooks/useFlowValidation';

export function ValidationPanel() {
  const { nodes, edges } = useWorkflowStore();
  const { errors, isValid } = useFlowValidation(nodes, edges);

  if (errors.length === 0) {
    return (
      <Alert className="bg-green-50 border-green-200">
        <Icons.CheckCircle2 className="size-4 text-green-600" />
        <AlertDescription className="text-green-800">
          ✓ No issues found. Workflow is valid!
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-2">
      {errors.map((error, index) => (
        <Alert
          key={index}
          variant={error.type === 'error' ? 'destructive' : 'default'}
          className={error.type === 'warning' ? 'bg-yellow-50 border-yellow-200' : ''}
        >
          {error.type === 'error' ? (
            <Icons.AlertCircle className="size-4" />
          ) : (
            <Icons.AlertTriangle className="size-4 text-yellow-600" />
          )}
          <AlertDescription className={error.type === 'warning' ? 'text-yellow-800' : ''}>
            {error.message}
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
}
