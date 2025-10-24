/**
 * DEPARTMENT MANAGEMENT PAGE
 * Organization hierarchy management
 * 
 * Features:
 * - Department tree view
 * - Create/Edit/Delete department
 * - Nested departments support
 * - Manager assignment
 * 
 * Created: 2025-01-24
 * Week 7-8: Day 3
 */

import { Metadata } from "next";
import { db } from "@/drizzle/db";
import { departments } from "@/drizzle/schema";
import { DepartmentTreeClient } from "@/components/admin/department-tree-client";

export const metadata: Metadata = {
  title: "Department Management | Admin",
  description: "Manage organization departments",
};

export default async function DepartmentsPage() {
  // Fetch all departments with relations
  const allDepartments = await db.query.departments.findMany({
    with: {
      manager: {
        columns: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: (departments, { asc }) => [asc(departments.name)],
  });

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Departments</h2>
          <p className="text-muted-foreground">
            Manage your organization&apos;s department hierarchy
          </p>
        </div>
      </div>

      <DepartmentTreeClient departments={allDepartments} />
    </div>
  );
}
