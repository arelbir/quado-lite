'use server';

/**
 * TEAM ACTIONS
 * Complete CRUD operations for Teams
 * Generic, reusable, type-safe
 */

import { db } from '@/core/database/client';
import { teams, userTeams } from '@/core/database/schema';
import { eq, and, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { withAuth, createPermissionError } from '@/lib/helpers';
import { checkPermission } from '@/core/permissions/unified-permission-checker';

/**
 * Create new team
 */
export async function createTeam(data: {
  name: string;
  description?: string;
  type: 'Permanent' | 'Project' | 'Virtual';
  departmentId?: string;
  leaderId?: string;
}): Promise<any> {
  return withAuth<any>(async (user: any) => {
    const perm = await checkPermission({
      user,
      resource: 'team',
      action: 'create',
    });

    if (!perm.allowed) {
      return createPermissionError(perm.reason || 'Permission denied');
    }

    try {
      const [team] = await db
        .insert(teams)
        .values({
          name: data.name,
          description: data.description,
          type: data.type,
          departmentId: data.departmentId,
          leaderId: data.leaderId,
          createdById: user.id,
        })
        .returning();

      // If leaderId provided, add them as a member
      if (data.leaderId && team) {
        await db.insert(userTeams).values({
          teamId: team.id,
          userId: data.leaderId,
          role: 'Lead',
          joinedAt: new Date(),
        });
      }

      revalidatePath('/admin/teams');
      return { success: true, data: team };
    } catch (error) {
      console.error('[createTeam] Error:', error);
      return { success: false, error: 'Failed to create team' };
    }
  });
}

/**
 * Update team
 */
export async function updateTeam(
  id: string,
  data: {
    name?: string;
    description?: string;
    type?: 'Permanent' | 'Project' | 'Virtual';
    departmentId?: string;
    leaderId?: string;
    isActive?: boolean;
  }
): Promise<any> {
  return withAuth<any>(async (user: any) => {
    const perm = await checkPermission({
      user,
      resource: 'team',
      action: 'update',
    });

    if (!perm.allowed) {
      return createPermissionError(perm.reason || 'Permission denied');
    }

    try {
      const [team] = await db
        .update(teams)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(teams.id, id))
        .returning();

      if (!team) {
        return { success: false, error: 'Team not found' };
      }

      revalidatePath('/admin/teams');
      revalidatePath(`/admin/teams/${id}`);
      return { success: true, data: team };
    } catch (error) {
      console.error('[updateTeam] Error:', error);
      return { success: false, error: 'Failed to update team' };
    }
  });
}

/**
 * Delete team
 */
export async function deleteTeam(id: string): Promise<any> {
  return withAuth<any>(async (user: any) => {
    const perm = await checkPermission({
      user,
      resource: 'team',
      action: 'delete',
    });

    if (!perm.allowed) {
      return createPermissionError(perm.reason || 'Permission denied');
    }

    try {
      // Soft delete
      await db
        .update(teams)
        .set({
          isActive: false,
          updatedAt: new Date(),
        })
        .where(eq(teams.id, id));

      revalidatePath('/admin/teams');
      return { success: true, data: null };
    } catch (error) {
      console.error('[deleteTeam] Error:', error);
      return { success: false, error: 'Failed to delete team' };
    }
  });
}

/**
 * Add member to team
 */
export async function addTeamMember(data: {
  teamId: string;
  userId: string;
  role?: 'Owner' | 'Admin' | 'Lead' | 'Member';
}): Promise<any> {
  return withAuth<any>(async (user: any) => {
    const perm = await checkPermission({
      user,
      resource: 'team',
      action: 'update',
    });

    if (!perm.allowed) {
      return createPermissionError(perm.reason || 'Permission denied');
    }

    try {
      // Check if already a member
      const existing = await db.query.userTeams.findFirst({
        where: and(
          eq(userTeams.teamId, data.teamId),
          eq(userTeams.userId, data.userId)
        ),
      });

      if (existing) {
        return { success: false, error: 'User is already a member' };
      }

      const [member] = await db
        .insert(userTeams)
        .values({
          teamId: data.teamId,
          userId: data.userId,
          role: data.role || 'Member',
          joinedAt: new Date(),
        })
        .returning();

      revalidatePath(`/admin/teams/${data.teamId}`);
      return { success: true, data: member };
    } catch (error) {
      console.error('[addTeamMember] Error:', error);
      return { success: false, error: 'Failed to add member' };
    }
  });
}

