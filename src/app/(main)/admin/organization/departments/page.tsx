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
import { db } from "@/core/database/client";
import { departments, branches, user } from "@/core/database/schema";
import { eq } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, BarChart3, FolderTree } from "lucide-react";
import { DepartmentsTableClient } from "./departments-table-client";

export const metadata: Metadata = {
  title: "Department Management | Admin",
  description: "Manage organizational departments",
};

export default async function DepartmentsPage() {
  // Fetch all departments with relations
  const [allDepartments, allBranches, activeUsers] = await Promise.all([
    db.query.departments.findMany({
      with: {
        branch: {
          columns: {
            id: true,
            name: true,
          },
        },
        parent: {
          columns: {
            id: true,
            name: true,
          },
        },
        manager: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
      } as any,
      orderBy: (departments, { asc }) => [asc(departments.name)],
    }),
    db.query.branches.findMany({
      columns: {
        id: true,
        name: true,
        code: true,
      },
      where: eq(branches.isActive, true),
      orderBy: (branches, { asc }) => [asc(branches.name)],
    }),
    db.query.user.findMany({
      columns: {
        id: true,
        name: true,
        email: true,
      },
      where: eq(user.status, 'active'),
      orderBy: (user, { asc }) => [asc(user.name)],
    }),
  ]);

  // Calculate statistics
  const totalDepartments = allDepartments.length;
  const activeDepartments = allDepartments.filter(d => d.isActive).length;
  const rootDepartments = allDepartments.filter(d => !d.parentDepartmentId).length;
  const departmentsWithManager = allDepartments.filter(d => d.managerId).length;

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

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Departments
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDepartments}</div>
            <p className="text-xs text-muted-foreground">
              Across all levels
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Departments
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeDepartments}</div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Root Departments
            </CardTitle>
            <FolderTree className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rootDepartments}</div>
            <p className="text-xs text-muted-foreground">
              Top-level units
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              With Managers
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departmentsWithManager}</div>
            <p className="text-xs text-muted-foreground">
              {((departmentsWithManager / totalDepartments) * 100).toFixed(0)}% coverage
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Departments Data Table */}
      <DepartmentsTableClient 
        data={allDepartments as any} 
        branches={allBranches as any}
        users={activeUsers as any} 
      />
    </div>
  );
}
