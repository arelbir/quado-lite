/**
 * POSITION MANAGEMENT PAGE
 * Job positions and career levels management
 * 
 * Features:
 * - Position list (DataTable)
 * - Create/Edit/Delete position
 * - Career level visualization
 * - Department filter
 * 
 * Created: 2025-01-24
 * Week 7-8: Day 3
 */

import { Metadata } from "next";
import { db } from "@/core/database/client";
import { PositionsTableClient } from "./positions-table-client";
import type { Position } from "@/types/domain";

export const metadata: Metadata = {
  title: "Position Management | Admin",
  description: "Manage job positions and career levels",
};

export default async function PositionsPage() {
  // Fetch all positions
  const positions = await db.query.positions.findMany({
    orderBy: (positions, { asc }) => [asc(positions.level), asc(positions.name)],
  }) as Position[];

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Positions</h2>
          <p className="text-muted-foreground">
            Manage job positions and career levels
          </p>
        </div>
      </div>

      <PositionsTableClient positions={positions} />
    </div>
  );
}
