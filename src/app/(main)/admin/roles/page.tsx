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
import { db } from "@/drizzle/db";
import { RolesTableClient } from "./roles-table-client";

export const metadata: Metadata = {
  title: "Role Management | Admin",
  description: "Manage roles and permissions",
};

export default async function RolesPage() {
  // Fetch all roles with permission count
  const roles = await db.query.roles.findMany({
    with: {
      permissions: {
        with: {
          permission: true,
        },
      },
    },
    orderBy: (roles, { asc }) => [asc(roles.name)],
  });

  // Transform data to include permission count
  const rolesWithCount = roles.map(role => ({
    ...role,
    permissionCount: role.permissions.length,
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

      <RolesTableClient roles={rolesWithCount as any} />
    </div>
  );
}
