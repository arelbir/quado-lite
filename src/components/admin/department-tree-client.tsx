/**
 * DEPARTMENT TREE CLIENT
 * Interactive department hierarchy tree view
 * 
 * Features:
 * - Tree visualization
 * - Expand/collapse nodes
 * - Create/Edit/Delete
 * - Drag & drop (future)
 * 
 * Created: 2025-01-24
 * Week 7-8: Day 3
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DepartmentDialog } from "./department-dialog";
import { useRouter } from "next/navigation";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  ChevronRight, 
  ChevronDown, 
  Building2, 
  Edit, 
  Trash2, 
  Plus, 
  Users,
  Eye
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Department {
  id: string;
  name: string;
  code: string;
  parentDepartmentId: string | null;
  managerId: string | null;
  description: string | null;
  costCenter: string | null;
  manager?: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
  parentDepartment?: {
    id: string;
    name: string;
  } | null;
}

interface DepartmentTreeClientProps {
  departments: Department[];
  users: any; // Add type for users
}

export function DepartmentTreeClient({ 
  departments, 
  users 
}: DepartmentTreeClientProps) {
  const router = useRouter();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [parentIdForNew, setParentIdForNew] = useState<string | undefined>(undefined);

  // Build tree structure
  const buildTree = (parentId: string | null = null): Department[] => {
    return departments
      .filter(dept => dept.parentDepartmentId === parentId)
      .sort((a, b) => a.name.localeCompare(b.name));
  };

  // Toggle expand/collapse
  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  // Get children count
  const getChildrenCount = (deptId: string): number => {
    return departments.filter(d => d.parentDepartmentId === deptId).length;
  };

  // Render tree node
  const renderNode = (dept: Department, level: number = 0) => {
    const children = buildTree(dept.id);
    const hasChildren = children.length > 0;
    const isExpanded = expandedIds.has(dept.id);

    return (
      <div key={dept.id} className="select-none">
        {/* Node */}
        <div
          className={cn(
            "group flex items-center gap-2 py-2 px-3 rounded-md hover:bg-accent transition-colors",
            "cursor-pointer"
          )}
          style={{ paddingLeft: `${level * 24 + 12}px` }}
        >
          {/* Expand/Collapse Icon */}
          <div className="w-4 h-4 flex items-center justify-center">
            {hasChildren ? (
              <button
                onClick={() => toggleExpand(dept.id)}
                className="hover:bg-accent rounded p-0.5"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            ) : (
              <div className="w-4 h-4" />
            )}
          </div>

          {/* Department Icon */}
          <Building2 className="w-4 h-4 text-muted-foreground" />

          {/* Department Name */}
          <div className="flex-1 flex items-center gap-2">
            <span className="font-medium">{dept.name}</span>
            <Badge variant="outline" className="text-xs">
              {dept.code}
            </Badge>
            {hasChildren && (
              <Badge variant="secondary" className="text-xs">
                {getChildrenCount(dept.id)} sub-dept
              </Badge>
            )}
          </div>

          {/* Manager */}
          {dept.manager && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Users className="w-3 h-3" />
              <span>{dept.manager.name || dept.manager.email}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/admin/organization/departments/${dept.id}`);
              }}
              title="View Details"
            >
              <Eye className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={(e) => {
                e.stopPropagation();
                setEditingDept(dept);
                setParentIdForNew(undefined);
                setDialogOpen(true);
              }}
            >
              <Edit className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                // TODO: Delete confirmation dialog
                console.log("Delete department:", dept.id);
              }}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={(e) => {
                e.stopPropagation();
                setEditingDept(null);
                setParentIdForNew(dept.id);
                setDialogOpen(true);
              }}
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Children (recursive) */}
        {hasChildren && isExpanded && (
          <div>
            {children.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  // Root departments
  const rootDepartments = buildTree(null);

  return (
    <div className="space-y-4">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              setEditingDept(null);
              setParentIdForNew(undefined);
              setDialogOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Department
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              // Expand all
              const allIds = new Set(departments.map(d => d.id));
              setExpandedIds(allIds);
            }}
          >
            Expand All
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              // Collapse all
              setExpandedIds(new Set());
            }}
          >
            Collapse All
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">
          {departments.length} departments
        </div>
      </div>

      {/* Tree View */}
      <Card>
        <CardHeader>
          <CardTitle>Organization Hierarchy</CardTitle>
          <CardDescription>
            View and manage your department structure
          </CardDescription>
        </CardHeader>
        <CardContent>
          {rootDepartments.length > 0 ? (
            <div className="space-y-1">
              {rootDepartments.map(dept => renderNode(dept, 0))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No departments yet</p>
              <p className="text-sm">Create your first department to get started</p>
            </div>
          )}
        </CardContent>
      </Card>



      {/* Department Dialog */}
      <DepartmentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        department={editingDept}
        parentId={parentIdForNew}
        departments={departments}
        users={users}
        onSuccess={() => window.location.reload()}
      />
    </div>
  );
}
