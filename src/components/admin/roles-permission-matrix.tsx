"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, Shield, Minus } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useTranslations } from 'next-intl';
import type { roles, permissions } from "@/drizzle/schema/role-system";

type Role = typeof roles.$inferSelect;
type Permission = typeof permissions.$inferSelect;

// Extended types with relations
type RoleWithPermissions = Role & {
  permissions?: { id: string }[];
};

interface RolesPermissionMatrixProps {
  roles: RoleWithPermissions[];
  permissions: Permission[];
}

// CRUD Actions we want to track
const CRUD_ACTIONS = ['Create', 'Read', 'Update', 'Delete'] as const;

export function RolesPermissionMatrix({ roles, permissions }: RolesPermissionMatrixProps) {
  const t = useTranslations('roles');
  
  // Group permissions by resource (module)
  const groupedByResource = permissions.reduce((acc, permission) => {
    const resource = permission.resource || "Other";
    if (!acc[resource]) {
      acc[resource] = [];
    }
    acc[resource].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  // Get resources sorted
  const resources = Object.keys(groupedByResource).sort();

  // Check if a role has a specific permission
  const hasPermission = (role: RoleWithPermissions, resource: string, action: string): boolean | null => {
    const permission = permissions.find(p => 
      p.resource === resource && p.action.toLowerCase() === action.toLowerCase()
    );
    
    if (!permission) return null; // Permission doesn't exist
    
    return role.permissions?.some((p: { id: string }) => p.id === permission.id) || false;
  };

  // Calculate coverage percentage for a role
  const calculateCoverage = (role: RoleWithPermissions): number => {
    if (permissions.length === 0) return 0;
    return Math.round((role.permissions?.length || 0) / permissions.length * 100);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          <CardTitle>{t('rolesPermissionMatrix.title')}</CardTitle>
        </CardTitle>
        <CardDescription>
          {t('rolesPermissionMatrix.description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Matrix Container */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2">
                <th className="text-left p-3 font-medium text-sm bg-muted">
                  {t('rolesPermissionMatrix.module')}
                </th>
                {CRUD_ACTIONS.map((action) => (
                  <th key={action} className="text-center p-3 font-medium text-sm bg-muted">
                    {action}
                  </th>
                ))}
                {roles.map((role) => (
                  <th key={role.id} className="text-center p-3 font-medium text-sm bg-muted min-w-[100px]">
                    <div className="flex flex-col items-center gap-1">
                      <span className="truncate max-w-[100px]">{role.name}</span>
                      {role.isSystem && (
                        <Badge variant="secondary" className="text-xs">{t('rolesPermissionMatrix.system')}</Badge>
                      )}
                      <span className="text-xs font-normal text-muted-foreground">
                        {calculateCoverage(role)}%
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {resources.map((resource, idx) => (
                <tr 
                  key={resource}
                  className={cn(
                    "border-b hover:bg-accent/50 transition-colors",
                    idx % 2 === 0 && "bg-accent/20"
                  )}
                >
                  {/* Resource Name */}
                  <td className="p-3 font-medium">
                    {resource}
                  </td>
                  
                  {/* CRUD Columns - Show if permission type exists */}
                  {CRUD_ACTIONS.map((action) => {
                    const permExists = groupedByResource[resource]?.some(
                      p => p.action.toLowerCase() === action.toLowerCase()
                    );
                    return (
                      <td key={action} className="text-center p-3">
                        {permExists ? (
                          <Badge variant="outline" className="text-xs">
                            ✓
                          </Badge>
                        ) : (
                          <Minus className="w-4 h-4 text-gray-300 mx-auto" />
                        )}
                      </td>
                    );
                  })}
                  
                  {/* Role Permissions */}
                  {roles.map((role) => (
                    <td key={role.id} className="text-center p-3">
                      <div className="flex items-center justify-center gap-1">
                        {CRUD_ACTIONS.map((action) => {
                          const hasPerm = hasPermission(role, resource, action);
                          if (hasPerm === null) return null; // Permission doesn't exist
                          
                          return (
                            <div
                              key={action}
                              className={cn(
                                "w-2 h-6 rounded-sm",
                                hasPerm ? "bg-green-500" : "bg-gray-200"
                              )}
                              title={`${action}: ${hasPerm ? 'Yes' : 'No'}`}
                            />
                          );
                        })}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t flex items-center gap-6 text-sm flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-4 h-6 rounded-sm bg-green-500" />
            <span className="text-muted-foreground">{t('rolesPermissionMatrix.hasPermission')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-6 rounded-sm bg-gray-200" />
            <span className="text-muted-foreground">{t('rolesPermissionMatrix.noPermission')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Minus className="w-4 h-4 text-gray-300" />
            <span className="text-muted-foreground">{t('rolesPermissionMatrix.operationNotAvailable')}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
