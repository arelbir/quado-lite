import { NextRequest } from "next/server";
import { currentUser } from "@/lib/auth/server";
import { db } from "@/core/database/client";
import { roles } from "@/core/database/schema";
import { sendSuccess, sendUnauthorized, sendInternalError } from "@/lib/api/response-helpers";
import { log } from "@/lib/monitoring/logger";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    console.log(" [API Roles] Fetching all roles");
    
    // Simple auth check - no permission system needed for dropdown
    const user = await currentUser();
    if (!user) {
      return sendUnauthorized();
    }
    
    // Fetch active roles directly
    const rolesList = await db.query.roles.findMany({
      where: eq(roles.isActive, true),
      orderBy: (roles, { asc }) => [asc(roles.name)],
      columns: {
        id: true,
        name: true,
        code: true,
        description: true,
        category: true,
        isSystem: true,
      },
    });
    
    log.info('Roles list retrieved', { count: rolesList.length });
    return sendSuccess(rolesList, { total: rolesList.length });
  } catch (error: any) {
    log.error('Error fetching roles', error);
    return sendInternalError(error);
  }
}
