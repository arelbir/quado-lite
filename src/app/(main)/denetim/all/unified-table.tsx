import { getAllAudits } from "@/server/data/audit-list";
import { getAuditPlans } from "@/server/actions/audit-plan-actions";
import { UnifiedTableClient } from "./unified-table-client";
import type { UnifiedRecord } from "./columns";

interface UnifiedAuditsTableProps {
  type: "audit" | "plan";
}

export async function UnifiedAuditsTable({ type }: UnifiedAuditsTableProps) {
  const [audits, plans] = await Promise.all([
    getAllAudits(),
    getAuditPlans(),
  ]);

  // Combine all records into unified format
  const allRecords: UnifiedRecord[] = [
    ...plans.map((plan) => ({
      id: plan.id,
      type: "plan" as const,
      title: plan.title,
      description: plan.description,
      date: plan.scheduledDate || plan.createdAt,
      status: plan.status,
      scheduleType: plan.scheduleType,
      auditorId: plan.auditorId, // 🔥 FIX: Denetçi kontrolü için
      createdBy: plan.createdBy,
      template: plan.template,
      createdAudit: plan.createdAudit,
      createdAt: plan.createdAt,
    })),
    ...audits.map((audit) => ({
      id: audit.id,
      type: "audit" as const,
      title: audit.title,
      description: audit.description,
      date: audit.auditDate || audit.createdAt,
      status: "Active" as const,
      createdBy: audit.createdBy,
      createdAt: audit.createdAt,
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Filter by type
  const filteredRecords = allRecords.filter((record) => record.type === type);

  return <UnifiedTableClient data={filteredRecords} type={type} />;
}
