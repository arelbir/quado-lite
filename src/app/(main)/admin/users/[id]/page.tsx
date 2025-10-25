/**
 * USER DETAIL PAGE
 * Individual user management
 * 
 * Features:
 * - User profile
 * - Role management
 * - Activity history
 * - Quick actions
 * 
 * Created: 2025-01-24
 * Week 7-8: Day 6
 */

import { notFound } from "next/navigation";
import { db } from "@/drizzle/db";
import { user } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Mail, Building2, Briefcase, Shield, Calendar, ArrowLeft, Edit } from "lucide-react";
import { format } from "date-fns";

export const metadata = {
  title: "User Details | Admin",
  description: "Manage user details",
};

export default async function UserDetailPage({
  params,
}: {
  params: { id: string };
}) {
  // Fetch user with all relations
  const userDetail = await db.query.user.findFirst({
    where: eq(user.id, params.id),
    with: {
      department: true,
      position: true,
      company: true,
      branch: true,
      manager: {
        columns: {
          id: true,
          name: true,
          email: true,
        },
      },
      userRoles: {
        with: {
          role: true,
        },
      },
    },
  });

  if (!userDetail) {
    notFound();
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <User className="w-6 h-6" />
            <h2 className="text-3xl font-bold tracking-tight">
              {userDetail.name || "Unnamed User"}
            </h2>
            {userDetail.status === "active" ? (
              <Badge className="bg-green-100 text-green-800">Active</Badge>
            ) : (
              <Badge variant="secondary">Inactive</Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-1">{userDetail.email}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/users">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Users
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/admin/users?edit=${params.id}`}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Link>
          </Button>
          <Button variant="outline" disabled>
            <Shield className="w-4 h-4 mr-2" />
            Assign Role
          </Button>
        </div>
      </div>

      {/* Profile Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Department</CardDescription>
            <CardTitle className="text-xl flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              {userDetail.department?.name || "Not assigned"}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Position</CardDescription>
            <CardTitle className="text-xl flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              {userDetail.position?.name || "Not assigned"}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Roles</CardDescription>
            <CardTitle className="text-xl flex items-center gap-2">
              <Shield className="w-4 h-4" />
              {userDetail.userRoles.length} roles
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Roles */}
      <Card>
        <CardHeader>
          <CardTitle>Assigned Roles</CardTitle>
          <CardDescription>
            User roles and their validity periods
          </CardDescription>
        </CardHeader>
        <CardContent>
          {userDetail.userRoles.length > 0 ? (
            <div className="space-y-2">
              {userDetail.userRoles.map((ur: any) => (
                <div
                  key={ur.id}
                  className="flex items-center justify-between p-3 rounded border"
                >
                  <div className="flex items-center gap-3">
                    <Shield className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{ur.role.name}</div>
                      {ur.role.description && (
                        <div className="text-sm text-muted-foreground">
                          {ur.role.description}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {ur.role.isSystem && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        System
                      </Badge>
                    )}
                    {ur.validFrom && ur.validTo && (
                      <Badge variant="outline" className="text-xs">
                        <Calendar className="w-3 h-3 mr-1" />
                        {format(new Date(ur.validFrom), "MMM d")} - {format(new Date(ur.validTo), "MMM d, yyyy")}
                      </Badge>
                    )}
                    <Button variant="ghost" size="sm">
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No roles assigned</p>
              <Button className="mt-4">Assign Role</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Info */}
      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Email</div>
              <div className="mt-1 flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                {userDetail.email || "N/A"}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Employee Number</div>
              <div className="mt-1">{userDetail.employeeNumber || "N/A"}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Company</div>
              <div className="mt-1">{userDetail.company?.name || "N/A"}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Branch</div>
              <div className="mt-1">{userDetail.branch?.name || "N/A"}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Manager</div>
              <div className="mt-1 flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                {userDetail.manager?.name || userDetail.manager?.email || "N/A"}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Status</div>
              <div className="mt-1">
                {userDetail.status === "active" ? (
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                ) : (
                  <Badge variant="secondary">Inactive</Badge>
                )}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Created At</div>
              <div className="mt-1">{format(new Date(userDetail.createdAt), "PPP")}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Last Updated</div>
              <div className="mt-1">
                {userDetail.updatedAt ? format(new Date(userDetail.updatedAt), "PPP") : "N/A"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
