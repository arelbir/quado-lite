/**
 * GROUP DETAIL PAGE
 * View and manage group details
 * 
 * Features:
 * - Group information display
 * - Edit group details
 * - Member management
 * - Group timeline/activity
 * 
 * Created: 2025-11-17
 */

import { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/core/database/client";
import { groups, groupMembers } from "@/core/database/schema";
import { eq } from "drizzle-orm";
import { GroupDetailClient } from "./group-detail-client";

export const metadata: Metadata = {
  title: "Group Detail | Admin",
  description: "View and manage group details",
};

interface PageProps {
  params: {
    id: string;
  };
}

export default async function GroupDetailPage({ params }: PageProps) {
  // Fetch group
  const [group] = await db
    .select()
    .from(groups)
    .where(eq(groups.id, params.id))
    .limit(1);

  if (!group) {
    notFound();
  }

  // Fetch group members
  const members = await db.query.groupMembers.findMany({
    where: (groupMembers, { eq }) => eq(groupMembers.groupId, params.id),
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

  // Fetch users for owner selection
  const users = await db.query.user.findMany({
    columns: { id: true, name: true, email: true },
    where: (user, { eq }) => eq(user.status, 'active'),
    orderBy: (user, { asc }) => [asc(user.name)],
  });

  return (
    <GroupDetailClient
      group={group}
      members={members}
      availableUsers={availableUsers}
      departments={departments}
      users={users}
    />
  );
}
