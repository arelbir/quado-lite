import { NextRequest } from "next/server";
import { getUserRoles } from "@/features/users/actions/user-actions";
import { sendSuccess, sendInternalError } from "@/lib/api/response-helpers";
import { log } from "@/lib/monitoring/logger";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    console.log("🔍 [API User Roles] Fetching roles for user:", id);
    
    const result = await getUserRoles(id);
    
    if (!result.success) {
      log.warn('Failed to fetch user roles', { userId: id, message: result.message });
      return sendInternalError(result.message);
    }
    
    log.info('User roles retrieved', { userId: id, count: result.data?.length || 0 });
    return sendSuccess(result.data, { total: result.data?.length || 0 });
  } catch (error: any) {
    log.error('Error getting user roles', error);
    return sendInternalError(error);
  }
}
