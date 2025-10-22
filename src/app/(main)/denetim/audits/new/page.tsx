import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { CreateAuditForm } from "./create-audit-form";

export default function NewAuditPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/denetim/all">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Yeni Denetim Oluştur</h1>
          <p className="text-sm text-muted-foreground">
            Denetim bilgilerini girin
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Denetim Bilgileri</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateAuditForm />
        </CardContent>
      </Card>
    </div>
  );
}
