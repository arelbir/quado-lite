'use server';

/**
 * GROUP ACTIONS
 * Complete CRUD operations for Groups
 * Generic, reusable, type-safe
 */

import { db } from '@/core/database/client';
import { groups, groupMembers } from '@/core/database/schema';
import { eq, and, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { withAuth, createPermissionError } from '@/lib/helpers';
import { checkPermission } from '@/core/permissions/unified-permission-checker';

/**
 * Create new group
 */
export async function createGroup(data: {
  name: string;
  description?: string;
  type: 'INTEREST' | 'SKILL' | 'COMMUNITY' | 'PROJECT';
  visibility: 'PUBLIC' | 'PRIVATE' | 'INVITE_ONLY';
  departmentId?: string;
}): Promise<any> {
  return withAuth<any>(async (user: any) => {
    const perm = await checkPermission({
      user,
      resource: 'group',
      action: 'create',
    });

    if (!perm.allowed) {
      return createPermissionError(perm.reason || 'Permission denied');
    }

    try {
      const [group] = await db
        .insert(groups)
        .values({
          name: data.name,
          description: data.description,
          type: data.type,
          visibility: data.visibility,
          departmentId: data.departmentId,
          createdById: user.id,
        })
        .returning();

      // Add creator as owner
      await db.insert(groupMembers).values({
        groupId: group.id,
        userId: user.id,
        role: 'OWNER',
        joinedAt: new Date(),
      });

      revalidatePath('/admin/groups');
      return { success: true, data: group };
    } catch (error) {
      console.error('[createGroup] Error:', error);
      return { success: false, error: 'Failed to create group' };
    }
  });
}

/**
 * Update group
 */
export async function updateGroup(
  id: string,
  data: {
    name?: string;
    description?: string;
    type?: 'INTEREST' | 'SKILL' | 'COMMUNITY' | 'PROJECT';
    visibility?: 'PUBLIC' | 'PRIVATE' | 'INVITE_ONLY';
    departmentId?: string;
    isActive?: boolean;
  }
): Promise<any> {
  return withAuth<any>(async (user: any) => {
    const perm = await checkPermission({
      user,
      resource: 'group',
      action: 'update',
    });

    if (!perm.allowed) {
      return createPermissionError(perm.reason || 'Permission denied');
    }

    try {
      const [group] = await db
        .update(groups)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(groups.id, id))
        .returning();

      if (!group) {
        return { success: false, error: 'Group not found' };
      }

      revalidatePath('/admin/groups');
      revalidatePath(`/admin/groups/${id}`);
      return { success: true, data: group };
    } catch (error) {
      console.error('[updateGroup] Error:', error);
      return { success: false, error: 'Failed to update group' };
    }
  });
}

/**
 * Delete group
 */
export async function deleteGroup(id: string): Promise<any> {
  return withAuth<any>(async (user: any) => {
    const perm = await checkPermission({
      user,
      resource: 'group',
      action: 'delete',
    });

    if (!perm.allowed) {
      return createPermissionError(perm.reason || 'Permission denied');
    }

    try {
      // Soft delete
      await db
        .update(groups)
        .set({
          isActive: false,
          updatedAt: new Date(),
        })
        .where(eq(groups.id, id));

      revalidatePath('/admin/groups');
      return { success: true };
    } catch (error) {
      console.error('[deleteGroup] Error:', error);
      return { success: false, error: 'Failed to delete group' };
    }
  });
}

/**
 * Add member to group
 */
export async function addGroupMember(data: {
  groupId: string;
  userId: string;
  role?: 'OWNER' | 'ADMIN' | 'MEMBER';
}): Promise<any> {
  return withAuth<any>(async (user: any) => {
    const perm = await checkPermission({
      user,
      resource: 'group',
      action: 'update',
    });

    if (!perm.allowed) {
      return createPermissionError(perm.reason || 'Permission denied');
    }

    try {
      // Check if already a member
      const existing = await db.query.groupMembers.findFirst({
        where: and(
          eq(groupMembers.groupId, data.groupId),
          eq(groupMembers.userId, data.userId)
        ),
      });

      if (existing) {
        return { success: false, error: 'User is already a member' };
      }

      const [member] = await db
        .insert(groupMembers)
        .values({
          groupId: data.groupId,
          userId: data.userId,
          role: data.role || 'MEMBER',
          joinedAt: new Date(),
        })
        .returning();

      revalidatePath(`/admin/groups/${data.groupId}`);
      return { success: true, data: member };
    } catch (error) {
      console.error('[addGroupMember] Error:', error);
      return { success: false, error: 'Failed to add member' };
    }
  });
}

