/**
 * TEAM DETAIL PAGE
 * View and manage team details
 * 
 * Features:
 * - Team information display
 * - Edit team details
 * - Member management
 * - Team timeline/activity
 * 
 * Created: 2025-11-17
 */

import { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/core/database/client";
import { teams, userTeams } from "@/core/database/schema";
import { eq } from "drizzle-orm";
import { TeamDetailClient } from "./team-detail-client";

export const metadata: Metadata = {
  title: "Team Detail | Admin",
  description: "View and manage team details",
};

interface PageProps {
  params: {
    id: string;
  };
}

export default async function TeamDetailPage({ params }: PageProps) {
  // Fetch team with relations
  const [team] = await db
    .select()
    .from(teams)
    .where(eq(teams.id, params.id))
    .limit(1);

  if (!team) {
    notFound();
  }

  // Fetch team members
  const members = await db.query.userTeams.findMany({
    where: (userTeams, { eq }) => eq(userTeams.teamId, params.id),
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });

  // Fetch available users for adding members
  const availableUsers = await db.query.user.findMany({
    columns: { id: true, name: true, email: true, image: true },
    where: (user, { eq }) => eq(user.status, 'active'),
    orderBy: (user, { asc }) => [asc(user.name)],
  });

  // Fetch departments for dropdown
  const departments = await db.query.departments.findMany({
    columns: { id: true, name: true },
    where: (departments, { eq }) => eq(departments.isActive, true),
    orderBy: (departments, { asc }) => [asc(departments.name)],
  });

  // Fetch users for leader selection
  const users = await db.query.user.findMany({
    columns: { id: true, name: true, email: true },
    where: (user, { eq }) => eq(user.status, 'active'),
    orderBy: (user, { asc }) => [asc(user.name)],
  });

  return (
    <TeamDetailClient
      team={team}
      members={members}
      availableUsers={availableUsers}
      departments={departments}
      users={users}
    />
  );
}
