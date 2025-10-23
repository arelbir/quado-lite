/**
 * REPORT ACTIONS
 * Server actions for generating and downloading reports
 */

"use server";

import { withAuth } from "@/lib/helpers";
import type { User } from "@/lib/types";
import { generateAuditReport } from "@/lib/reporting/templates/audit-report";
import { generateActionReport } from "@/lib/reporting/templates/action-report";
import { generateDofReport } from "@/lib/reporting/templates/dof-report";

/**
 * Download Audit Report
 * 
 * @param auditId - Audit ID
 * @param format - Export format (excel or pdf)
 * @returns Base64 encoded report file
 */
export async function downloadAuditReport(
  auditId: string,
  format: "excel" | "pdf" = "excel"
): Promise<string> {
  const result = await withAuth<string>(async (user: User) => {
    try {
      const buffer = await generateAuditReport(auditId, format);
      // Convert Buffer to base64 for client transfer
      const base64 = buffer.toString('base64');
      return { success: true, data: base64 };
    } catch (error) {
      console.error('Report generation error:', error);
      throw error;
    }
  });

  if (!result.success) {
    throw new Error(result.error);
  }

  return result.data!;
}

/**
 * Download Action Report
 * 
 * @param actionId - Action ID
 * @param format - Export format (excel or pdf)
 * @returns Base64 encoded report file
 */
export async function downloadActionReport(
  actionId: string,
  format: "excel" | "pdf" = "excel"
): Promise<string> {
  const result = await withAuth<string>(async (user: User) => {
    const buffer = await generateActionReport(actionId, format);
    // Convert Buffer to base64 for client transfer
    const base64 = buffer.toString('base64');
    return { success: true, data: base64 };
  });

  if (!result.success) {
    throw new Error(result.error);
  }

  return result.data!;
}

/**
 * Download DOF Report
 * 
 * @param dofId - DOF ID
 * @param format - Export format (excel or pdf)
 * @returns Base64 encoded report file
 */
export async function downloadDofReport(
  dofId: string,
  format: "excel" | "pdf" = "excel"
): Promise<string> {
  const result = await withAuth<string>(async (user: User) => {
    const buffer = await generateDofReport(dofId, format);
    // Convert Buffer to base64 for client transfer
    const base64 = buffer.toString('base64');
    return { success: true, data: base64 };
  });

  if (!result.success) {
    throw new Error(result.error);
  }

  return result.data!;
}

/**
 * Download Findings Report
 * TODO: Refactor from export-actions.ts
 */
export async function downloadFindingsReport(
  format: "excel" | "pdf" = "excel"
): Promise<Buffer> {
  // Placeholder - refactor from export-actions.ts
  return Buffer.from("");
}
