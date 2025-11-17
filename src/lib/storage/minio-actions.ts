"use server";

/**
 * MINIO SERVER ACTIONS
 * Server actions for file operations
 */

import { revalidatePath } from "next/cache";
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
    console.error('Error deleting file:', error);
    return {
      error: "Failed to delete file",
    };
  }
}
