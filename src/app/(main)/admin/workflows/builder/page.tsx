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
  const [workflowModule, setWorkflowModule] = useState<"DOF" | "ACTION" | "FINDING" | "AUDIT" | "">("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Dialog states
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [showDraftDialog, setShowDraftDialog] = useState(false);
  const [draftData, setDraftData] = useState<any>(null);
  const [tempWorkflowName, setTempWorkflowName] = useState("");
  const [tempWorkflowModule, setTempWorkflowModule] = useState<"DOF" | "ACTION" | "FINDING" | "AUDIT" | "">("");
  
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
    module: "DOF" | "ACTION" | "FINDING" | "AUDIT" | "",
  ) => {
    if (!module || !["DOF", "ACTION", "FINDING", "AUDIT"].includes(module)) {
      toast.error(tWorkflow("messages.invalidModule"));
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
          module: module as "DOF" | "ACTION" | "FINDING" | "AUDIT",
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
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b p-4 flex items-center justify-between bg-background">
        <div>
          <h1 className="text-2xl font-bold">
            {isEditMode
              ? tWorkflow("builder.header.titleEdit", { name: workflowName })
              : tWorkflow("builder.header.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isEditMode && workflowModule
              ? tWorkflow("builder.header.subtitleEdit", {
                  module: tWorkflow(`modules.${workflowModule}` as any),
                })
              : tWorkflow("builder.header.subtitle")}
          </p>
        </div>
        <div className="flex gap-2">
          <WorkflowTemplatesPanel />
          <Button variant="outline" onClick={handleClear}>
            <Icons.Trash className="size-4 mr-2" />
            {tCommon("actions.clear")}
          </Button>
          <Button onClick={handleSave}>
            <Icons.Save className="size-4 mr-2" />
            {isEditMode
              ? tCommon("actions.update")
              : tCommon("actions.save")}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Toolbar */}
        <div className="w-64 border-r bg-muted/30 overflow-y-auto flex flex-col gap-4 p-4">
          <ToolbarPanel />
          <NodeTemplatesPanel />
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
                  <SelectItem value="AUDIT">
                    {tWorkflow("modules.AUDIT")}
                  </SelectItem>
                  <SelectItem value="FINDING">
                    {tWorkflow("modules.FINDING")}
                  </SelectItem>
                  <SelectItem value="ACTION">
                    {tWorkflow("modules.ACTION")}
                  </SelectItem>
                  <SelectItem value="DOF">
                    {tWorkflow("modules.DOF")}
                  </SelectItem>
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
