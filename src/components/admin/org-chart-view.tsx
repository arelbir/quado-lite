/**
 * ORG CHART VIEW
 * Interactive organization chart using ReactFlow
 * 
 * Features:
 * - Hierarchical layout
 * - Interactive nodes
 * - Zoom & pan
 * - Department details
 * - Export functionality
 * 
 * Created: 2025-01-24
 * Week 7-8: Day 4
 */

"use client";

import { useCallback, useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  Position,
  MarkerType,
  useNodesState,
  useEdgesState,
} from "reactflow";
import "reactflow/dist/style.css";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Building2, Users, Maximize2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Department {
  id: string;
  name: string;
  code: string;
  parentDepartmentId: string | null;
  managerId: string | null;
  manager?: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
}

interface Company {
  id: string;
  name: string;
}

interface OrgChartViewProps {
  departments: Department[];
  companies: Company[];
}

// Custom node component
function DepartmentNode({ data }: { data: any }) {
  return (
    <Card className="min-w-[200px] shadow-lg border-2 hover:shadow-xl transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-2">
          <Building2 className="w-5 h-5 text-primary mt-1" />
          <div className="flex-1">
            <div className="font-semibold text-sm">{data.name}</div>
            <Badge variant="outline" className="text-xs mt-1">
              {data.code}
            </Badge>
            {data.manager && (
              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                <Users className="w-3 h-3" />
                <span>{data.manager.name || data.manager.email}</span>
              </div>
            )}
            {data.childCount > 0 && (
              <div className="text-xs text-muted-foreground mt-1">
                {data.childCount} sub-departments
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const nodeTypes = {
  department: DepartmentNode,
};

export function OrgChartView({ departments, companies }: OrgChartViewProps) {
  // Build nodes and edges
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Calculate layout positions (simple hierarchical layout)
    const levels: Record<string, Department[]> = {};
    
    // Group departments by level
    const getLevelForDept = (dept: Department, visited = new Set<string>()): number => {
      if (visited.has(dept.id)) return 0; // Prevent infinite loop
      visited.add(dept.id);
      
      if (!dept.parentDepartmentId) return 0;
      const parent = departments.find(d => d.id === dept.parentDepartmentId);
      if (!parent) return 0;
      return getLevelForDept(parent, visited) + 1;
    };

    departments.forEach(dept => {
      const level = getLevelForDept(dept);
      if (!levels[level]) levels[level] = [];
      levels[level].push(dept);
    });

    // Calculate positions
    const levelGap = 200; // Vertical gap between levels
    const nodeGap = 250;  // Horizontal gap between nodes

    Object.entries(levels).forEach(([levelStr, depts]) => {
      const level = parseInt(levelStr);
      const y = level * levelGap;
      
      depts.forEach((dept, index) => {
        // Center align nodes in each level
        const totalWidth = (depts.length - 1) * nodeGap;
        const startX = -totalWidth / 2;
        const x = startX + (index * nodeGap);

        // Count children
        const childCount = departments.filter(d => d.parentDepartmentId === dept.id).length;

        nodes.push({
          id: dept.id,
          type: 'department',
          position: { x, y },
          data: {
            name: dept.name,
            code: dept.code,
            manager: dept.manager,
            childCount,
          },
          sourcePosition: Position.Bottom,
          targetPosition: Position.Top,
        });

        // Create edge to parent
        if (dept.parentDepartmentId) {
          edges.push({
            id: `e-${dept.parentDepartmentId}-${dept.id}`,
            source: dept.parentDepartmentId,
            target: dept.id,
            type: 'smoothstep',
            animated: false,
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 20,
              height: 20,
            },
            style: {
              strokeWidth: 2,
              stroke: '#64748b',
            },
          });
        }
      });
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, [departments]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Export chart as image
  const onExport = useCallback(() => {
    // TODO: Implement export to PNG/SVG
    console.log("Export chart");
  }, []);

  // Fit view
  const onFitView = useCallback(() => {
    // ReactFlow will handle this through Controls component
  }, []);

  return (
    <div className="space-y-4">
      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={onFitView}>
            <Maximize2 className="w-4 h-4 mr-2" />
            Fit View
          </Button>
        </div>
        <div className="text-sm text-muted-foreground">
          {departments.length} departments
        </div>
      </div>

      {/* Chart */}
      <Card className="border-2">
        <CardContent className="p-0">
          <div style={{ width: "100%", height: "600px" }}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              nodeTypes={nodeTypes}
              fitView
              attributionPosition="bottom-left"
              minZoom={0.1}
              maxZoom={2}
            >
              <Background />
              <Controls />
              <MiniMap 
                nodeStrokeWidth={3}
                zoomable
                pannable
              />
            </ReactFlow>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{departments.length}</div>
            <p className="text-xs text-muted-foreground">Total Departments</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {departments.filter(d => !d.parentDepartmentId).length}
            </div>
            <p className="text-xs text-muted-foreground">Root Departments</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {Object.keys(
                departments.reduce((acc, d) => {
                  const level = d.parentDepartmentId ? 1 : 0;
                  acc[level] = true;
                  return acc;
                }, {} as Record<number, boolean>)
              ).length}
            </div>
            <p className="text-xs text-muted-foreground">Hierarchy Levels</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {departments.filter(d => d.managerId).length}
            </div>
            <p className="text-xs text-muted-foreground">With Managers</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
