'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, ArrowLeft, Edit } from "lucide-react";

export default function DOFDetailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get('id');
  const [dof, setDof] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) { router.push('/denetim/dofs'); return; }
    fetch(`/api/dofs/${id}`)
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => { setDof(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id, router]);

  if (loading) return <div className="flex-1 p-8"><div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-1/4"></div></div></div>;
  if (!dof) return <div className="flex-1 p-8 text-center"><h1 className="text-2xl font-bold text-red-600">DOF Not Found</h1><Button className="mt-4" asChild><Link href="/denetim/dofs">Back</Link></Button></div>;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold">DOF #{dof.dofNumber}</h1><p className="text-muted-foreground">DOF Details</p></div>
        <div className="flex gap-2">
          <Button variant="outline" asChild><Link href="/denetim/dofs"><ArrowLeft className="w-4 h-4 mr-2" />Back</Link></Button>
          <Button variant="outline" asChild><Link href={`/denetim/dofs?edit=${id}`}><Edit className="w-4 h-4 mr-2" />Edit</Link></Button>
          <Badge>{dof.currentStep}</Badge>
        </div>
      </div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" />DOF Information</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div><label className="text-sm font-medium text-muted-foreground">DOF Number</label><p className="text-base font-medium">{dof.dofNumber}</p></div>
          <div><label className="text-sm font-medium text-muted-foreground">Current Step</label><p className="text-base">{dof.currentStep}</p></div>
          {dof.finding && <div><label className="text-sm font-medium text-muted-foreground">Finding</label><p className="text-base">{dof.finding.title}</p></div>}
        </CardContent>
      </Card>
    </div>
  );
}
