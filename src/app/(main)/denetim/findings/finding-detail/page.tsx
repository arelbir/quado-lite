'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowLeft, Edit } from "lucide-react";

export default function FindingDetailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get('id');
  const [finding, setFinding] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) { router.push('/denetim/findings'); return; }
    fetch(`/api/findings/${id}`)
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => { setFinding(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id, router]);

  if (loading) return <div className="flex-1 p-8"><div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-1/4"></div></div></div>;
  if (!finding) return <div className="flex-1 p-8 text-center"><h1 className="text-2xl font-bold text-red-600">Finding Not Found</h1><Button className="mt-4" asChild><Link href="/denetim/findings">Back</Link></Button></div>;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold">{finding.title}</h1><p className="text-muted-foreground">Finding Details</p></div>
        <div className="flex gap-2">
          <Button variant="outline" asChild><Link href="/denetim/findings"><ArrowLeft className="w-4 h-4 mr-2" />Back</Link></Button>
          <Button variant="outline" asChild><Link href={`/denetim/findings?edit=${id}`}><Edit className="w-4 h-4 mr-2" />Edit</Link></Button>
          <Badge variant={finding.severity === 'Critical' ? 'destructive' : 'default'}>{finding.severity}</Badge>
        </div>
      </div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5" />Finding Information</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div><label className="text-sm font-medium text-muted-foreground">Title</label><p className="text-base font-medium">{finding.title}</p></div>
          <div><label className="text-sm font-medium text-muted-foreground">Severity</label><p className="text-base">{finding.severity}</p></div>
          {finding.description && <div><label className="text-sm font-medium text-muted-foreground">Description</label><p className="text-sm text-muted-foreground">{finding.description}</p></div>}
        </CardContent>
      </Card>
    </div>
  );
}
