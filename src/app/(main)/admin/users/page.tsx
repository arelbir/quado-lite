/**
 * USER MANAGEMENT PAGE
 * Manage system users
 * 
 * Features:
 * - User list (Advanced DataTable)
 * - Create/Edit/Delete user
 * - Status management
 * - Role assignment
 * - Department/Position filters
 * 
 * Created: 2025-01-24
 * Week 7-8: Day 6
 */

import { Metadata } from "next";
import { db } from "@/core/database/client";
import { user, departments, positions } from "@/core/database/schema";
import { count, or, ilike, sql } from "drizzle-orm";
import { UsersTableClient } from "./users-table-client";
import { paginate, getPaginationInfo } from "@/lib/core/pagination";

export const metadata: Metadata = {
  title: "User Management | Admin",
  description: "Manage system users",
};

interface PageProps {
  searchParams: {
    page?: string
    per_page?: string
    name?: string
    status?: string
  }
}

export default async function UsersPage({ searchParams }: PageProps) {
  const nameFilter = searchParams.name;
  const statusFilter = searchParams.status;
  // Fetch all dropdown data
  const [companiesList, branchesList, departmentsList, positionsList, managersList] = await Promise.all([
    db.query.companies.findMany({
      columns: { id: true, name: true },
      where: (companies, { eq }) => eq(companies.isActive, true),
      orderBy: (companies, { asc }) => [asc(companies.name)],
    }),
    db.query.branches.findMany({
      columns: { id: true, name: true },
      where: (branches, { eq }) => eq(branches.isActive, true),
      orderBy: (branches, { asc }) => [asc(branches.name)],
    }),
    db.query.departments.findMany({
      columns: { id: true, name: true },
      where: (departments, { eq }) => eq(departments.isActive, true),
      orderBy: (departments, { asc }) => [asc(departments.name)],
    }),
    db.query.positions.findMany({
      columns: { id: true, name: true },
      where: (positions, { eq }) => eq(positions.isActive, true),
      orderBy: (positions, { asc }) => [asc(positions.name)],
    }),
    db.query.user.findMany({
      columns: { id: true, name: true, email: true },
      where: (user, { eq, isNull }) => eq(user.status, 'active'),
      orderBy: (user, { asc }) => [asc(user.name)],
    }),
  ]);

  // ✅ SERVER-SIDE PAGINATION WITH FILTERS
  const result = await paginate(
    // Query: Only fetch one page
    async (limit, offset) => {
      // Build where conditions
      const conditions = [];
      
      if (nameFilter) {
        // Search in both name and email (case-insensitive)
        conditions.push(
          or(
            ilike(user.name, `%${nameFilter}%`),
            ilike(user.email, `%${nameFilter}%`)
          )
        );
      }
      
      if (statusFilter) {
        conditions.push(sql`${user.status} = ${statusFilter}`);
      }
      
      return db.query.user.findMany({
        limit,
        offset,
        where: conditions.length > 0 ? sql`${sql.join(conditions, sql` AND `)}` : undefined,
        with: {
          department: {
            columns: {
              id: true,
              name: true,
              code: true,
            },
          },
          position: {
            columns: {
              id: true,
              name: true,
              code: true,
            },
          },
          userRoles: {
            with: {
              role: {
                columns: {
                  id: true,
                  name: true,
                  isSystem: true,
                },
              },
            },
          },
        },
        orderBy: (user, { desc }) => [desc(user.createdAt)],
      });
    },
    // Count: Total users (with filters)
    async () => {
      const conditions = [];
      
      if (nameFilter) {
        conditions.push(
          or(
            ilike(user.name, `%${nameFilter}%`),
            ilike(user.email, `%${nameFilter}%`)
          )
        );
      }
      
      if (statusFilter) {
        conditions.push(sql`${user.status} = ${statusFilter}`);
      }
      
      const result = await db
        .select({ value: count() })
        .from(user)
        .where(conditions.length > 0 ? sql`${sql.join(conditions, sql` AND `)}` : undefined);
      
      return result[0]?.value ?? 0;
    },
    searchParams
  )

  // 🔍 DEBUG: Log fetched users and their IDs
  console.log("🔍 [page.tsx] Users fetched from database:");
  console.log("  Total users:", result.data.length);
  if (result.data.length > 0) {
    console.log("  First 3 users:");
    result.data.slice(0, 3).forEach((u: any) => {
      console.log(`    - ID: ${u.id} | Name: ${u.name} | Email: ${u.email}`);
    });
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Users</h2>
          <p className="text-muted-foreground">
            {getPaginationInfo(result.currentPage, result.perPage, result.totalCount)}
          </p>
        </div>
      </div>

      <UsersTableClient 
        users={result.data as any} 
        companies={companiesList as any}
        branches={branchesList as any}
        departments={departmentsList as any}
        positions={positionsList as any}
        managers={managersList as any}
        pageCount={result.pageCount} 
      />
    </div>
  );
}
