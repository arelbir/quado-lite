"use server";

/**
 * MINIO SERVER ACTIONS
 * Server actions for file operations
 */

import { revalidatePath } from "next/cache";
import { handleError } from '@/lib/monitoring/error-handler';
import { z } from "zod";
import { getLatestUser } from "@/features/auth";
import { deleteFile } from "./upload-helpers";

const deleteFileSchema = z.string();

export async function deleteMinioFile(key: z.infer<typeof deleteFileSchema>) {
  const user = await getLatestUser();
  
  if (!user) {
    return {
      error: "Unauthorized",
    };
  }

  const result = deleteFileSchema.safeParse(key);
  if (!result.success) {
    return {
      error: "Invalid params",
    };
  }

  try {
    await deleteFile(result.data);
    revalidatePath("/", "layout");
    revalidatePath("/settings/profile", "page");
    
    return { success: true };
  } catch (error) {
    handleError(error as Error, {
      context: 'delete-file-action',
      fileKey: key,
    });
    return {
      error: "Failed to delete file",
    };
  }
}
