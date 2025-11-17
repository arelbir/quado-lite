/**
 * AUTO-ASSIGNMENT SYSTEM
 * Handles automatic assignment of workflow tasks to users
 * 
 * Features:
 * - Round-robin assignment
 * - Workload-based assignment
 * - Availability check
 * - Delegation awareness
 * 
 * Created: 2025-01-25
 */

import { db } from "@/core/database/client";
import { user, stepAssignments, workflowDelegations } from "@/core/database/schema";
import { eq, and, lte, gte, count } from "drizzle-orm";

/**
 * Assignment Strategy Types
 */
export type AssignmentStrategy = "round-robin" | "workload" | "random";

/**
 * User Availability Status
 */
interface UserAvailability {
  isAvailable: boolean;
  reason?: string;
  delegatedTo?: string;
}

/**
 * User Workload Info
 */
interface UserWorkload {
  userId: string;
  pendingCount: number;
  overdueCount: number;
  totalWorkload: number;
}

/**
 * Assignment Cache (In-memory, could be moved to Redis)
 */
const assignmentCache = new Map<string, string>(); // role -> lastAssignedUserId

/**
 * Get users by role
 */
async function getUsersByRole(role: string): Promise<any[]> {
  const users = await db.query.user.findMany({
    where: eq(user.status, "Active"),
    with: {
      userRoles: {
        with: {
          role: true,
        },
      },
    },
  });

  return users.filter((u: any) => 
    u.userRoles?.some((ur: any) => ur.role.name.toLowerCase() === role.toLowerCase())
  );
}

/**
 * Check if user is available (not on leave, has no delegation)
 */
async function checkUserAvailability(
  userId: string,
  role: string
): Promise<UserAvailability> {
  // Check user status
  const userRecord = await db.query.user.findFirst({
    where: eq(user.id, userId),
  });

  if (!userRecord) {
    return { isAvailable: false, reason: "User not found" };
  }

  if (userRecord.status !== "Active") {
    return { isAvailable: false, reason: "User is not active" };
  }

  // Check active delegation (user delegated their authority to someone else)
  const now = new Date();
  const delegation = await db.query.workflowDelegations.findFirst({
    where: and(
      eq(workflowDelegations.fromUserId, userId),
      eq(workflowDelegations.role, role),
      eq(workflowDelegations.isActive, true),
      lte(workflowDelegations.startDate, now),
      gte(workflowDelegations.endDate, now)
    ),
  });

  if (delegation) {
    return { 
      isAvailable: false, 
      reason: "User has delegated authority",
      delegatedTo: delegation.toUserId,
    };
  }

  return { isAvailable: true };
}

/**
 * Get user workload (pending + overdue assignments)
 */
async function getUserWorkload(userId: string): Promise<UserWorkload> {
  const now = new Date();

  const assignments = await db.query.stepAssignments.findMany({
    where: and(
      eq(stepAssignments.assignedUserId, userId),
      eq(stepAssignments.status, "pending")
    ),
  });

  const pendingCount = assignments.length;
  const overdueCount = assignments.filter((a: any) => 
    a.deadline && new Date(a.deadline) < now
  ).length;

  // Weighted workload: overdue tasks count double
  const totalWorkload = pendingCount + (overdueCount * 2);

  return {
    userId,
    pendingCount,
    overdueCount,
    totalWorkload,
  };
}

/**
 * Round-robin assignment strategy
 * Assigns to next user in rotation
 */
async function roundRobinAssignment(role: string): Promise<string | null> {
  const users = await getUsersByRole(role);

  if (users.length === 0) return null;

  // Get last assigned user for this role
  const lastAssignedId = assignmentCache.get(role);

  let startIndex = 0;
  if (lastAssignedId) {
    const lastIndex = users.findIndex((u: any) => u.id === lastAssignedId);
    if (lastIndex >= 0) {
      startIndex = (lastIndex + 1) % users.length;
    }
  }

  // Try to find available user starting from next in rotation
  for (let i = 0; i < users.length; i++) {
    const index = (startIndex + i) % users.length;
    const user = users[index];

    const availability = await checkUserAvailability(user.id, role);

    if (availability.isAvailable) {
      // Update cache
      assignmentCache.set(role, user.id);
      return user.id;
    } else if (availability.delegatedTo) {
      // Use delegated user
      assignmentCache.set(role, availability.delegatedTo);
      return availability.delegatedTo;
    }
  }

  // If no available user, return first user as fallback
  return users[0]?.id || null;
}

/**
 * Workload-based assignment strategy
 * Assigns to user with least workload
 */
async function workloadBasedAssignment(role: string): Promise<string | null> {
  const users = await getUsersByRole(role);

  if (users.length === 0) return null;

  // Get workload for each user
  const workloads: UserWorkload[] = [];

  for (const user of users) {
    const availability = await checkUserAvailability(user.id, role);

    if (availability.isAvailable) {
      const workload = await getUserWorkload(user.id);
      workloads.push(workload);
    } else if (availability.delegatedTo) {
      // Include delegated user
      const workload = await getUserWorkload(availability.delegatedTo);
      workloads.push(workload);
    }
  }

  if (workloads.length === 0) {
    // Fallback: return first user
    return users[0]?.id || null;
  }

  // Sort by workload (ascending) and return user with least workload
  workloads.sort((a, b) => a.totalWorkload - b.totalWorkload);

  return workloads[0]?.userId || null;
}

/**
 * Random assignment strategy (for testing/fallback)
 */
async function randomAssignment(role: string): Promise<string | null> {
  const users = await getUsersByRole(role);

  if (users.length === 0) return null;

  // Get available users
  const availableUsers: string[] = [];

  for (const user of users) {
    const availability = await checkUserAvailability(user.id, role);

    if (availability.isAvailable) {
      availableUsers.push(user.id);
    } else if (availability.delegatedTo) {
      availableUsers.push(availability.delegatedTo);
    }
  }

  if (availableUsers.length === 0) {
    return users[0]?.id || null;
  }

  // Random selection
  const randomIndex = Math.floor(Math.random() * availableUsers.length);
  return availableUsers[randomIndex] || null;
}

/**
 * Main auto-assignment function
 * Determines next assignee based on strategy
 */
export async function getNextAssignee(
  role: string,
  strategy: AssignmentStrategy = "workload"
): Promise<string | null> {
  try {
    switch (strategy) {
      case "round-robin":
        return await roundRobinAssignment(role);
      
      case "workload":
        return await workloadBasedAssignment(role);
      
      case "random":
        return await randomAssignment(role);
      
      default:
        return await workloadBasedAssignment(role);
    }
  } catch (error) {
    console.error(`Auto-assignment error for role ${role}:`, error);
    // Fallback: try to get any user with this role
    const users = await getUsersByRole(role);
    return users[0]?.id || null;
  }
}

/**
 * Clear assignment cache (for testing or manual reset)
 */
export function clearAssignmentCache() {
  assignmentCache.clear();
}

/**
 * Get assignment statistics (for monitoring)
 */
export async function getAssignmentStats(role: string) {
  const users = await getUsersByRole(role);
  const stats = [];

  for (const user of users) {
    const availability = await checkUserAvailability(user.id, role);
    const workload = await getUserWorkload(user.id);

    stats.push({
      userId: user.id,
      name: user.name,
      email: user.email,
      isAvailable: availability.isAvailable,
      unavailableReason: availability.reason,
      delegatedTo: availability.delegatedTo,
      pendingTasks: workload.pendingCount,
      overdueTasks: workload.overdueCount,
      totalWorkload: workload.totalWorkload,
    });
  }

  return stats;
}
