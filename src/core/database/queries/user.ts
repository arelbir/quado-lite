import { db } from "@/core/database/client";
import { format, toDate } from "date-fns"
import { eq, inArray, isNotNull } from "drizzle-orm";
import { user, Theme, UserStatus, userMenuTable } from "@/core/database/schema";
import { userRoles as userRolesTable } from "@/core/database/schema/role-system";
import { currentUser } from "@/lib/auth/server";
import to from "@/lib/utils/cn";
import { SignupSchema } from "@/schema/auth";
import { z } from "zod";
import { env } from "@/env";


export interface MonthCount {
  month: string;
  count: number;
}


export const getUsers = async () => {
  const res = await db.query.user.findMany({
    where: isNotNull(user.emailVerified),
    columns: {
      createdAt: true,
    }
  })
  const result: Record<string, MonthCount[]> = {};
  res.forEach(user => {
    const date = toDate(user.createdAt)

    const year = format(date, 'yyyy')
    const month = format(date, 'MMMM')

    if (!result[year]) {
      result[year] = [];
    }
    const monthCount = result[year]?.find(mc => mc.month === month);
    if (monthCount) {
      monthCount.count++;
    } else {
      result[year]?.push({ month, count: 1 });
    }
  })
  return result
}

export const getUserByEmail = async (email: string) => {
  try {
    const res = await db.query.user.findFirst({
      with: {
        department: true,
        position: true,
      },
      where: eq(user.email, email)
    })
    return res
  } catch (error) {
    console.log('error', error)
  }
}

export const getUserById = async (id: string) => {
  try {
    const users = await db.query.user.findFirst({
      with: {
        department: true,
        position: true,
        company: true,
        branch: true,
        userRoles: {
          with: {
            role: true,
          },
        },
      },
      where: eq(user.id, id)
    })

    return users;
  } catch {
    return null;
  }
};

export const updateUser = async (id: string, data: { status?: UserStatus, name?: string; email?: string; image?: string, theme?: Theme }) => {
  try {
    return await db.update(user).set(data).where(eq(user.id, id)).returning({ id: user.id })
  } catch (error) {
    return null
  }
}

export const updateUserPassword = async (email: string, data: { password?: string }) => {
  try {
    return await db.update(user).set(data).where(eq(user.email, email)).returning({ id: user.id })
  } catch (error) {
    return null
  }
}

export const updateUserEmail = async (id: string, email: string) => {
  try {
    return await db.update(user).set({ email, emailVerified: new Date() }).where(eq(user.id, id)).returning({ id: user.id })
  } catch (error) {
    return null
  }

}

export const deleteUserById = async (id: string) => {
  const userinfo = await currentUser()
  return to(db.update(user).set({
    deletedAt: new Date(),
    deletedById: userinfo?.id
  }).where(eq(user!.id, id)).returning({ id: user.id }))
}

export const deleteUsersByIds = async (ids: string[]) => {
  const userinfo = await currentUser()
  return to(db.update(user).set({
    deletedAt: new Date(),
    deletedById: userinfo?.id
  }).where(inArray(user.id, ids)).returning({ id: user.id }))
}

// ❌ REMOVED: createUser() and createUserByAdmin() - Use user-actions.ts instead with proper role assignment
