/**
 * TYPE-SAFE QUERY HELPERS
 * 
 * Drizzle ORM'in TypeScript inference limitation'ını aşmak için
 * type-safe query helper'lar. `as any` kullanımına gerek kalmaz.
 * 
 * Pattern: Generic type-safe wrappers
 * Created: 2025-01-26
 * 
 * NOTE: Bu helper'lar relation'ları type-safe olarak fetch eder.
 * Drizzle ORM'in type inference limitation'ı nedeniyle bazı yerlerde
 * intermediate `any` kullanılır ama return type'lar tamamen type-safe.
 */

import { db } from "@/drizzle/db";
import { eq, and, inArray } from "drizzle-orm";
import type { SQL } from "drizzle-orm";

/**
 * Type helper - Drizzle query with clause için
 */
type WithClause = Record<string, boolean | object | any>;

/**
 * ROLE QUERIES - Type-safe helpers
 */
export async function getRoleWithRelations(roleId: string) {
  const [role, permissions, menus, users] = await Promise.all([
    db.query.roles.findFirst({
      where: (roles, { eq }) => eq(roles.id, roleId),
    }),
    db.query.rolePermissions.findMany({
      where: (rolePermissions, { eq }) => eq(rolePermissions.roleId, roleId),
      with: {
        permission: true,
      } as WithClause,
    }),
    db.query.roleMenus.findMany({
      where: (roleMenus, { eq }) => eq(roleMenus.roleId, roleId),
      with: {
        menu: true,
      } as WithClause,
    }),
    db.query.userRoles.findMany({
      where: (userRoles, { eq, and }) => 
        and(
          eq(userRoles.roleId, roleId),
          eq(userRoles.isActive, true)
        ),
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            email: true,
            status: true,
          },
        },
      } as WithClause,
    }),
  ]);

  return {
    ...role,
    permissions,
    menus,
    userRoles: users,
  };
}

/**
 * USER QUERIES - Type-safe helpers
 */
export async function getUserWithRoles(userId: string) {
  const [userRecord, userRolesList] = await Promise.all([
    db.query.user.findFirst({
      where: (user, { eq }) => eq(user.id, userId),
      with: {
        department: {
          columns: {
            id: true,
            name: true,
          },
        },
        position: {
          columns: {
            id: true,
            name: true,
          },
        },
      },
    }),
    db.query.userRoles.findMany({
      where: (userRoles, { eq, and }) => 
        and(
          eq(userRoles.userId, userId),
          eq(userRoles.isActive, true)
        ),
      with: {
        role: true,
      } as WithClause,
    }),
  ]);

  if (!userRecord) {
    return null;
  }

  return {
    ...userRecord,
    userRoles: userRolesList,
  };
}

/**
 * AUDIT QUESTION QUERIES - Type-safe helpers
 */
export async function getAuditQuestionsWithDetails(auditId: string) {
  // 1. Fetch audit questions
  const auditQuestionsData = await db.query.auditQuestions.findMany({
    where: (auditQuestions, { eq }) => eq(auditQuestions.auditId, auditId),
    with: {
      answeredBy: {
        columns: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: (auditQuestions, { asc }) => [asc(auditQuestions.createdAt)],
  });

  if (auditQuestionsData.length === 0) {
    return [];
  }

  // 2. Get unique question IDs
  const questionIds = [...new Set(auditQuestionsData.map(aq => aq.questionId))];

  // 3. Fetch questions
  const questionsData = await db.query.questions.findMany({
    where: (questions, { inArray }) => inArray(questions.id, questionIds),
  });

  // 4. Fetch banks (if any)
  const bankIds = [...new Set(questionsData.map(q => q.bankId).filter(Boolean) as string[])];
  const banksData = bankIds.length > 0 
    ? await db.query.questionBanks.findMany({
        where: (questionBanks, { inArray }) => inArray(questionBanks.id, bankIds),
        columns: {
          id: true,
          name: true,
          category: true,
        },
      })
    : [];

  // 5. Map results
  return auditQuestionsData.map((aq) => {
    const question = questionsData.find(q => q.id === aq.questionId);
    const bank = question?.bankId 
      ? banksData.find(b => b.id === question.bankId) 
      : null;

    return {
      ...aq,
      question: question ? {
        ...question,
        bank,
        checklistOptions: question.checklistOptions
          ? JSON.parse(question.checklistOptions as string)
          : null,
      } : null,
    };
  });
}

/**
 * ACTION QUERIES - Type-safe helpers
 */
export async function getActionWithRelations(actionId: string) {
  const action = await db.query.actions.findFirst({
    where: (actions, { eq }) => eq(actions.id, actionId),
    with: {
      finding: true,
      assignedTo: true,
      manager: true,
      createdBy: true,
    } as WithClause,
  });

  return action;
}

/**
 * DOF QUERIES - Type-safe helpers
 */
export async function getDofWithRelations(dofId: string) {
  const dof = await db.query.dofs.findFirst({
    where: (dofs, { eq }) => eq(dofs.id, dofId),
    with: {
      finding: true,
      createdBy: true,
      manager: true,
    } as WithClause,
  });

  return dof;
}

/**
 * FINDING QUERIES - Type-safe helpers
 */
export async function getFindingWithRelations(findingId: string) {
  const finding = await db.query.findings.findFirst({
    where: (findings, { eq }) => eq(findings.id, findingId),
    with: {
      audit: true,
      createdBy: true,
      assignedTo: true,
    } as WithClause,
  });

  return finding;
}

/**
 * BRANCH QUERIES - Type-safe helpers
 */
export async function getBranchWithCompany(branchId: string) {
  const branch = await db.query.branches.findFirst({
    where: (branches, { eq }) => eq(branches.id, branchId),
    with: {
      company: true,
    } as WithClause,
  });

  return branch;
}

/**
 * COMPANY QUERIES - Type-safe helpers
 */
export async function getCompanyWithBranches(companyId: string) {
  const company = await db.query.companies.findFirst({
    where: (companies, { eq }) => eq(companies.id, companyId),
    with: {
      branches: {
        columns: {
          id: true,
          name: true,
          code: true,
          city: true,
          isActive: true,
        },
      },
    } as WithClause,
  });

  return company;
}

/**
 * GENERIC QUERY BUILDER
 * For future extensibility
 */
export type QueryBuilder<T> = {
  where?: SQL;
  with?: Record<string, boolean | object>;
  orderBy?: SQL[];
  limit?: number;
  offset?: number;
};

/**
 * Type-safe batch query helper
 */
export async function batchQuery<T extends { id: string }>(
  tableName: string,
  ids: string[]
): Promise<T[]> {
  if (ids.length === 0) return [];
  
  const queryTable = (db.query as any)[tableName];
  if (!queryTable) {
    throw new Error(`Table "${tableName}" not found in db.query`);
  }
  
  return queryTable.findMany({
    where: (t: any, { inArray }: any) => inArray(t.id, ids),
  }) as Promise<T[]>;
}
