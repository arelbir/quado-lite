'use client';

import { Suspense, useEffect, useState } from 'react';
import { WorkflowCanvas } from '@/components/workflow-designer/Canvas/WorkflowCanvas';
import { ToolbarPanel } from '@/components/workflow-designer/Panels/ToolbarPanel';
import { PropertiesPanel } from '@/components/workflow-designer/Panels/PropertiesPanel';
import { ValidationPanel } from '@/components/workflow-designer/Panels/ValidationPanel';
import { CustomFieldsReference } from '@/components/workflow-designer/Panels/CustomFieldsReference';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { useWorkflowStore } from '@/components/workflow-designer/Hooks/useWorkflowStore';
import { useAutoSave, loadDraft, clearDraft, hasDraft } from '@/components/workflow-designer/Hooks/useAutoSave';
import { createVisualWorkflow, getVisualWorkflowById, updateVisualWorkflow } from '@/server/actions/visual-workflow-actions';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

function WorkflowBuilderContent() {
  const { nodes, edges, reset, setNodes, setEdges } = useWorkflowStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const workflowId = searchParams.get('id');
  
  const [workflowName, setWorkflowName] = useState('');
  const [workflowModule, setWorkflowModule] = useState<'DOF' | 'ACTION' | 'FINDING' | 'AUDIT' | ''>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Dialog states
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [showDraftDialog, setShowDraftDialog] = useState(false);
  const [draftData, setDraftData] = useState<any>(null);
  const [tempWorkflowName, setTempWorkflowName] = useState('');
  const [tempWorkflowModule, setTempWorkflowModule] = useState<'DOF' | 'ACTION' | 'FINDING' | 'AUDIT' | ''>('');
  
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
            toast.error('Failed to load workflow: ' + result.error);
            router.push('/admin/workflows');
          }
        } catch (error) {
          console.error('Load error:', error);
          toast.error('Failed to load workflow');
          router.push('/admin/workflows');
        } finally {
          setIsLoading(false);
        }
      } else {
        // No ID in URL - check for draft
        if (hasDraft() && nodes.length === 0) {
          const draft = loadDraft();
          if (draft) {
            setDraftData(draft);
            setShowDraftDialog(true);
          }
        }
      }
    };

    loadWorkflow();
  }, [workflowId]); // Re-run if ID changes

  const handleSave = async () => {
    // Basic validation
    if (nodes.length === 0) {
      toast.error('Cannot save empty workflow');
      return;
    }

    // Only prompt if creating new (not editing)
    if (!isEditMode) {
      setTempWorkflowName('');
      setTempWorkflowModule('');
      setShowSaveDialog(true);
      return;
    }

    // If editing, save directly
    await performSave(workflowName, workflowModule);
  };

  const performSave = async (name: string, module: 'DOF' | 'ACTION' | 'FINDING' | 'AUDIT' | '') => {
    if (!module || !['DOF', 'ACTION', 'FINDING', 'AUDIT'].includes(module)) {
      toast.error('Invalid module');
      return;
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
          toast.success('Workflow updated successfully!');
          router.push('/admin/workflows');
        } else {
          toast.error(result.error || 'Failed to update workflow');
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
          toast.success('Workflow saved successfully!');
          router.push('/admin/workflows');
        } else {
          toast.error(result.error || 'Failed to save workflow');
        }
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save workflow');
    }
  };

  const handleClear = () => {
    setShowClearDialog(true);
  };

  const confirmClear = () => {
    reset();
    setShowClearDialog(false);
    toast.success('Workflow cleared');
  };

  const handleLoadDraft = () => {
    if (draftData) {
      setNodes(draftData.nodes || []);
      setEdges(draftData.edges || []);
      setShowDraftDialog(false);
      toast.success('Draft loaded successfully');
    }
  };

  const handleSaveWithData = () => {
    if (!tempWorkflowName.trim()) {
      toast.error('Please enter a workflow name');
      return;
    }
    if (!tempWorkflowModule) {
      toast.error('Please select a module');
      return;
    }
    setShowSaveDialog(false);
    performSave(tempWorkflowName, tempWorkflowModule);
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

        {/* Right Sidebar */}
        <div className="w-96 border-l overflow-y-auto flex flex-col">
          {/* Node Properties */}
          <div className="flex-1 border-b">
            <PropertiesPanel />
          </div>
          {/* Custom Fields Reference */}
          <div className="p-4">
            <CustomFieldsReference module={workflowModule} />
          </div>
        </div>
      </div>

      {/* Save Dialog (for new workflows) */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Workflow</DialogTitle>
            <DialogDescription>
              Enter workflow details to save
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="workflow-name">Workflow Name *</Label>
              <Input
                id="workflow-name"
                placeholder="Enter workflow name..."
                value={tempWorkflowName}
                onChange={(e) => setTempWorkflowName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSaveWithData();
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workflow-module">Module *</Label>
              <Select value={tempWorkflowModule} onValueChange={(value: any) => setTempWorkflowModule(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select module" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AUDIT">Audit</SelectItem>
                  <SelectItem value="FINDING">Finding</SelectItem>
                  <SelectItem value="ACTION">Action</SelectItem>
                  <SelectItem value="DOF">DOF (CAPA)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveWithData}>
              <Icons.Save className="size-4 mr-2" />
              Save Workflow
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clear Confirmation Dialog */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Workflow?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove all nodes and edges from the canvas. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmClear}>
              Clear All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Draft Load Dialog */}
      <AlertDialog open={showDraftDialog} onOpenChange={setShowDraftDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Work Found</AlertDialogTitle>
            <AlertDialogDescription>
              {draftData && (
                <>
                  Found unsaved work from{' '}
                  <strong>{new Date(draftData.savedAt).toLocaleString()}</strong>.
                  Would you like to load it?
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDraftDialog(false)}>
              Discard
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleLoadDraft}>
              Load Draft
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
