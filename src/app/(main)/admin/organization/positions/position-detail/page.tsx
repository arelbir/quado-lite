'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, ArrowLeft, Edit } from "lucide-react";

export default function PositionDetailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get('id');
  const [position, setPosition] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) { 
      router.push('/admin/organization/positions'); 
      return; 
    }
    
    console.log("🔍 [Client] Fetching position:", id);
    
    fetch(`/api/positions/${id}`)
      .then(res => {
        console.log("📡 [Client] Response status:", res.status);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        return res.json();
      })
      .then(data => { 
        console.log("✅ [Client] Position loaded:", data);
        setPosition(data); 
        setLoading(false); 
      })
      .catch((error) => {
        console.error("❌ [Client] Error:", error);
        setLoading(false);
      });
  }, [id, router]);

  if (loading) return <div className="flex-1 p-8"><div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-1/4"></div></div></div>;
  if (!position) return <div className="flex-1 p-8 text-center"><h1 className="text-2xl font-bold text-red-600">Position Not Found</h1><Button className="mt-4" asChild><Link href="/admin/organization/positions">Back</Link></Button></div>;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold">{position.name}</h1><p className="text-muted-foreground">Position Details</p></div>
        <div className="flex gap-2">
          <Button variant="outline" asChild><Link href="/admin/organization/positions"><ArrowLeft className="w-4 h-4 mr-2" />Back</Link></Button>
          <Button variant="outline" asChild><Link href={`/admin/organization/positions?edit=${id}`}><Edit className="w-4 h-4 mr-2" />Edit</Link></Button>
          <Badge variant={position.isActive ? "default" : "secondary"}>{position.isActive ? "Active" : "Inactive"}</Badge>
        </div>
      </div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Briefcase className="h-5 w-5" />Position Information</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div><label className="text-sm font-medium text-muted-foreground">Name</label><p className="text-base font-medium">{position.name}</p></div>
          <div><label className="text-sm font-medium text-muted-foreground">Code</label><p className="text-base font-medium">{position.code}</p></div>
          {position.department && <div><label className="text-sm font-medium text-muted-foreground">Department</label><p className="text-base">{position.department.name}</p></div>}
          {position.description && <div><label className="text-sm font-medium text-muted-foreground">Description</label><p className="text-sm text-muted-foreground">{position.description}</p></div>}
        </CardContent>
      </Card>
    </div>
  );
}
