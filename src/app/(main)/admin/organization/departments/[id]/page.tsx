import { notFound } from "next/navigation";
import { db } from "@/drizzle/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Building2, User, Hash, Briefcase } from "lucide-react";

export default async function DepartmentDetailPage({ params }: { params: { id: string } }) {
  const department = await db.query.departments.findFirst({
    where: (departments, { eq }) => eq(departments.id, params.id),
  }) as any;

  if (!department) {
    notFound();
  }

  // Get sub-departments
  const subDepartments = await db.query.departments.findMany({
    where: (departments, { eq }) => eq(departments.parentDepartmentId, params.id),
    columns: {
      id: true,
      name: true,
      code: true,
    },
  });

  // Count employees
  const employees = await db.query.user.findMany({
    where: (users, { eq }) => eq(users.departmentId, params.id),
    columns: {
      id: true,
      name: true,
      email: true,
    },
    with: {
      position: {
        columns: {
          name: true,
        },
      },
    },
  });

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{department.name}</h1>
          <p className="text-muted-foreground">Department Details</p>
        </div>
        <Badge className="bg-blue-100 text-blue-800">Active</Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Department Name</label>
              <p className="text-base font-medium">{department.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Code</label>
              <p className="text-base font-medium">{department.code}</p>
            </div>
            {department.costCenter && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Cost Center</label>
                <p className="text-base font-mono">{department.costCenter}</p>
              </div>
            )}
            {department.branch && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Branch</label>
                <p className="text-base">{department.branch.name} ({department.branch.code})</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Hierarchy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Hierarchy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {department.parentDepartment ? (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Parent Department</label>
                <p className="text-base">{department.parentDepartment.name}</p>
                <p className="text-sm text-muted-foreground">{department.parentDepartment.code}</p>
              </div>
            ) : (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Level</label>
                <Badge variant="secondary">Root Department</Badge>
              </div>
            )}
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Sub-Departments</label>
              <p className="text-2xl font-bold">{subDepartments.length}</p>
            </div>

            {department.manager && (
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-1">Department Manager</label>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{department.manager.name}</p>
                    {department.manager.email && (
                      <a href={`mailto:${department.manager.email}`} className="text-sm text-primary hover:underline">
                        {department.manager.email}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Description */}
        {(department as any).description && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{(department as any).description}</p>
            </CardContent>
          </Card>
        )}

        {/* Sub-Departments */}
        {subDepartments.length > 0 && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Sub-Departments
              </CardTitle>
              <CardDescription>{subDepartments.length} sub-department(s)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                {subDepartments.map((dept) => (
                  <Card key={dept.id}>
                    <CardContent className="pt-6">
                      <p className="font-medium">{dept.name}</p>
                      <p className="text-sm text-muted-foreground">{dept.code}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Employees */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Employees
            </CardTitle>
            <CardDescription>{employees.length} employee(s) in this department</CardDescription>
          </CardHeader>
          <CardContent>
            {employees.length > 0 ? (
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {employees.map((emp) => (
                  <Card key={emp.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-2">
                        <User className="h-4 w-4 mt-1 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="font-medium">{emp.name}</p>
                          {emp.position && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                              <Briefcase className="h-3 w-3" />
                              {emp.position.name}
                            </p>
                          )}
                          {emp.email && (
                            <a href={`mailto:${emp.email}`} className="text-xs text-primary hover:underline block mt-1">
                              {emp.email}
                            </a>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No employees assigned to this department</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
