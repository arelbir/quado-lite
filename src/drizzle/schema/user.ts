import { pgTable, timestamp, varchar, integer, uniqueIndex, foreignKey, uuid, type PgTableWithColumns } from "drizzle-orm/pg-core"
import { theme, userStatus } from "./enum";
import { relations } from "drizzle-orm";
import { createInsertSchema } from 'drizzle-zod'
import { userMenuTable } from "./menu";
import { companies, branches, departments, positions } from "./organization";


export const user: PgTableWithColumns<any> = pgTable("User", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	name: varchar("name"),
	email: varchar("email"),
	emailVerified: timestamp("emailVerified"),
	password: varchar("password").notNull(),
	image: varchar("image"),
	theme: theme("theme").default('system'),
	status: userStatus("status").default('active'),
	
	// 🔥 NEW: Organization fields (Week 1 - Enterprise User Management)
	companyId: uuid("companyId"),
	branchId: uuid("branchId"),
	departmentId: uuid("departmentId"),
	positionId: uuid("positionId"),
	managerId: uuid("managerId"), // Direct manager
	employeeNumber: varchar("employeeNumber", { length: 50 }),
	
	// Employment details
	hireDate: timestamp("hireDate"),
	terminationDate: timestamp("terminationDate"),
	employmentType: varchar("employmentType", { length: 50 }), // FullTime, PartTime, Contract, Intern
	workLocation: varchar("workLocation", { length: 50 }), // OnSite, Remote, Hybrid
	
	// Contact
	phoneNumber: varchar("phoneNumber", { length: 50 }),
	mobileNumber: varchar("mobileNumber", { length: 50 }),
	emergencyContact: varchar("emergencyContact", { length: 255 }),
	
	// Locale
	timezone: varchar("timezone", { length: 50 }),
	locale: varchar("locale", { length: 10 }),
	
	createdAt: timestamp("createdAt").defaultNow().notNull(),
	updatedAt: timestamp("updatedAt"),
	deletedAt: timestamp("deletedAt"),
	deletedById: uuid("deletedById"),
	createdById: uuid("createdById"),
},
	(table): Record<string, any> => {
		return {
			emailKey: uniqueIndex("User_email_key").on(table.email),
			employeeNumberKey: uniqueIndex("User_employeeNumber_key").on(table.employeeNumber),
			userCreatedByIdFkey: foreignKey({
				columns: [table.createdById],
				foreignColumns: [table.id],
				name: "User_createdById_fkey"
			}).onUpdate("cascade").onDelete("set null"),
			userDeletedByIdFkey: foreignKey({
				columns: [table.deletedById],
				foreignColumns: [table.id],
				name: "User_deletedById_fkey"
			}).onUpdate("cascade").onDelete("set null"),
			// 🔥 Organization foreign keys
			userCompanyIdFkey: foreignKey({
				columns: [table.companyId],
				foreignColumns: [companies.id],
				name: "User_companyId_fkey"
			}).onUpdate("cascade").onDelete("set null"),
			userBranchIdFkey: foreignKey({
				columns: [table.branchId],
				foreignColumns: [branches.id],
				name: "User_branchId_fkey"
			}).onUpdate("cascade").onDelete("set null"),
			userDepartmentIdFkey: foreignKey({
				columns: [table.departmentId],
				foreignColumns: [departments.id],
				name: "User_departmentId_fkey"
			}).onUpdate("cascade").onDelete("set null"),
			userPositionIdFkey: foreignKey({
				columns: [table.positionId],
				foreignColumns: [positions.id],
				name: "User_positionId_fkey"
			}).onUpdate("cascade").onDelete("set null"),
			userManagerIdFkey: foreignKey({
				columns: [table.managerId],
				foreignColumns: [table.id],
				name: "User_managerId_fkey"
			}).onUpdate("cascade").onDelete("set null"),
		}
	});

export const UserSchema = createInsertSchema(user)

export type User = typeof user.$inferSelect
export type NewUser = typeof user.$inferInsert

export const account = pgTable("Account", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	userId: uuid("userId").notNull().references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" }),
	type: varchar("type").notNull(),
	provider: varchar("provider").notNull(),
	providerAccountId: varchar("providerAccountId").notNull(),
	refreshToken: varchar("refresh_token"),
	accessToken: varchar("access_token"),
	expiresAt: integer("expires_at"),
	tokenType: varchar("token_type"),
	scope: varchar("scope"),
	idToken: varchar("id_token"),
	sessionState: varchar("session_state"),
},
	(table) => {
		return {
			providerProviderAccountIdKey: uniqueIndex("Account_provider_providerAccountId_key").on(table.provider, table.providerAccountId),
		}
	});


export const session = pgTable("Session", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	sessionToken: varchar("sessionToken").notNull(),
	userId: uuid("userId").notNull().references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" }),
	expires: timestamp("expires").notNull(),
},
	(table) => {
		return {
			sessionTokenKey: uniqueIndex("Session_sessionToken_key").on(table.sessionToken),
		}
	});


export const userRelation = relations(user, ({ one, many }) => ({
	// role: one(role, {...}), // ❌ LEGACY - Removed. Use userRoles instead.
	createdBy: one(user, {
		fields: [user.createdById],
		references: [user.id],
		relationName: 'user_createdBy',
	}),
	deletedBy: one(user, {
		fields: [user.deletedById],
		references: [user.id],
		relationName: 'user_deletedBy',
	}),
	accounts: many(account, {
		relationName: 'user_accounts',
	}),
	session: many(session, {
		relationName: 'user_sessions',
	}),
	createdUsers: many(user, {
		relationName: 'user_createdBy',
	}),
	menus: many(userMenuTable, {
		relationName: 'user_menu_u',
	}),
	// 🔥 NEW: Organization Relations
	company: one(companies, {
		fields: [user.companyId],
		references: [companies.id],
		relationName: 'user_company',
	}),
	branch: one(branches, {
		fields: [user.branchId],
		references: [branches.id],
		relationName: 'user_branch',
	}),
	department: one(departments, {
		fields: [user.departmentId],
		references: [departments.id],
		relationName: 'user_department',
	}),
	position: one(positions, {
		fields: [user.positionId],
		references: [positions.id],
		relationName: 'user_position',
	}),
	manager: one(user, {
		fields: [user.managerId],
		references: [user.id],
		relationName: 'user_manager',
	}),
	directReports: many(user, {
		relationName: 'user_manager', // Users reporting to this user
	}),
	// ℹ️ MANY relations removed to avoid circular dependencies
	// They are defined in their respective schema files:
	// - audit.ts, finding.ts, action.ts, dof.ts
	// - role-system.ts, teams-groups.ts, workflow.ts
}))

export const accountRelation = relations(account, ({ one }) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id],
		relationName: 'user_accounts'
	}),
}))

export const sessionRelation = relations(session, ({ one }) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id],
		relationName: 'user_sessions'
	}),
}))
