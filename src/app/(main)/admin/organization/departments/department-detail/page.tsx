'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Building2, ArrowLeft } from "lucide-react";

export default function DepartmentDetailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get('id');
  const [department, setDepartment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) { router.push('/admin/organization/departments'); return; }
    fetch(`/api/departments/${id}`)
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => { setDepartment(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id, router]);

  if (loading) return <div className="flex-1 p-8"><div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-1/4"></div></div></div>;
  if (!department) return <div className="flex-1 p-8 text-center"><h1 className="text-2xl font-bold text-red-600">Department Not Found</h1><Button className="mt-4" asChild><Link href="/admin/organization/departments">Back</Link></Button></div>;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold">{department.name}</h1><p className="text-muted-foreground">Department Details</p></div>
        <div className="flex gap-2">
          <Button variant="outline" asChild><Link href="/admin/organization/departments"><ArrowLeft className="w-4 h-4 mr-2" />Back</Link></Button>
          <Badge variant={department.isActive ? "default" : "secondary"}>{department.isActive ? "Active" : "Inactive"}</Badge>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5" />Department Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><label className="text-sm font-medium text-muted-foreground">Name</label><p className="text-base font-medium">{department.name}</p></div>
            <div><label className="text-sm font-medium text-muted-foreground">Code</label><p className="text-base font-medium">{department.code}</p></div>
            {department.branch && <div><label className="text-sm font-medium text-muted-foreground">Branch</label><p className="text-base">{department.branch.name} ({department.branch.code})</p></div>}
            {department.description && <div><label className="text-sm font-medium text-muted-foreground">Description</label><p className="text-base">{department.description}</p></div>}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" />Management</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {department.manager ? (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Manager</label>
                <p className="text-base font-medium">{department.manager.name}</p>
                <p className="text-sm text-muted-foreground">{department.manager.email}</p>
              </div>
            ) : (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Manager</label>
                <p className="text-base text-muted-foreground">No manager assigned</p>
              </div>
            )}
            {department.costCenter && <div><label className="text-sm font-medium text-muted-foreground">Cost Center</label><p className="text-base">{department.costCenter}</p></div>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
