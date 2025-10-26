/**
 * TEAMS & GROUPS SCHEMA
 * Organizational teams and cross-functional groups
 * 
 * Features:
 * - Teams: Permanent organizational units (within departments)
 * - Groups: Functional/project-based groups (cross-departmental)
 * - Many-to-many user membership
 * - Role-based membership (Lead, Member, Admin)
 * - Visibility control
 * 
 * Created: 2025-01-24
 * Sprint: Week 4 - Teams & Groups
 */

import { 
  pgTable, 
  uuid, 
  varchar, 
  text,
  timestamp, 
  boolean,
  foreignKey,
  pgEnum 
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "./user";
import { departments } from "./organization";

/**
 * ENUMS
 */
export const teamType = pgEnum("TeamType", [
  'Permanent',   // Permanent organizational team
  'Project',     // Project-based team
  'Virtual'      // Virtual/temporary team
]);

export const groupType = pgEnum("GroupType", [
  'Functional',  // Functional group (e.g., Auditors, Quality Managers)
  'Project',     // Project-based group
  'Committee',   // Committee (e.g., ISO Committee)
  'Custom'       // Custom group
]);

export const memberRole = pgEnum("MemberRole", [
  'Owner',       // Group/Team owner (full control)
  'Admin',       // Administrator (manage members)
  'Lead',        // Team/Group lead
  'Member'       // Regular member
]);

export const visibility = pgEnum("Visibility", [
  'Public',      // Visible to all, anyone can request to join
  'Private',     // Visible to members only, invitation required
  'Restricted'   // Admin approval required
]);

/**
 * TEAMS TABLE
 * Organizational teams within departments
 */
export const teams = pgTable("Team", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  
  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code", { length: 50 }).notNull(),
  description: text("description"),
  
  // Organization
  departmentId: uuid("departmentId"), // Team belongs to department
  
  // Type
  type: teamType("type").default('Permanent').notNull(),
  
  // Leadership
  leaderId: uuid("leaderId"), // Team lead
  
  // Status
  isActive: boolean("isActive").default(true).notNull(),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt"),
  
  // Audit
  createdById: uuid("createdById"),
},
(table) => ({
  departmentFkey: foreignKey({
    columns: [table.departmentId],
    foreignColumns: [departments.id],
    name: "Team_departmentId_fkey"
  }).onDelete("set null"),
  leaderFkey: foreignKey({
    columns: [table.leaderId],
    foreignColumns: [user.id],
    name: "Team_leaderId_fkey"
  }).onDelete("set null"),
  createdByFkey: foreignKey({
    columns: [table.createdById],
    foreignColumns: [user.id],
    name: "Team_createdById_fkey"
  }).onDelete("set null"),
}));

/**
 * USER_TEAMS TABLE (Junction - Many-to-Many)
 * Users belong to teams
 */
export const userTeams = pgTable("UserTeam", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  
  userId: uuid("userId").notNull(),
  teamId: uuid("teamId").notNull(),
  
  // Role in team
  role: memberRole("role").default('Member').notNull(),
  
  // Status
  isPrimary: boolean("isPrimary").default(false), // User's primary team
  isActive: boolean("isActive").default(true).notNull(),
  
  // Timestamps
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
  leftAt: timestamp("leftAt"),
  
  // Audit
  invitedBy: uuid("invitedBy"),
},
(table) => ({
  userFkey: foreignKey({
    columns: [table.userId],
    foreignColumns: [user.id],
    name: "UserTeam_userId_fkey"
  }).onDelete("cascade"),
  teamFkey: foreignKey({
    columns: [table.teamId],
    foreignColumns: [teams.id],
    name: "UserTeam_teamId_fkey"
  }).onDelete("cascade"),
  invitedByFkey: foreignKey({
    columns: [table.invitedBy],
    foreignColumns: [user.id],
    name: "UserTeam_invitedBy_fkey"
  }).onDelete("set null"),
}));

/**
 * GROUPS TABLE
 * Cross-functional groups (not bound to departments)
 */
export const groups = pgTable("Group", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  
  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code", { length: 50 }).notNull(),
  description: text("description"),
  
  // Type
  type: groupType("type").default('Functional').notNull(),
  
  // Ownership
  ownerId: uuid("ownerId").notNull(), // Group owner
  
  // Organization (optional scope)
  companyId: uuid("companyId"), // Can be company-specific
  departmentId: uuid("departmentId"), // Or department-specific
  
  // Visibility & Access
  visibility: visibility("visibility").default('Public').notNull(),
  
  // Status
  isActive: boolean("isActive").default(true).notNull(),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt"),
  
  // Audit
  createdById: uuid("createdById"),
},
(table) => ({
  ownerFkey: foreignKey({
    columns: [table.ownerId],
    foreignColumns: [user.id],
    name: "Group_ownerId_fkey"
  }).onDelete("cascade"),
  departmentFkey: foreignKey({
    columns: [table.departmentId],
    foreignColumns: [departments.id],
    name: "Group_departmentId_fkey"
  }).onDelete("set null"),
  createdByFkey: foreignKey({
    columns: [table.createdById],
    foreignColumns: [user.id],
    name: "Group_createdById_fkey"
  }).onDelete("set null"),
}));

