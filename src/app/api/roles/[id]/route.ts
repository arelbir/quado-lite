import { NextRequest } from "next/server";
import { getRoleById } from "@/features/roles/actions/role-actions";
import { sendSuccess, sendNotFound, sendInternalError } from "@/lib/api/response-helpers";
import { log } from "@/lib/monitoring/logger";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    console.log(" [API Roles] Fetching ID:", id);
    
    const result = await getRoleById(id);
    
    if (!result.success || !result.data) {
      log.warn('Role not found', { roleId: id });
      return sendNotFound('Role');
    }
    
    log.info('Role retrieved', { roleId: id, roleName: result.data.name });
    return sendSuccess(result.data);
  } catch (error) {
    log.error('Error getting role', error as Error);
    return sendInternalError(error);
  }
}
