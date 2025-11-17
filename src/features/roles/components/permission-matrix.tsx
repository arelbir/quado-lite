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
import { useTranslations } from 'next-intl';
import { cn } from "@/lib/utils/cn";
import { updateRolePermissions } from "@/features/roles/actions/role-actions";

interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description: string | null;
}

// CRUD Actions
const CRUD_ACTIONS = ['Create', 'Read', 'Update', 'Delete'] as const;

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
  const t = useTranslations('roles');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(
    new Set(assignedPermissionIds)
  );
  const [isSaving, setIsSaving] = useState(false);

  // Group permissions by resource
  const groupedByResource = permissions.reduce((acc, permission) => {
    const resource = permission.resource || "General";
    if (!acc[resource]) {
      acc[resource] = [];
    }
    acc[resource]!.push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  // Get sorted resources
  const resources = Object.keys(groupedByResource).sort();

  // Toggle permission
  const togglePermission = (permissionId: string) => {
    if (isSystemRole) {
      toast.error(t('permissionMatrix.systemRoleError'));
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

  // Select all CRUD for a resource
  const selectAllCRUD = (resource: string) => {
    if (isSystemRole) return;
    
    const newSelected = new Set(selectedPermissions);
    CRUD_ACTIONS.forEach(action => {
      const perm = permissions.find(
        p => p.resource === resource && p.action.toLowerCase() === action.toLowerCase()
      );
      if (perm) newSelected.add(perm.id);
    });
    setSelectedPermissions(newSelected);
  };

  // Clear all CRUD for a resource
  const clearAllCRUD = (resource: string) => {
    if (isSystemRole) return;
    
    const newSelected = new Set(selectedPermissions);
    CRUD_ACTIONS.forEach(action => {
      const perm = permissions.find(
        p => p.resource === resource && p.action.toLowerCase() === action.toLowerCase()
      );
      if (perm) newSelected.delete(perm.id);
    });
    setSelectedPermissions(newSelected);
  };

  // Save changes
  const saveChanges = async () => {
    if (isSystemRole) {
      toast.error(t('permissionMatrix.systemRoleError'));
      return;
    }

    setIsSaving(true);
    try {
      const result = await updateRolePermissions(roleId, Array.from(selectedPermissions));
      
      if (!result.success) {
        toast.error(result.error || t('permissionMatrix.updateFailed'));
        return;
      }
      
      toast.success(t('permissionMatrix.permissionsUpdated'));
      router.refresh();
    } catch (error) {
      toast.error(t('permissionMatrix.updateFailed'));
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

  return (
    <div className="space-y-4">
      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {selectedPermissions.size} / {permissions.length} {t('permissionMatrix.permissionsSelected')}
          </Badge>
          {hasChanges() && (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              {t('permissionMatrix.unsavedChanges')}
            </Badge>
          )}
        </div>
        {!isSystemRole && hasChanges() && (
          <Button onClick={saveChanges} disabled={isSaving}>
            {isSaving ? t('permissionMatrix.saving') : t('permissionMatrix.saveChanges')}
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
                {t('permissionMatrix.systemRoleWarning')}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* CRUD Permission Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>{t('permissionMatrix.title')}</CardTitle>
          <CardDescription>
            {t('permissionMatrix.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2">
                  <th className="text-left p-3 font-medium text-sm bg-muted sticky left-0">
                    {t('permissionMatrix.module')}
                  </th>
                  {CRUD_ACTIONS.map((action) => (
                    <th key={action} className="text-center p-3 font-medium text-sm bg-muted min-w-[100px]">
                      {action}
                    </th>
                  ))}
                  {!isSystemRole && (
                    <th className="text-center p-3 font-medium text-sm bg-muted">
                      {t('permissionMatrix.actions')}
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {resources.map((resource, idx) => {
                  const resourcePerms = groupedByResource[resource] || [];
                  
                  return (
                    <tr 
                      key={resource}
                      className={cn(
                        "border-b hover:bg-accent/30 transition-colors",
                        idx % 2 === 0 && "bg-accent/10"
                      )}
                    >
                      <td className="p-3 font-medium sticky left-0 bg-background">
                        {resource}
                      </td>
                      
                      {CRUD_ACTIONS.map((action) => {
                        const perm = permissions.find(
                          p => p.resource === resource && p.action.toLowerCase() === action.toLowerCase()
                        );
                        const isSelected = perm ? selectedPermissions.has(perm.id) : false;
                        
                        return (
                          <td key={action} className="text-center p-3">
                            {perm ? (
                              <Checkbox
                                checked={isSelected}
                                disabled={isSystemRole}
                                onCheckedChange={() => togglePermission(perm.id)}
                                className="mx-auto"
                              />
                            ) : (
                              <span className="text-gray-300">-</span>
                            )}
                          </td>
                        );
                      })}
                      
                      {!isSystemRole && (
                        <td className="text-center p-3">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => selectAllCRUD(resource)}
                              className="h-7 px-2 text-xs"
                            >
                              {t('permissionMatrix.selectAll')}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => clearAllCRUD(resource)}
                              className="h-7 px-2 text-xs"
                            >
                              {t('permissionMatrix.clearAll')}
                            </Button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Special Permissions (Non-CRUD) */}
      {permissions.some(p => !CRUD_ACTIONS.some(a => a.toLowerCase() === p.action.toLowerCase())) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Special Permissions</CardTitle>
            <CardDescription>
              Non-CRUD operations (Approve, Export, Execute, etc.)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {permissions
                .filter(p => !CRUD_ACTIONS.some(a => a.toLowerCase() === p.action.toLowerCase()))
                .map((permission) => {
                  const isSelected = selectedPermissions.has(permission.id);
                  
                  return (
                    <div
                      key={permission.id}
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-lg border transition-colors",
                        isSelected ? "bg-accent border-primary" : "hover:bg-accent/50",
                        isSystemRole ? "cursor-not-allowed opacity-70" : "cursor-pointer"
                      )}
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
                          <Badge variant="outline">
                            {permission.action}
                          </Badge>
                          <span className="text-sm font-medium">{permission.resource}</span>
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
      )}
    </div>
  );
}
