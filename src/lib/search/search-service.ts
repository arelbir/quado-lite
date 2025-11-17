/**
 * ADVANCED SEARCH SERVICE
 * Global search across multiple entity types
 */

import { db } from '@/core/database/client';
import { user } from '@/core/database/schema/user';
import { teams, groups } from '@/core/database/schema/teams-groups';
import { visualWorkflow } from '@/core/database/schema/workflow-definition';
import { departments } from '@/core/database/schema/organization';
import { ilike, or, and, sql } from 'drizzle-orm';

export type SearchEntityType = 'user' | 'team' | 'group' | 'workflow' | 'department' | 'all';

export interface SearchResult {
  id: string;
  type: SearchEntityType;
  title: string;
  subtitle?: string;
  description?: string;
  url: string;
  icon: string;
  metadata?: Record<string, any>;
}

export interface SearchOptions {
  query: string;
  types?: SearchEntityType[];
  limit?: number;
  includeInactive?: boolean;
}

/**
 * Global search across all entities
 */
export async function globalSearch(options: SearchOptions): Promise<SearchResult[]> {
  const { query, types = ['all'], limit = 20, includeInactive = false } = options;
  
  if (!query || query.trim().length < 2) {
    return [];
  }

  const searchTerm = `%${query.trim()}%`;
  const results: SearchResult[] = [];

  try {
    // Search Users
    if (types.includes('all') || types.includes('user')) {
      const users = await db
        .select({
          id: user.id,
          name: user.name,
          email: user.email,
          isActive: user.isActive,
        })
        .from(user)
        .where(
          and(
            or(
              ilike(user.name, searchTerm),
              ilike(user.email, searchTerm)
            ),
            includeInactive ? undefined : sql`${user.isActive} = true`
          )
        )
        .limit(limit);

      results.push(
        ...users.map((u) => ({
          id: u.id,
          type: 'user' as SearchEntityType,
          title: u.name || 'Unknown',
          subtitle: u.email || '',
          url: `/admin/users/${u.id}`,
          icon: 'User',
          metadata: { isActive: u.isActive },
        }))
      );
    }

    // Search Teams
    if (types.includes('all') || types.includes('team')) {
      const teamsResult = await db
        .select({
          id: teams.id,
          name: teams.name,
          code: teams.code,
          description: teams.description,
          type: teams.type,
          isActive: teams.isActive,
        })
        .from(teams)
        .where(
          and(
            or(
              ilike(teams.name, searchTerm),
              ilike(teams.code, searchTerm),
              ilike(teams.description, searchTerm)
            ),
            includeInactive ? undefined : sql`${teams.isActive} = true`
          )
        )
        .limit(limit);

      results.push(
        ...teamsResult.map((t) => ({
          id: t.id,
          type: 'team' as SearchEntityType,
          title: t.name,
          subtitle: `${t.code} • ${t.type}`,
          description: t.description || undefined,
          url: `/admin/teams/${t.id}`,
          icon: 'Users',
          metadata: { type: t.type, isActive: t.isActive },
        }))
      );
    }

    // Search Groups
    if (types.includes('all') || types.includes('group')) {
      const groupsResult = await db
        .select({
          id: groups.id,
          name: groups.name,
          code: groups.code,
          description: groups.description,
          type: groups.type,
          visibility: groups.visibility,
          isActive: groups.isActive,
        })
        .from(groups)
        .where(
          and(
            or(
              ilike(groups.name, searchTerm),
              ilike(groups.code, searchTerm),
              ilike(groups.description, searchTerm)
            ),
            includeInactive ? undefined : sql`${groups.isActive} = true`
          )
        )
        .limit(limit);

      results.push(
        ...groupsResult.map((g) => ({
          id: g.id,
          type: 'group' as SearchEntityType,
          title: g.name,
          subtitle: `${g.code} • ${g.type}`,
          description: g.description || undefined,
          url: `/admin/groups/${g.id}`,
          icon: 'Users2',
          metadata: { type: g.type, visibility: g.visibility, isActive: g.isActive },
        }))
      );
    }

    // Search Workflows
    if (types.includes('all') || types.includes('workflow')) {
      const workflows = await db
        .select({
          id: visualWorkflow.id,
          name: visualWorkflow.name,
          description: visualWorkflow.description,
          module: visualWorkflow.module,
          status: visualWorkflow.status,
        })
        .from(visualWorkflow)
        .where(
          or(
            ilike(visualWorkflow.name, searchTerm),
            ilike(visualWorkflow.description, searchTerm)
          )
        )
        .limit(limit);

      results.push(
        ...workflows.map((w) => ({
          id: w.id,
          type: 'workflow' as SearchEntityType,
          title: w.name,
          subtitle: `${w.module} • ${w.status}`,
          description: w.description || undefined,
          url: `/admin/workflows/${w.id}`,
          icon: 'Workflow',
          metadata: { module: w.module, status: w.status },
        }))
      );
    }

    // Search Departments
    if (types.includes('all') || types.includes('department')) {
      const depts = await db
        .select({
          id: departments.id,
          name: departments.name,
          code: departments.code,
          description: departments.description,
          isActive: departments.isActive,
        })
        .from(departments)
        .where(
          and(
            or(
              ilike(departments.name, searchTerm),
              ilike(departments.code, searchTerm),
              ilike(departments.description, searchTerm)
            ),
            includeInactive ? undefined : sql`${departments.isActive} = true`
          )
        )
        .limit(limit);

      results.push(
        ...depts.map((d) => ({
          id: d.id,
          type: 'department' as SearchEntityType,
          title: d.name,
          subtitle: d.code,
          description: d.description || undefined,
          url: `/admin/departments/${d.id}`,
          icon: 'Building',
          metadata: { isActive: d.isActive },
        }))
      );
    }

    return results.slice(0, limit);
  } catch (error) {
    console.error('[Search] Error:', error);
    return [];
  }
}

/**
 * Search suggestions (autocomplete)
 */
export async function searchSuggestions(
  query: string,
  type?: SearchEntityType
): Promise<string[]> {
  if (!query || query.length < 2) {
    return [];
  }

  const results = await globalSearch({ query, types: type ? [type] : ['all'], limit: 5 });
  return results.map((r) => r.title);
}

/**
 * Recent searches (can be stored in localStorage)
 */
export function saveRecentSearch(query: string): void {
  if (typeof window === 'undefined') return;

  try {
    const recent = getRecentSearches();
    const updated = [query, ...recent.filter((q) => q !== query)].slice(0, 10);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  } catch (error) {
    console.error('[Search] Failed to save recent search:', error);
  }
}

export function getRecentSearches(): string[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem('recentSearches');
    return stored ? (JSON.parse(stored) as string[]) : [];
  } catch (error) {
    return [];
  }
}

export function clearRecentSearches(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('recentSearches');
}
