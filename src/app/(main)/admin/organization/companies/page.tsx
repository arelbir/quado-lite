/**
 * COMPANY MANAGEMENT PAGE
 * Manage companies in the organization
 * 
 * Features:
 * - Company list (DataTable)
 * - Create/Edit/Delete company
 * - Branch count
 * - Department count
 * 
 * Created: 2025-01-24
 * Week 7-8: Day 4
 */

import { Metadata } from "next";
import { db } from "@/core/database/client";
import { CompaniesTableClient } from "./companies-table-client";
import type { Company } from "@/lib/types";

export const metadata: Metadata = {
  title: "Company Management | Admin",
  description: "Manage companies",
};

export default async function CompaniesPage() {
  // Fetch all companies
  const companiesData = await db.query.companies.findMany({
    orderBy: (companies, { asc }) => [asc(companies.name)],
  });
  const companies: Company[] = companiesData as any;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Companies</h2>
          <p className="text-muted-foreground">
            Manage your companies
          </p>
        </div>
      </div>

      <CompaniesTableClient companies={companies} />
    </div>
  );
}
