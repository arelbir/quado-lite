'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Target, ArrowLeft, Edit } from "lucide-react";

export default function ActionDetailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get('id');
  const [action, setAction] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) { router.push('/denetim/actions'); return; }
    fetch(`/api/actions/${id}`)
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => { setAction(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id, router]);

  if (loading) return <div className="flex-1 p-8"><div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-1/4"></div></div></div>;
  if (!action) return <div className="flex-1 p-8 text-center"><h1 className="text-2xl font-bold text-red-600">Action Not Found</h1><Button className="mt-4" asChild><Link href="/denetim/actions">Back</Link></Button></div>;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold">{action.title}</h1><p className="text-muted-foreground">Action Details</p></div>
        <div className="flex gap-2">
          <Button variant="outline" asChild><Link href="/denetim/actions"><ArrowLeft className="w-4 h-4 mr-2" />Back</Link></Button>
          <Button variant="outline" asChild><Link href={`/denetim/actions?edit=${id}`}><Edit className="w-4 h-4 mr-2" />Edit</Link></Button>
          <Badge>{action.status}</Badge>
        </div>
      </div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Target className="h-5 w-5" />Action Information</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div><label className="text-sm font-medium text-muted-foreground">Title</label><p className="text-base font-medium">{action.title}</p></div>
          <div><label className="text-sm font-medium text-muted-foreground">Status</label><p className="text-base">{action.status}</p></div>
          {action.description && <div><label className="text-sm font-medium text-muted-foreground">Description</label><p className="text-sm text-muted-foreground">{action.description}</p></div>}
        </CardContent>
      </Card>
    </div>
  );
}
