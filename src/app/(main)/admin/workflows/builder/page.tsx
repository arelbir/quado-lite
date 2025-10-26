'use client';

import { Suspense, useEffect, useState } from 'react';
import { WorkflowCanvas } from '@/components/workflow-designer/Canvas/WorkflowCanvas';
import { ToolbarPanel } from '@/components/workflow-designer/Panels/ToolbarPanel';
import { PropertiesPanel } from '@/components/workflow-designer/Panels/PropertiesPanel';
import { ValidationPanel } from '@/components/workflow-designer/Panels/ValidationPanel';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { useWorkflowStore } from '@/components/workflow-designer/Hooks/useWorkflowStore';
import { useAutoSave, loadDraft, clearDraft, hasDraft } from '@/components/workflow-designer/Hooks/useAutoSave';
import { createVisualWorkflow, getVisualWorkflowById, updateVisualWorkflow } from '@/server/actions/visual-workflow-actions';
import { useRouter, useSearchParams } from 'next/navigation';

function WorkflowBuilderContent() {
  const { nodes, edges, reset, setNodes, setEdges } = useWorkflowStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const workflowId = searchParams.get('id');
  
  const [workflowName, setWorkflowName] = useState('');
  const [workflowModule, setWorkflowModule] = useState<'DOF' | 'ACTION' | 'FINDING' | 'AUDIT' | ''>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Enable auto-save only when NOT loading from database
  useAutoSave(!workflowId);

  // Load workflow from database OR draft on mount
  useEffect(() => {
    const loadWorkflow = async () => {
      if (workflowId) {
        // Load from database
        setIsLoading(true);
        try {
          const result = await getVisualWorkflowById(workflowId);
          if (result.success && result.data) {
            setNodes(result.data.nodes || []);
            setEdges(result.data.edges || []);
            setWorkflowName(result.data.name);
            setWorkflowModule(result.data.module);
            setIsEditMode(true);
            
            // Clear any existing draft since we're loading from DB
            clearDraft();
          } else {
            alert('Failed to load workflow: ' + result.error);
            router.push('/admin/workflows');
          }
        } catch (error) {
          console.error('Load error:', error);
          alert('Failed to load workflow');
          router.push('/admin/workflows');
        } finally {
          setIsLoading(false);
        }
      } else {
        // No ID in URL - check for draft
        if (hasDraft() && nodes.length === 0) {
          const draft = loadDraft();
          if (draft && confirm(`Found unsaved work from ${new Date(draft.savedAt).toLocaleString()}. Load it?`)) {
            setNodes(draft.nodes || []);
            setEdges(draft.edges || []);
          }
        }
      }
    };

    loadWorkflow();
  }, [workflowId]); // Re-run if ID changes

  const handleSave = async () => {
    // Basic validation
    if (nodes.length === 0) {
      alert('Cannot save empty workflow');
      return;
    }

    let name = workflowName;
    let module = workflowModule;

    // Only prompt if creating new (not editing)
    if (!isEditMode) {
      const promptedName = prompt('Enter workflow name:', name);
      if (!promptedName) return;
      name = promptedName;

      const promptedModule = prompt('Enter module (DOF/ACTION/FINDING/AUDIT):', module)?.toUpperCase();
      if (!promptedModule || !['DOF', 'ACTION', 'FINDING', 'AUDIT'].includes(promptedModule)) {
        alert('Invalid module');
        return;
      }
      module = promptedModule as 'DOF' | 'ACTION' | 'FINDING' | 'AUDIT';
    }

    try {
      if (isEditMode && workflowId) {
        // Update existing workflow
        const result = await updateVisualWorkflow(workflowId, {
          nodes,
          edges,
        });

        if (result.success) {
          clearDraft();
          alert('Workflow updated successfully!');
          router.push('/admin/workflows');
        } else {
          alert(`Error: ${result.error}`);
        }
      } else {
        // Create new workflow
        const result = await createVisualWorkflow({
          name,
          module: module as 'DOF' | 'ACTION' | 'FINDING' | 'AUDIT',
          nodes,
          edges,
        });

        if (result.success) {
          clearDraft();
          alert('Workflow saved successfully!');
          router.push('/admin/workflows');
        } else {
          alert(`Error: ${result.error}`);
        }
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save workflow');
    }
  };

  const handleClear = () => {
    if (confirm('Clear all nodes and edges?')) {
      reset();
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <Icons.Loader2 className="size-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading workflow...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b p-4 flex items-center justify-between bg-background">
        <div>
          <h1 className="text-2xl font-bold">
            {isEditMode ? `Edit: ${workflowName}` : 'Workflow Builder'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isEditMode ? `Module: ${workflowModule}` : 'Design your workflow visually'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleClear}>
            <Icons.Trash className="size-4 mr-2" />
            Clear
          </Button>
          <Button onClick={handleSave}>
            <Icons.Save className="size-4 mr-2" />
            {isEditMode ? 'Update' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Toolbar */}
        <div className="w-64 border-r p-4 bg-muted/30 overflow-y-auto">
          <ToolbarPanel />
        </div>

        {/* Center Canvas */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1">
            <WorkflowCanvas />
          </div>
          
          {/* Validation Panel at bottom */}
          <div className="border-t p-4 bg-background">
            <ValidationPanel />
          </div>
        </div>

        {/* Right Properties Panel */}
        <div className="w-80 border-l overflow-y-auto">
          <PropertiesPanel />
        </div>
      </div>
    </div>
  );
}

export default function WorkflowBuilderPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center">
        <Icons.Loader2 className="size-8 animate-spin" />
      </div>
    }>
      <WorkflowBuilderContent />
    </Suspense>
  );
}
