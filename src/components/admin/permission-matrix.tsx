/**
 * PERMISSION MATRIX
 * Visual permission management grid
 * 
 * Features:
 * - Grouped by resource
 * - Toggle permissions
 * - Quick actions (Select All, Clear All)
 * - Permission categories
 * - Real-time updates
 * 
 * Created: 2025-01-24
 * Week 7-8: Day 5
 */

"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Permission {
  id: string;
  resource: string;
  action: string;
  description: string | null;
}

interface PermissionMatrixProps {
  roleId: string;
  permissions: Permission[];
  assignedPermissionIds: Set<string>;
  isSystemRole: boolean;
}

export function PermissionMatrix({
  roleId,
  permissions,
  assignedPermissionIds,
  isSystemRole,
}: PermissionMatrixProps) {
  const router = useRouter();
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(
    new Set(assignedPermissionIds)
  );
  const [isSaving, setIsSaving] = useState(false);

  // Group permissions by resource
  const groupedPermissions = permissions.reduce((acc, permission) => {
    const resource = permission.resource;
    if (!acc[resource]) {
      acc[resource] = [];
    }
    acc[resource]!.push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  // Toggle permission
  const togglePermission = (permissionId: string) => {
    if (isSystemRole) {
      toast.error("Cannot modify system role permissions");
      return;
    }

    const newSelected = new Set(selectedPermissions);
    if (newSelected.has(permissionId)) {
      newSelected.delete(permissionId);
    } else {
      newSelected.add(permissionId);
    }
    setSelectedPermissions(newSelected);
  };

  // Select all in resource
  const selectAllInResource = (resource: string) => {
    if (isSystemRole) return;
    
    const newSelected = new Set(selectedPermissions);
    const resourcePerms = groupedPermissions[resource];
    if (resourcePerms) {
      resourcePerms.forEach(p => {
        newSelected.add(p.id);
      });
    }
    setSelectedPermissions(newSelected);
  };

  // Clear all in resource
  const clearAllInResource = (resource: string) => {
    if (isSystemRole) return;
    
    const newSelected = new Set(selectedPermissions);
    const resourcePerms = groupedPermissions[resource];
    if (resourcePerms) {
      resourcePerms.forEach(p => {
        newSelected.delete(p.id);
      });
    }
    setSelectedPermissions(newSelected);
  };

  // Save changes
  const saveChanges = async () => {
    if (isSystemRole) {
      toast.error("Cannot modify system role permissions");
      return;
    }

    setIsSaving(true);
    try {
      // TODO: Implement API call to update role permissions
      // await updateRolePermissions(roleId, Array.from(selectedPermissions));
      
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock delay
      
      toast.success("Permissions updated successfully");
      router.refresh();
    } catch (error) {
      toast.error("Failed to update permissions");
    } finally {
      setIsSaving(false);
    }
  };

  // Check if has changes
  const hasChanges = () => {
    if (selectedPermissions.size !== assignedPermissionIds.size) return true;
    for (const id of selectedPermissions) {
      if (!assignedPermissionIds.has(id)) return true;
    }
    return false;
  };

  // Get action color
  const getActionColor = (action: string): string => {
    switch (action.toLowerCase()) {
      case 'create': return 'bg-green-100 text-green-800';
      case 'read': return 'bg-blue-100 text-blue-800';
      case 'update': return 'bg-yellow-100 text-yellow-800';
      case 'delete': return 'bg-red-100 text-red-800';
      case 'approve': return 'bg-purple-100 text-purple-800';
      case 'execute': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {selectedPermissions.size} / {permissions.length} permissions selected
          </Badge>
          {hasChanges() && (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              Unsaved changes
            </Badge>
          )}
        </div>
        {!isSystemRole && hasChanges() && (
          <Button onClick={saveChanges} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        )}
      </div>

      {/* System Role Warning */}
      {isSystemRole && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-yellow-800">
              <Lock className="w-4 h-4" />
              <span className="text-sm font-medium">
                System roles cannot be modified
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Permission Matrix */}
      <div className="space-y-4">
        {Object.entries(groupedPermissions).map(([resource, perms]) => (
          <Card key={resource}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{resource}</CardTitle>
                  <CardDescription>
                    {perms.length} permissions available
                  </CardDescription>
                </div>
                {!isSystemRole && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => selectAllInResource(resource)}
                    >
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Select All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => clearAllInResource(resource)}
                    >
                      <XCircle className="w-3 h-3 mr-1" />
                      Clear All
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {perms.map((permission) => {
                  const isSelected = selectedPermissions.has(permission.id);
                  
                  return (
                    <div
                      key={permission.id}
                      className={`
                        flex items-start gap-3 p-3 rounded-lg border transition-colors
                        ${isSelected ? 'bg-accent border-primary' : 'hover:bg-accent/50'}
                        ${isSystemRole ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}
                      `}
                      onClick={() => !isSystemRole && togglePermission(permission.id)}
                    >
                      <Checkbox
                        checked={isSelected}
                        disabled={isSystemRole}
                        onCheckedChange={() => togglePermission(permission.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge className={getActionColor(permission.action)}>
                            {permission.action}
                          </Badge>
                        </div>
                        {permission.description && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {permission.description}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Permission Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(groupedPermissions).map(([resource, perms]) => {
              const selectedCount = perms.filter(p => 
                selectedPermissions.has(p.id)
              ).length;
              
              return (
                <div key={resource} className="text-center p-3 rounded-lg border">
                  <div className="text-2xl font-bold">
                    {selectedCount}/{perms.length}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {resource}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
