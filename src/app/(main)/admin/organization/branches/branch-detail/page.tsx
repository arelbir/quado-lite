'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Mail, Phone, MapPin, ArrowLeft, Edit } from "lucide-react";

export default function BranchDetailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get('id');
  
  const [branch, setBranch] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      router.push('/admin/organization/branches');
      return;
    }

    fetch(`/api/branches/${id}`)
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => { setBranch(data); setLoading(false); })
      .catch(() => { setLoading(false); });
  }, [id, router]);

  if (loading) return <div className="flex-1 p-8"><div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-1/4"></div></div></div>;
  if (!branch) return <div className="flex-1 p-8 text-center"><h1 className="text-2xl font-bold text-red-600">Branch Not Found</h1><Button className="mt-4" asChild><Link href="/admin/organization/branches">Back</Link></Button></div>;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{branch.name}</h1>
          <p className="text-muted-foreground">Branch Details</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild><Link href="/admin/organization/branches"><ArrowLeft className="w-4 h-4 mr-2" />Back</Link></Button>
          <Button variant="outline" asChild><Link href={`/admin/organization/branches?edit=${id}`}><Edit className="w-4 h-4 mr-2" />Edit</Link></Button>
          <Badge variant={branch.isActive ? "default" : "secondary"}>{branch.isActive ? "Active" : "Inactive"}</Badge>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5" />Basic Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><label className="text-sm font-medium text-muted-foreground">Name</label><p className="text-base font-medium">{branch.name}</p></div>
            <div><label className="text-sm font-medium text-muted-foreground">Code</label><p className="text-base font-medium">{branch.code}</p></div>
            {branch.company && <div><label className="text-sm font-medium text-muted-foreground">Company</label><p className="text-base">{branch.company.name}</p></div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5" />Contact Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {branch.email && <div className="flex items-center gap-2"><Mail className="h-4 w-4" /><a href={`mailto:${branch.email}`} className="text-primary hover:underline">{branch.email}</a></div>}
            {branch.phone && <div className="flex items-center gap-2"><Phone className="h-4 w-4" /><a href={`tel:${branch.phone}`}>{branch.phone}</a></div>}
            {branch.city && <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /><span>{branch.city}</span></div>}
            {branch.address && <div><label className="text-sm font-medium text-muted-foreground">Address</label><p className="text-sm">{branch.address}</p></div>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
