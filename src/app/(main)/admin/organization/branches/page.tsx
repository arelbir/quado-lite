/**
 * BRANCHES PAGE
 * Branch management for organization
 * 
 * Features:
 * - List all branches
 * - Filter by type, status
 * - View manager assignments
 * - Department count
 * 
 * Created: 2025-01-24
 * Week 7-8: HR Module Completion
 */

import { db } from "@/core/database/client";
import { BranchesTableClient } from "./branches-table-client";
import type { BranchWithRelations, Company } from "@/lib/types";

export default async function BranchesPage() {
  // Fetch all branches with manager and department count
  const [branches, companiesRaw] = await Promise.all([
    db.query.branches.findMany({
      with: {
        manager: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
        departments: {
          columns: {
            id: true,
          },
        },
      } as any,
      orderBy: (branches, { asc }) => [asc(branches.name)],
    }),
    db.query.companies.findMany({
      columns: {
        id: true,
        name: true,
        code: true,
      },
      orderBy: (companies, { asc }) => [asc(companies.name)],
    }),
  ]);

  const companies: Pick<Company, 'id' | 'name' | 'code'>[] = companiesRaw;

  // Transform data for client component
  const branchesWithCount = branches.map((branch: any) => ({
    ...branch,
    type: branch.type || "Branch", // Ensure type is not null
    _count: {
      departments: branch.departments?.length || 0,
    },
  })) as BranchWithRelations[];

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Branches</h1>
          <p className="text-muted-foreground">
            Manage branch offices and locations across your organization
          </p>
        </div>
      </div>

      <BranchesTableClient branches={branchesWithCount} companies={companies} />
    </div>
  );
}
