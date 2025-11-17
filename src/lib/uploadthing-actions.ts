"use server"

import { utapi } from "@/config/uploadthing"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { getLatestUser } from "@/features/auth";

const uploadthingDeleteFilesSchema = z.string()

export const deleteUploadthingFiles = async (params: z.infer<typeof uploadthingDeleteFilesSchema>) => {
  const result = uploadthingDeleteFilesSchema.safeParse(params)
  if (!result.success) {
    return {
      error: "Invalid params"
    }
  }
 
  const res = await utapi.deleteFiles(result.data)
  // Note: updateProfile needs to be called separately after file deletion
  revalidatePath("/", "layout")
  revalidatePath("/settings/profile", "page")
  return res
}
