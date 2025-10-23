"use client";

import { useMemo } from "react";
import { CheckCircle2, Target, FileCheck, AlertCircle } from "lucide-react";
import { TaskCategory, TaskItem, ActionTask, DofTask, ApprovalTask, FindingTask } from "@/types/my-tasks";

/**
 * Separation of Concerns:
 * - Business logic separated from UI
 * - Data transformation logic in one place
 * - Easy to test and maintain
 */

interface RawTaskData {
  actions: any[];
  dofs: any[];
  approvals: {
    actions: any[];
    dofs: any[];
  };
  findings: any[];
}

export function useTaskCategories(data: RawTaskData): TaskCategory[] {
  return useMemo(() => {
    // Transform raw data to TaskItem format
    const actionTasks: ActionTask[] = data.actions.map((action) => ({
      type: "action" as const,
      id: action.id,
      title: action.details,
      description: action.finding?.details
        ? `Bulgu: ${action.finding.details.substring(0, 60)}...`
        : undefined,
      status: action.status,
      link: `/denetim/actions/${action.id}`,
      assignedTo: action.assignedTo,
      finding: action.finding,
      createdAt: action.createdAt,
    }));

    const dofTasks: DofTask[] = data.dofs.map((dof) => ({
      type: "dof" as const,
      id: dof.id,
      title: dof.problemTitle || "DÖF",
      description: dof.finding?.details
        ? dof.finding.details.substring(0, 60) + "..."
        : undefined,
      status: dof.status,
      link: `/denetim/dofs/${dof.id}`,
      problemTitle: dof.problemTitle,
      assignedTo: dof.assignedTo,
      finding: dof.finding,
      createdAt: dof.createdAt,
    }));

    const approvalTasks: ApprovalTask[] = [
      ...data.approvals.actions.map((action) => ({
        type: "approval" as const,
        id: action.id,
        title: action.details,
        description: `Sorumlu: ${action.assignedTo?.name}`,
        status: action.status,
        link: `/denetim/actions/${action.id}`,
        itemType: "action" as const,
        assignedTo: action.assignedTo,
        createdAt: action.createdAt,
      })),
      ...data.approvals.dofs.map((dof) => ({
        type: "approval" as const,
        id: dof.id,
        title: dof.problemTitle || "DÖF",
        description: `Sorumlu: ${dof.assignedTo?.name}`,
        status: dof.status,
        link: `/denetim/dofs/${dof.id}`,
        itemType: "dof" as const,
        assignedTo: dof.assignedTo,
        createdAt: dof.createdAt,
      })),
    ];

    const findingTasks: FindingTask[] = data.findings.map((finding) => ({
      type: "finding" as const,
      id: finding.id,
      title: finding.details,
      description: `Denetim: ${finding.audit?.title}`,
      status: finding.status,
      link: `/denetim/findings/${finding.id}`,
      audit: finding.audit,
      assignedTo: finding.assignedTo,
      createdAt: finding.createdAt,
    }));

    // Create categories
    const categories: TaskCategory[] = [
      {
        id: "actions",
        title: "Aksiyonlarım",
        description: "Üzerime atanmış aksiyonlar",
        icon: CheckCircle2,
        tasks: actionTasks,
        count: actionTasks.length,
        emptyMessage: "Henüz atanmış aksiyon yok",
      },
      {
        id: "dofs",
        title: "DÖF'lerim",
        description: "Sorumlu olduğum CAPA süreçleri",
        icon: Target,
        tasks: dofTasks,
        count: dofTasks.length,
        emptyMessage: "Henüz atanmış DÖF yok",
      },
    ];

    // Add approvals only if there are any
    if (approvalTasks.length > 0) {
      categories.push({
        id: "approvals",
        title: "Onay Bekleyen İşler",
        description: "Yönetici olarak onaylamanız gereken işler",
        icon: FileCheck,
        tasks: approvalTasks,
        count: approvalTasks.length,
        emptyMessage: "Onay bekleyen iş yok",
      });
    }

    // Add findings only if there are any
    if (findingTasks.length > 0) {
      categories.push({
        id: "findings",
        title: "Bulgularım",
        description: "Atanmış açık bulgular",
        icon: AlertCircle,
        tasks: findingTasks,
        count: findingTasks.length,
        emptyMessage: "Atanmış bulgu yok",
      });
    }

    return categories;
  }, [data]);
}