/**
 * Remove member from team
 */
export async function removeTeamMember(data: {
  teamId: string;
  userId: string;
}): Promise<any> {
  return withAuth<any>(async (user: any) => {
    const perm = await checkPermission({
      user,
      resource: 'team',
      action: 'update',
    });

    if (!perm.allowed) {
      return createPermissionError(perm.reason || 'Permission denied');
    }

    try {
      await db
        .delete(userTeams)
        .where(
          and(
            eq(userTeams.teamId, data.teamId),
            eq(userTeams.userId, data.userId)
          )
        );

      revalidatePath(`/admin/teams/${data.teamId}`);
      return { success: true, data: null };
    } catch (error) {
      console.error('[removeTeamMember] Error:', error);
      return { success: false, error: 'Failed to remove member' };
    }
  });
}

/**
 * Update member role
 */
export async function updateTeamMemberRole(data: {
  teamId: string;
  userId: string;
  role: 'Owner' | 'Admin' | 'Lead' | 'Member';
}): Promise<any> {
  return withAuth<any>(async (user: any) => {
    const perm = await checkPermission({
      user,
      resource: 'team',
      action: 'update',
    });

    if (!perm.allowed) {
      return createPermissionError(perm.reason || 'Permission denied');
    }

    try {
      const [member] = await db
        .update(userTeams)
        .set({
          role: data.role,
        })
        .where(
          and(
            eq(userTeams.teamId, data.teamId),
            eq(userTeams.userId, data.userId)
          )
        )
        .returning();

      if (!member) {
        return { success: false, error: 'Member not found' };
      }

      revalidatePath(`/admin/teams/${data.teamId}`);
      return { success: true, data: member };
    } catch (error) {
      console.error('[updateTeamMemberRole] Error:', error);
      return { success: false, error: 'Failed to update role' };
    }
  });
}

/**
 * Change team leader
 */
export async function changeTeamLeader(data: {
  teamId: string;
  newLeaderId: string;
}): Promise<any> {
  return withAuth<any>(async (user: any) => {
    const perm = await checkPermission({
      user,
      resource: 'team',
      action: 'update',
    });

    if (!perm.allowed) {
      return createPermissionError(perm.reason || 'Permission denied');
    }

    try {
      // Update team leader
      await db
        .update(teams)
        .set({
          leaderId: data.newLeaderId,
          updatedAt: new Date(),
        })
        .where(eq(teams.id, data.teamId));

      // Update member roles
      // Remove old leader role
      await db
        .update(userTeams)
        .set({ role: 'Member' })
        .where(
          and(
            eq(userTeams.teamId, data.teamId),
            eq(userTeams.role, 'Lead')
          )
        );

      // Set new leader role
      await db
        .update(userTeams)
        .set({ role: 'Lead' })
        .where(
          and(
            eq(userTeams.teamId, data.teamId),
            eq(userTeams.userId, data.newLeaderId)
          )
        );

      revalidatePath(`/admin/teams/${data.teamId}`);
      return { success: true, data: null };
    } catch (error) {
      console.error('[changeTeamLeader] Error:', error);
      return { success: false, error: 'Failed to change leader' };
    }
  });
}

/**
 * Get team members
 */
export async function getTeamMembers(teamId: string): Promise<any> {
  return withAuth<any>(async (user: any) => {
    try {
      const members = await db.query.userTeams.findMany({
        where: eq(userTeams.teamId, teamId),
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
        orderBy: [desc(userTeams.joinedAt)],
      });

      return { success: true, data: members };
    } catch (error) {
      console.error('[getTeamMembers] Error:', error);
      return { success: false, error: 'Failed to load members' };
    }
  });
}
