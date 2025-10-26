/**
 * ROLE DETAIL PAGE
 * Manage individual role and its permissions
 * 
 * Features:
 * - Role information
 * - Permission matrix
 * - Assign/Revoke permissions
 * - User list with this role
 * 
 * Created: 2025-01-24
 * Week 7-8: Day 5
 */

import { Metadata } from "next";
import { db } from "@/drizzle/db";
import { eq } from "drizzle-orm";
import { roles } from "@/drizzle/schema";
import { notFound } from "next/navigation";
import { PermissionMatrix } from "@/components/admin/permission-matrix";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Role Details | Admin",
  description: "Manage role permissions",
};

export default async function RoleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Fetch role with permissions and users
  const roleData = await db.query.roles.findFirst({
    where: eq(roles.id, id),
    with: {
      permissions: {
        with: {
          permission: true,
        },
      },
      userRoles: {
        with: {
          user: {
            columns: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    } as any,
  });

  if (!roleData) {
    notFound();
  }

  const role = roleData as any;

  // Fetch all available permissions
  const allPermissions = await db.query.permissions.findMany({
    orderBy: (permissions, { asc }) => [asc(permissions.name)],
  });

  // Get assigned permission IDs
  const assignedPermissionIds = new Set<string>(
    role.permissions?.map((rp: any) => rp.permission.id) || []
  );

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6" />
            <h2 className="text-3xl font-bold tracking-tight">{role.name}</h2>
            {role.isSystem && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                System
              </Badge>
            )}
          </div>
          {role.description && (
            <p className="text-muted-foreground mt-1">{role.description}</p>
          )}
        </div>
      </div>

      {/* Role Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Assigned Permissions</CardDescription>
            <CardTitle className="text-3xl">{role.permissions?.length || 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Users with this Role</CardDescription>
            <CardTitle className="text-3xl">{role.userRoles?.length || 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Status</CardDescription>
            <CardTitle className="text-2xl">
              {role.isActive ? (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  Active
                </Badge>
              ) : (
                <Badge variant="destructive">Inactive</Badge>
              )}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Permission Matrix */}
      <PermissionMatrix
        roleId={role.id}
        permissions={allPermissions}
        assignedPermissionIds={assignedPermissionIds}
        isSystemRole={role.isSystem}
      />

      {/* Users with this Role */}
      {role.userRoles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Users with this Role</CardTitle>
            <CardDescription>
              {role.userRoles.length} users currently have this role
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {role.userRoles.slice(0, 10).map((ur: any) => (
                <div
                  key={ur.id}
                  className="flex items-center justify-between p-2 rounded border"
                >
                  <div>
                    <div className="font-medium">{ur.user.name || "N/A"}</div>
                    <div className="text-sm text-muted-foreground">
                      {ur.user.email}
                    </div>
                  </div>
                  {ur.validFrom && ur.validTo && (
                    <Badge variant="outline" className="text-xs">
                      Time-based
                    </Badge>
                  )}
                </div>
              ))}
              {role.userRoles.length > 10 && (
                <div className="text-sm text-muted-foreground text-center pt-2">
                  +{role.userRoles.length - 10} more users
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
