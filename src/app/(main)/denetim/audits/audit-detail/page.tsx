'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClipboardCheck, ArrowLeft, Edit } from "lucide-react";

export default function AuditDetailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get('id');
  const [audit, setAudit] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) { router.push('/denetim/audits'); return; }
    fetch(`/api/audits/${id}`)
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => { setAudit(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id, router]);

  if (loading) return <div className="flex-1 p-8"><div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-1/4"></div></div></div>;
  if (!audit) return <div className="flex-1 p-8 text-center"><h1 className="text-2xl font-bold text-red-600">Audit Not Found</h1><Button className="mt-4" asChild><Link href="/denetim/audits">Back</Link></Button></div>;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold">{audit.title}</h1><p className="text-muted-foreground">Audit Details</p></div>
        <div className="flex gap-2">
          <Button variant="outline" asChild><Link href="/denetim/audits"><ArrowLeft className="w-4 h-4 mr-2" />Back</Link></Button>
          <Button variant="outline" asChild><Link href={`/denetim/audits?edit=${id}`}><Edit className="w-4 h-4 mr-2" />Edit</Link></Button>
          <Badge>{audit.status}</Badge>
        </div>
      </div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><ClipboardCheck className="h-5 w-5" />Audit Information</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div><label className="text-sm font-medium text-muted-foreground">Title</label><p className="text-base font-medium">{audit.title}</p></div>
          <div><label className="text-sm font-medium text-muted-foreground">Status</label><p className="text-base">{audit.status}</p></div>
          {audit.auditPlan && <div><label className="text-sm font-medium text-muted-foreground">Plan</label><p className="text-base">{audit.auditPlan.title}</p></div>}
        </CardContent>
      </Card>
    </div>
  );
}
