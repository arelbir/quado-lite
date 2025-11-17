/**
 * GROUPS MANAGEMENT PAGE
 * Manage cross-functional groups
 * 
 * Features:
 * - Group list with data table
 * - Create/Edit/Delete group
 * - Member management
 * - Group type filtering
 * 
 * Created: 2025-11-17
 */

import { Metadata } from "next";
import { db } from "@/core/database/client";
import { groups } from "@/core/database/schema";
import { GroupsTableClient } from "./groups-table-client";

export const metadata: Metadata = {
  title: "Groups | Admin",
  description: "Manage cross-functional groups",
};

export default async function GroupsPage() {
  // Fetch all groups
  const groupsList = await db.select().from(groups);

  // Fetch departments for dropdown (optional for groups)
  const departmentsList = await db.query.departments.findMany({
    columns: { id: true, name: true },
    where: (departments, { eq }) => eq(departments.isActive, true),
    orderBy: (departments, { asc }) => [asc(departments.name)],
  });

  // Fetch users for owner selection
  const usersList = await db.query.user.findMany({
    columns: { id: true, name: true, email: true },
    where: (user, { eq }) => eq(user.status, 'active'),
    orderBy: (user, { asc }) => [asc(user.name)],
  });

  return (
    <GroupsTableClient
      data={groupsList}
      departments={departmentsList}
      users={usersList}
    />
  );
}
