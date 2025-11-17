/**
 * TEAMS MANAGEMENT PAGE
 * Manage organizational teams
 * 
 * Features:
 * - Team list with data table
 * - Create/Edit/Delete team
 * - Member management
 * - Team type filtering
 * 
 * Created: 2025-11-17
 */

import { Metadata } from "next";
import { db } from "@/core/database/client";
import { teams } from "@/core/database/schema";
import { TeamsTableClient } from "./teams-table-client";

export const metadata: Metadata = {
  title: "Teams | Admin",
  description: "Manage organizational teams",
};

export default async function TeamsPage() {
  // Fetch all teams
  const teamsList = await db.select().from(teams);

  // Fetch departments for dropdown
  const departmentsList = await db.query.departments.findMany({
    columns: { id: true, name: true },
    where: (departments, { eq }) => eq(departments.isActive, true),
    orderBy: (departments, { asc }) => [asc(departments.name)],
  });

  // Fetch users for team leader selection
  const usersList = await db.query.user.findMany({
    columns: { id: true, name: true, email: true },
    where: (user, { eq }) => eq(user.status, 'active'),
    orderBy: (user, { asc }) => [asc(user.name)],
  });

  return (
    <TeamsTableClient
      data={teamsList}
      departments={departmentsList}
      users={usersList}
    />
  );
}