/**
 * Remove member from group
 */
export async function removeGroupMember(data: {
  groupId: string;
  userId: string;
}): Promise<any> {
  return withAuth<any>(async (user: any) => {
    const perm = await checkPermission({
      user,
      resource: 'group',
      action: 'update',
    });

    if (!perm.allowed) {
      return createPermissionError(perm.reason || 'Permission denied');
    }

    try {
      await db
        .delete(groupMembers)
        .where(
          and(
            eq(groupMembers.groupId, data.groupId),
            eq(groupMembers.userId, data.userId)
          )
        );

      revalidatePath(`/admin/groups/${data.groupId}`);
      return { success: true };
    } catch (error) {
      console.error('[removeGroupMember] Error:', error);
      return { success: false, error: 'Failed to remove member' };
    }
  });
}

/**
 * Update member role
 */
export async function updateGroupMemberRole(data: {
  groupId: string;
  userId: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
}): Promise<any> {
  return withAuth<any>(async (user: any) => {
    const perm = await checkPermission({
      user,
      resource: 'group',
      action: 'update',
    });

    if (!perm.allowed) {
      return createPermissionError(perm.reason || 'Permission denied');
    }

    try {
      const [member] = await db
        .update(groupMembers)
        .set({
          role: data.role,
        })
        .where(
          and(
            eq(groupMembers.groupId, data.groupId),
            eq(groupMembers.userId, data.userId)
          )
        )
        .returning();

      if (!member) {
        return { success: false, error: 'Member not found' };
      }

      revalidatePath(`/admin/groups/${data.groupId}`);
      return { success: true, data: member };
    } catch (error) {
      console.error('[updateGroupMemberRole] Error:', error);
      return { success: false, error: 'Failed to update role' };
    }
  });
}

/**
 * Get group members
 */
export async function getGroupMembers(groupId: string): Promise<any> {
  return withAuth<any>(async (user: any) => {
    try {
      const members = await db.query.groupMembers.findMany({
        where: eq(groupMembers.groupId, groupId),
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
        orderBy: [desc(groupMembers.joinedAt)],
      });

      return { success: true, data: members };
    } catch (error) {
      console.error('[getGroupMembers] Error:', error);
      return { success: false, error: 'Failed to load members' };
    }
  });
}

/**
 * Join public group
 */
export async function joinGroup(groupId: string): Promise<any> {
  return withAuth<any>(async (user: any) => {
    try {
      // Check if group is public
      const group = await db.query.groups.findFirst({
        where: eq(groups.id, groupId),
      });

      if (!group) {
        return { success: false, error: 'Group not found' };
      }

      if (group.visibility !== 'PUBLIC') {
        return { success: false, error: 'Group is not public' };
      }

      // Check if already a member
      const existing = await db.query.groupMembers.findFirst({
        where: and(
          eq(groupMembers.groupId, groupId),
          eq(groupMembers.userId, user.id)
        ),
      });

      if (existing) {
        return { success: false, error: 'Already a member' };
      }

      const [member] = await db
        .insert(groupMembers)
        .values({
          groupId,
          userId: user.id,
          role: 'MEMBER',
          joinedAt: new Date(),
        })
        .returning();

      revalidatePath(`/admin/groups/${groupId}`);
      return { success: true, data: member };
    } catch (error) {
      console.error('[joinGroup] Error:', error);
      return { success: false, error: 'Failed to join group' };
    }
  });
}

/**
 * Leave group
 */
export async function leaveGroup(groupId: string): Promise<any> {
  return withAuth<any>(async (user: any) => {
    try {
      await db
        .delete(groupMembers)
        .where(
          and(
            eq(groupMembers.groupId, groupId),
            eq(groupMembers.userId, user.id)
          )
        );

      revalidatePath(`/admin/groups/${groupId}`);
      return { success: true };
    } catch (error) {
      console.error('[leaveGroup] Error:', error);
      return { success: false, error: 'Failed to leave group' };
    }
  });
}
