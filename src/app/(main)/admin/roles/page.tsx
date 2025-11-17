/**
 * ROLE MANAGEMENT PAGE
 * Manage system roles and permissions
 * 
 * Features:
 * - Role list (DataTable)
 * - Create/Edit/Delete role
 * - Permission count
 * - System vs Custom roles
 * 
 * Created: 2025-01-24
 * Week 7-8: Day 5
 */

import { Metadata } from "next";
import { db } from "@/core/database/client";
import { RolesTableClient } from "./roles-table-client";

export const metadata: Metadata = {
  title: "Role Management | Admin",
  description: "Manage roles and permissions",
};

export default async function RolesPage() {
  // Fetch all roles with permissions and all available permissions
  const [roles, allPermissions] = await Promise.all([
    db.query.roles.findMany({
      with: {
        permissions: {
          with: {
            permission: true,
          },
        },
      } as any,
      orderBy: (roles, { asc }) => [asc(roles.name)],
    }),
    db.query.permissions.findMany({
      orderBy: (permissions, { asc }) => [asc(permissions.name)],
    }),
  ]);

  // Transform roles data
  const rolesWithPermissions = roles.map((role: any) => ({
    ...role,
    permissions: role.permissions?.map((rp: any) => ({ id: rp.permission.id })) || [],
  }));

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Roles</h2>
          <p className="text-muted-foreground">
            Manage system roles and their permissions
          </p>
        </div>
      </div>

      <RolesTableClient 
        roles={rolesWithPermissions as any} 
        permissions={allPermissions as any}
      />
    </div>
  );
}
