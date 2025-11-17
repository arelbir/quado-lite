"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Settings, Plus, Edit, Trash, Play, Power } from "lucide-react";
import { toast } from "sonner";
import { HRSyncConfigDialog } from "@/features/hr-sync/components/hr-sync-config-dialog";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import {
  deleteHRSyncConfig,
  toggleConfigStatus,
  triggerManualSync,
} from "@/features/hr-sync/actions/hr-sync-actions";

interface HRSyncConfig {
  id: string;
  name: string;
  description: string | null;
  sourceType: string;
  syncMode: string;
  isActive: boolean;
  autoSync: boolean;
  syncSchedule: string | null;
  lastSyncAt: Date | null;
}

interface HRSyncConfigsClientProps {
  configs: HRSyncConfig[];
}

export function HRSyncConfigsClient({ configs }: HRSyncConfigsClientProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<HRSyncConfig | null>(null);
  const [deletingConfig, setDeletingConfig] = useState<HRSyncConfig | null>(null);

  const handleCreate = () => {
    setEditingConfig(null);
    setDialogOpen(true);
  };

  const handleEdit = (config: HRSyncConfig) => {
    setEditingConfig(config);
    setDialogOpen(true);
  };

  const handleDelete = (config: HRSyncConfig) => {
    setDeletingConfig(config);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingConfig) return;

    const result = await deleteHRSyncConfig(deletingConfig.id);

    if (result.success) {
      toast.success(result.message || "Config deleted successfully");
      setDeleteDialogOpen(false);
      setDeletingConfig(null);
      router.refresh();
    } else {
      toast.error(result.error || "Failed to delete config");
    }
  };

  const handleToggleStatus = async (config: HRSyncConfig) => {
    const result = await toggleConfigStatus(config.id);

    if (result.success) {
      toast.success(result.message);
      router.refresh();
    } else {
      toast.error(result.error || "Failed to toggle status");
    }
  };

  const handleTriggerSync = async (config: HRSyncConfig) => {
    const result = await triggerManualSync(config.id);

    if (result.success) {
      toast.success(result.message);
      router.refresh();
    } else {
      toast.error(result.error || "Failed to trigger sync");
    }
  };

  if (configs.length === 0) {
    return (
      <>
        <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg">
          <div className="text-center">
            <Settings className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Configurations</h3>
            <p className="text-muted-foreground mb-4">
              Create your first sync configuration
            </p>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Create Configuration
            </Button>
          </div>
        </div>

        <HRSyncConfigDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          config={editingConfig}
          onSuccess={() => router.refresh()}
        />
      </>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Create Configuration
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {configs.map((config) => (
            <div key={config.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold">{config.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        config.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {config.isActive ? "Active" : "Inactive"}
                    </span>
                    {config.autoSync && (
                      <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">
                        Auto Sync
                      </span>
                    )}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleTriggerSync(config)}>
                      <Play className="h-4 w-4 mr-2" />
                      Trigger Sync
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleToggleStatus(config)}>
                      <Power className="h-4 w-4 mr-2" />
                      {config.isActive ? "Deactivate" : "Activate"}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleEdit(config)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(config)}
                      className="text-red-600"
                    >
                      <Trash className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {config.description && (
                <p className="text-sm text-muted-foreground mb-3">
                  {config.description}
                </p>
              )}

              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Source:</span>
                  <span className="font-medium">{config.sourceType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mode:</span>
                  <span className="font-medium">{config.syncMode}</span>
                </div>
                {config.lastSyncAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Sync:</span>
                    <span className="font-medium" suppressHydrationWarning>
                      {new Date(config.lastSyncAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Config Dialog */}
      <HRSyncConfigDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        config={editingConfig}
        onSuccess={() => router.refresh()}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the configuration "{deletingConfig?.name}". All related
              sync logs will also be deleted. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
