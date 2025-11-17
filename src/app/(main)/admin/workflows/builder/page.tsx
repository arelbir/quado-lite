"use client";

import { Suspense, useEffect, useState } from "react";
import { WorkflowCanvas } from "@/features/workflows/components/designer/Canvas/WorkflowCanvas";
import { ToolbarPanel } from "@/features/workflows/components/designer/Panels/ToolbarPanel";
import { NodeTemplatesPanel } from "@/features/workflows/components/designer/Panels/NodeTemplatesPanel";
import { WorkflowTemplatesPanel } from "@/features/workflows/components/designer/Panels/WorkflowTemplatesPanel";
import { PropertiesPanel } from "@/features/workflows/components/designer/Panels/PropertiesPanel";
import { ValidationPanel } from "@/features/workflows/components/designer/Panels/ValidationPanel";
import { CustomFieldsReference } from "@/features/workflows/components/designer/Panels/CustomFieldsReference";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/shared/icons";
import { useWorkflowStore } from "@/features/workflows/components/designer/Hooks/useWorkflowStore";
import { useAutoSave, loadDraft, clearDraft, hasDraft } from "@/features/workflows/components/designer/Hooks/useAutoSave";
import { createVisualWorkflow, getVisualWorkflowById, updateVisualWorkflow } from "@/features/workflows/actions/visual-workflow-actions";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslations } from "next-intl";

