import { NextRequest } from "next/server";
import { getUserById } from "@/features/users/actions/user-actions";
import { sendSuccess, sendNotFound, sendInternalError } from "@/lib/api/response-helpers";
import { log } from "@/lib/monitoring/logger";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const result = await getUserById(id);

    if (!result.success || !result.data) {
      log.warn("User not found", { userId: id });
      return sendNotFound("User");
    }

    log.info("User retrieved", { userId: id, userName: result.data.name });
    
    return sendSuccess(result.data);
  } catch (error) {
    log.error("Error getting user", error as Error);
    return sendInternalError(error);
  }
}
