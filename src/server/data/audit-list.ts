"use server";

import { db } from "@/drizzle/db";
import { audits } from "@/drizzle/schema";
import { currentUser } from "@/lib/auth";

/**
 * Tüm denetimleri listeler
 */
export async function getAllAudits() {
  try {
    const user = await currentUser();
    
    if (!user) {
      throw new Error("Unauthorized");
    }

    const auditList = await db.query.audits.findMany({
      with: {
        createdBy: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: (audits, { desc }) => [desc(audits.createdAt)],
    });

    return auditList;
  } catch (error) {
    console.error("Error fetching audits:", error);
    throw error;
  }
}