function WorkflowBuilderContent() {
  const { nodes, edges, reset, setNodes, setEdges } = useWorkflowStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const workflowId = searchParams.get("id");

  const tWorkflow = useTranslations("workflow");
  const tCommon = useTranslations("common");
  
  const [workflowName, setWorkflowName] = useState("");
  const [workflowModule, setWorkflowModule] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Dialog states
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [showDraftDialog, setShowDraftDialog] = useState(false);
  const [draftData, setDraftData] = useState<any>(null);
  const [tempWorkflowName, setTempWorkflowName] = useState("");
  const [tempWorkflowModule, setTempWorkflowModule] = useState<string>("");
  
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
            toast.error(
              result.error || tWorkflow("messages.loadError"),
            );
            router.push("/admin/workflows");
          }
        } catch (error) {
          console.error("Load error:", error);
          toast.error(tWorkflow("messages.loadError"));
          router.push("/admin/workflows");
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
  }, [workflowId, nodes.length, setEdges, setNodes, router, tWorkflow]);

  const handleSave = async () => {
    // Basic validation
    if (nodes.length === 0) {
      toast.error(tWorkflow("messages.emptyError"));
      return;
    }

    // Only prompt if creating new (not editing)
    if (!isEditMode) {
      setTempWorkflowName("");
      setTempWorkflowModule("");
      setShowSaveDialog(true);
      return;
    }

    // If editing, save directly
    await performSave(workflowName, workflowModule);
  };

  const performSave = async (
    name: string,
    module: string,
  ) => {
    if (!module || module.trim() === "") {
      toast.error("Please select an entity type");
      return;
    }

    if (!name || name.trim() === "") {
      toast.error("Please enter a workflow name");
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
          toast.success(tWorkflow("messages.updateSuccess"));
          router.push("/admin/workflows");
        } else {
          toast.error(result.error || tWorkflow("messages.updateError"));
        }
      } else {
        // Create new workflow
        const result = await createVisualWorkflow({
          name,
          module,
          nodes,
          edges,
        });

        if (result.success) {
          clearDraft();
          toast.success(tWorkflow("messages.createSuccess"));
          router.push("/admin/workflows");
        } else {
          toast.error(result.error || tWorkflow("messages.createError"));
        }
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error(tWorkflow("messages.createError"));
    }
  };

  const handleClear = () => {
    setShowClearDialog(true);
  };

  const confirmClear = () => {
    reset();
    setShowClearDialog(false);
    toast.success(tWorkflow("messages.cleared"));
  };

  const handleLoadDraft = () => {
    if (draftData) {
      setNodes(draftData.nodes || []);
      setEdges(draftData.edges || []);
      setShowDraftDialog(false);
      toast.success(tWorkflow("messages.draftLoaded"));
    }
  };

  const handleSaveWithData = () => {
    if (!tempWorkflowName.trim()) {
      toast.error(tWorkflow("builder.validation.nameRequired"));
      return;
    }
    if (!tempWorkflowModule) {
      toast.error(tWorkflow("builder.validation.moduleRequired"));
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
          <p className="text-muted-foreground">
            {tWorkflow("builder.loading")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Modern Header with Stats */}
      <div className="border-b bg-gradient-to-r from-background to-muted/20">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Icons.Workflow className="size-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">
                  {isEditMode ? workflowName : "Workflow Builder"}
                </h1>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  {isEditMode && workflowModule && (
                    <span className="flex items-center gap-1">
                      <Icons.Tag className="size-3" />
                      {workflowModule}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Icons.Box className="size-3" />
                    {nodes.length} nodes
                  </span>
                  <span className="flex items-center gap-1">
                    <Icons.Network className="size-3" />
                    {edges.length} connections
                  </span>
                  <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                    <Icons.CheckCircle2 className="size-3" />
                    Auto-saved
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <WorkflowTemplatesPanel />
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleClear}
              className="text-muted-foreground hover:text-destructive"
            >
              <Icons.Trash2 className="size-4 mr-2" />
              Clear
            </Button>
            <Button 
              size="sm"
              onClick={handleSave}
              className="bg-primary hover:bg-primary/90"
            >
              <Icons.Save className="size-4 mr-2" />
              {isEditMode ? "Update" : "Save"}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content - Improved Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Wider */}
        <div className="w-80 border-r bg-muted/20 overflow-y-auto">
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Node Library
              </h3>
              <ToolbarPanel />
            </div>
            <NodeTemplatesPanel />
          </div>
        </div>

        {/* Center Canvas - More Space */}
        <div className="flex-1 flex flex-col relative">
          {/* Canvas */}
          <div className="flex-1 relative">
            <WorkflowCanvas />
            
            {/* Floating Quick Stats */}
            <div className="absolute bottom-4 left-4 z-10">
              <div className="bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg px-3 py-2">
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1.5">
                    <div className="size-2 rounded-full bg-green-500" />
                    <span className="text-muted-foreground">Ready</span>
                  </span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">
                    Press <kbd className="px-1.5 py-0.5 bg-muted rounded">Del</kbd> to delete
                  </span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">
                    <kbd className="px-1.5 py-0.5 bg-muted rounded">Shift</kbd> to multi-select
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Validation Panel - Compact */}
          <div className="border-t bg-muted/10">
            <div className="px-4 py-3">
              <ValidationPanel />
            </div>
          </div>
        </div>

        {/* Right Sidebar - Better Organized */}
        <div className="w-[400px] border-l bg-background overflow-y-auto">
          <div className="flex flex-col h-full">
            {/* Properties Section */}
            <div className="flex-1 border-b">
              <div className="p-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Properties
                </h3>
                <PropertiesPanel />
              </div>
            </div>
            
            {/* Custom Fields Section */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4">
                <CustomFieldsReference module={workflowModule} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Dialog (for new workflows) */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {tWorkflow("builder.dialogs.save.title")}
            </DialogTitle>
            <DialogDescription>
              {tWorkflow("builder.dialogs.save.description")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="workflow-name">
                {tWorkflow("builder.dialogs.save.nameLabel")} *
              </Label>
              <Input
                id="workflow-name"
                placeholder={tWorkflow("builder.dialogs.save.namePlaceholder")}
                value={tempWorkflowName}
                onChange={(e) => setTempWorkflowName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSaveWithData();
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workflow-module">
                {tWorkflow("builder.dialogs.save.moduleLabel")} *
              </Label>
              <Select
                value={tempWorkflowModule}
                onValueChange={(value: any) => setTempWorkflowModule(value)}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={tWorkflow(
                      "builder.dialogs.save.modulePlaceholder",
                    )}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Action">Action</SelectItem>
                  <SelectItem value="Approval">Approval</SelectItem>
                  <SelectItem value="Audit">Audit</SelectItem>
                  <SelectItem value="Document">Document</SelectItem>
                  <SelectItem value="Finding">Finding</SelectItem>
                  <SelectItem value="Order">Order</SelectItem>
                  <SelectItem value="Request">Request</SelectItem>
                  <SelectItem value="Review">Review</SelectItem>
                  <SelectItem value="Task">Task</SelectItem>
                  <SelectItem value="Ticket">Ticket</SelectItem>
                  <SelectItem value="Generic">Generic</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              {tCommon("actions.cancel")}
            </Button>
            <Button onClick={handleSaveWithData}>
              <Icons.Save className="size-4 mr-2" />
              {tWorkflow("builder.dialogs.save.saveButton")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clear Confirmation Dialog */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {tWorkflow("builder.dialogs.clear.title")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {tWorkflow("builder.dialogs.clear.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {tCommon("actions.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmClear}>
              {tWorkflow("builder.dialogs.clear.clearButton")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Draft Load Dialog */}
      <AlertDialog open={showDraftDialog} onOpenChange={setShowDraftDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {tWorkflow("builder.dialogs.draft.title")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {draftData
                ? tWorkflow("builder.dialogs.draft.description", {
                    date: new Date(draftData.savedAt).toLocaleString(),
                  })
                : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDraftDialog(false)}>
              {tWorkflow("builder.dialogs.draft.discardButton")}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleLoadDraft}>
              {tWorkflow("builder.dialogs.draft.loadButton")}
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
