'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, ArrowLeft, Edit } from "lucide-react";

export default function RoleDetailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get('id');
  const [role, setRole] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) { router.push('/admin/roles'); return; }
    fetch(`/api/roles/${id}`)
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => { setRole(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id, router]);

  if (loading) return <div className="flex-1 p-8"><div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-1/4"></div></div></div>;
  if (!role) return <div className="flex-1 p-8 text-center"><h1 className="text-2xl font-bold text-red-600">Role Not Found</h1><Button className="mt-4" asChild><Link href="/admin/roles">Back</Link></Button></div>;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold">{role.name}</h1><p className="text-muted-foreground">Role Details</p></div>
        <div className="flex gap-2">
          <Button variant="outline" asChild><Link href="/admin/roles"><ArrowLeft className="w-4 h-4 mr-2" />Back</Link></Button>
          <Button variant="outline" asChild><Link href={`/admin/roles?edit=${id}`}><Edit className="w-4 h-4 mr-2" />Edit</Link></Button>
          <Badge variant={role.isActive ? "default" : "secondary"}>{role.isActive ? "Active" : "Inactive"}</Badge>
        </div>
      </div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Role Information</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div><label className="text-sm font-medium text-muted-foreground">Name</label><p className="text-base font-medium">{role.name}</p></div>
          {role.description && <div><label className="text-sm font-medium text-muted-foreground">Description</label><p className="text-sm text-muted-foreground">{role.description}</p></div>}
          {role.roleMenus && <div><label className="text-sm font-medium text-muted-foreground">Permissions</label><p className="text-sm">{role.roleMenus.length} menu permissions</p></div>}
        </CardContent>
      </Card>
    </div>
  );
}
