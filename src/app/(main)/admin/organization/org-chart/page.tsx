/**
 * ORG CHART PAGE
 * Visual organization hierarchy chart
 * 
 * Features:
 * - Interactive org chart
 * - Zoom & pan
 * - Department nodes
 * - Manager relationships
 * - Export to image
 * 
 * Created: 2025-01-24
 * Week 7-8: Day 4
 */

import { Metadata } from "next";
import { db } from "@/drizzle/db";
import { OrgChartView } from "@/components/admin/org-chart-view";

export const metadata: Metadata = {
  title: "Organization Chart | Admin",
  description: "Visual organization hierarchy",
};

export default async function OrgChartPage() {
  // Fetch departments with manager info
  const departments = await db.query.departments.findMany({
    with: {
      manager: {
        columns: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  // Fetch companies and branches for context
  const companies = await db.query.companies.findMany({
    columns: {
      id: true,
      name: true,
    },
  });

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Organization Chart</h2>
          <p className="text-muted-foreground">
            Visual representation of your organization hierarchy
          </p>
        </div>
      </div>

      <OrgChartView departments={departments} companies={companies} />
    </div>
  );
}
