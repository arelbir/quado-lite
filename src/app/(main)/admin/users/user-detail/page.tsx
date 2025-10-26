'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Mail, Building2, Briefcase, Shield, Calendar, ArrowLeft, Edit } from "lucide-react";
import { format } from "date-fns";
import { UserRoleManagement } from "@/components/admin/user-role-management";

export default function UserDetailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get('id');
  
  const [userDetail, setUserDetail] = useState<any>(null);
  const [userRoles, setUserRoles] = useState<any[]>([]);
  const [availableRoles, setAvailableRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      router.push('/admin/users');
      return;
    }

    console.log("✅ [USER DETAIL CLIENT] Fetching user:", id);

    // Fetch user data, user roles, and available roles in parallel
    Promise.all([
      fetch(`/api/users/${id}`).then(res => {
        if (!res.ok) throw new Error('User not found');
        return res.json();
      }),
      fetch(`/api/users/${id}/roles`).then(res => res.json()),
      fetch(`/api/roles`).then(res => res.json()),
    ])
      .then(([userData, userRolesData, availableRolesData]) => {
        console.log("✅ [USER DETAIL CLIENT] User loaded:", (userData as any).name);
        setUserDetail(userData as any);
        setUserRoles((userRolesData as any) || []);
        setAvailableRoles((availableRolesData as any) || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("❌ [USER DETAIL CLIENT] Error:", err);
        setError(err.message);
        setLoading(false);
      });
  }, [id, router]);

  if (loading) {
    return (
      <div className="flex-1 p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error || !userDetail) {
    return (
      <div className="flex-1 p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">User Not Found</h1>
          <Button className="mt-4" asChild>
            <Link href="/admin/users">Back to Users</Link>
          </Button>
        </div>
      </div>
    );
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
            <Link href={`/admin/users?edit=${id}`}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Link>
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
              {userDetail.userRoles?.length || 0} roles
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

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
          </div>
        </CardContent>
      </Card>

      {/* Role Management */}
      <UserRoleManagement
        userId={id!}
        userName={userDetail.name || "User"}
        userRoles={userRoles}
        availableRoles={availableRoles}
      />
    </div>
  );
}