/**
 * GROUP_MEMBERS TABLE (Junction - Many-to-Many)
 * Users belong to groups
 */
export const groupMembers = pgTable("GroupMember", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  
  groupId: uuid("groupId").notNull(),
  userId: uuid("userId").notNull(),
  
  // Role in group
  role: memberRole("role").default('Member').notNull(),
  
  // Status
  isActive: boolean("isActive").default(true).notNull(),
  
  // Timestamps
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
  leftAt: timestamp("leftAt"),
  
  // Audit
  invitedBy: uuid("invitedBy"),
},
(table) => ({
  groupFkey: foreignKey({
    columns: [table.groupId],
    foreignColumns: [groups.id],
    name: "GroupMember_groupId_fkey"
  }).onDelete("cascade"),
  userFkey: foreignKey({
    columns: [table.userId],
    foreignColumns: [user.id],
    name: "GroupMember_userId_fkey"
  }).onDelete("cascade"),
  invitedByFkey: foreignKey({
    columns: [table.invitedBy],
    foreignColumns: [user.id],
    name: "GroupMember_invitedBy_fkey"
  }).onDelete("set null"),
}));

/**
 * RELATIONS
 */
export const teamRelations = relations(teams, ({ one, many }) => ({
  department: one(departments, {
    fields: [teams.departmentId],
    references: [departments.id],
    relationName: 'department_teams',
  }),
  leader: one(user, {
    fields: [teams.leaderId],
    references: [user.id],
    relationName: 'team_leader',
  }),
  members: many(userTeams, {
    relationName: 'team_members',
  }),
}));

export const userTeamRelations = relations(userTeams, ({ one }) => ({
  user: one(user, {
    fields: [userTeams.userId],
    references: [user.id],
    relationName: 'user_teams',
  }),
  team: one(teams, {
    fields: [userTeams.teamId],
    references: [teams.id],
    relationName: 'team_members',
  }),
  invitedByUser: one(user, {
    fields: [userTeams.invitedBy],
    references: [user.id],
    relationName: 'user_team_inviter',
  }),
}));

export const groupRelations = relations(groups, ({ one, many }) => ({
  owner: one(user, {
    fields: [groups.ownerId],
    references: [user.id],
    relationName: 'group_owner',
  }),
  department: one(departments, {
    fields: [groups.departmentId],
    references: [departments.id],
    relationName: 'department_groups',
  }),
  members: many(groupMembers, {
    relationName: 'group_members',
  }),
}));

export const groupMemberRelations = relations(groupMembers, ({ one }) => ({
  group: one(groups, {
    fields: [groupMembers.groupId],
    references: [groups.id],
    relationName: 'group_members',
  }),
  user: one(user, {
    fields: [groupMembers.userId],
    references: [user.id],
    relationName: 'user_groups',
  }),
  invitedByUser: one(user, {
    fields: [groupMembers.invitedBy],
    references: [user.id],
    relationName: 'user_group_inviter',
  }),
}));

/**
 * TYPES
 */
export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;

export type UserTeam = typeof userTeams.$inferSelect;
export type NewUserTeam = typeof userTeams.$inferInsert;

export type Group = typeof groups.$inferSelect;
export type NewGroup = typeof groups.$inferInsert;

export type GroupMember = typeof groupMembers.$inferSelect;
export type NewGroupMember = typeof groupMembers.$inferInsert;

/**
 * HELPER TYPES
 */
export type TeamWithMembers = Team & {
  members: (UserTeam & {
    user: {
      id: string;
      name: string | null;
      email: string | null;
    };
  })[];
  leader?: {
    id: string;
    name: string | null;
  };
};

export type GroupWithMembers = Group & {
  members: (GroupMember & {
    user: {
      id: string;
      name: string | null;
      email: string | null;
    };
  })[];
  owner: {
    id: string;
    name: string | null;
  };
};

export type UserWithTeamsAndGroups = {
  id: string;
  name: string | null;
  email: string | null;
  teams: (UserTeam & { team: Team })[];
  groups: (GroupMember & { group: Group })[];
};
