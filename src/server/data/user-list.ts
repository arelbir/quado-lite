"use server";

import { db } from "@/drizzle/db";
import { user } from "@/drizzle/schema";
import { currentUser } from "@/lib/auth";

/**
 * Tüm aktif kullanıcıları listeler (admin olmayanlara gösterilmez)
 */
export async function getAllUsers() {
  try {
    const currentUserData = await currentUser();
    
    if (!currentUserData) {
      throw new Error("Unauthorized");
    }

    // Tüm kullanıcıları getir (sadece gerekli alanlar)
    const users = await db.query.user.findMany({
      columns: {
        id: true,
        name: true,
        email: true,
      },
      where: (user, { isNull }) => isNull(user.deletedAt),
      orderBy: (user, { asc }) => [asc(user.name)],
    });

    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}
