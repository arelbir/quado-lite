import { notFound } from "next/navigation";
import { db } from "@/drizzle/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Mail, Phone, MapPin, User, Users } from "lucide-react";

export default async function BranchDetailPage({ params }: { params: { id: string } }) {
  const branch = await db.query.branches.findFirst({
    where: (branches, { eq }) => eq(branches.id, params.id),
    with: {
      company: {
        columns: {
          id: true,
          name: true,
          code: true,
        },
      },
      manager: {
        columns: {
          id: true,
          name: true,
          email: true,
        },
      },
      departments: {
        columns: {
          id: true,
          name: true,
          code: true,
        },
      },
    },
  });

  if (!branch) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{branch.name}</h1>
          <p className="text-muted-foreground">Branch Details</p>
        </div>
        <Badge className={branch.isActive ? "bg-green-100 text-green-800" : ""} variant={branch.isActive ? "default" : "secondary"}>
          {branch.isActive ? "Active" : "Inactive"}
        </Badge>
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
              <label className="text-sm font-medium text-muted-foreground">Branch Name</label>
              <p className="text-base font-medium">{branch.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Code</label>
              <p className="text-base font-medium">{branch.code}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Type</label>
              <Badge variant="outline">{branch.type || "-"}</Badge>
            </div>
            {branch.company && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Company</label>
                <p className="text-base">{branch.company.name} ({branch.company.code})</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact & Location */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Contact & Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(branch.city || branch.country) && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{[branch.city, branch.country].filter(Boolean).join(", ")}</span>
              </div>
            )}
            {branch.address && (
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-1">Address</label>
                <p className="text-sm">{branch.address}</p>
              </div>
            )}
            {(branch as any).email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${(branch as any).email}`} className="text-primary hover:underline">
                  {(branch as any).email}
                </a>
              </div>
            )}
            {branch.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a href={`tel:${branch.phone}`} className="hover:underline">
                  {branch.phone}
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Manager */}
        {branch.manager && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Branch Manager
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="font-medium">{branch.manager.name}</p>
              {branch.manager.email && (
                <a href={`mailto:${branch.manager.email}`} className="text-sm text-primary hover:underline">
                  {branch.manager.email}
                </a>
              )}
            </CardContent>
          </Card>
        )}

        {/* Description */}
        {(branch as any).description && (
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{(branch as any).description}</p>
            </CardContent>
          </Card>
        )}

        {/* Departments */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Departments
            </CardTitle>
            <CardDescription>{branch.departments?.length || 0} department(s)</CardDescription>
          </CardHeader>
          <CardContent>
            {branch.departments && branch.departments.length > 0 ? (
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                {branch.departments.map((dept) => (
                  <Card key={dept.id}>
                    <CardContent className="pt-6">
                      <p className="font-medium">{dept.name}</p>
                      <p className="text-sm text-muted-foreground">{dept.code}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No departments found</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
