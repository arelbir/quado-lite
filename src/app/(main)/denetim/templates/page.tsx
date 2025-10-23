import { Suspense } from "react";
import { getAuditTemplates } from "@/action/audit-template-actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileText } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function TemplatesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Denetim Şablonları</h1>
          <p className="text-muted-foreground">
            Denetimler için kullanılacak şablonları yönetin
          </p>
        </div>
        <Button asChild>
          <Link href="/denetim/templates/new">
            <Plus className="h-4 w-4 mr-2" />
            Yeni Şablon
          </Link>
        </Button>
      </div>

      <Suspense fallback={<div>Yükleniyor...</div>}>
        <TemplatesGrid />
      </Suspense>
    </div>
  );
}

async function TemplatesGrid() {
  const templates = await getAuditTemplates();

  if (templates.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Henüz şablon yok</h3>
          <p className="text-sm text-muted-foreground mb-4">
            İlk denetim şablonunu oluşturun
          </p>
          <Button asChild>
            <Link href="/denetim/templates/new">
              <Plus className="h-4 w-4 mr-2" />
              Yeni Şablon Oluştur
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {templates.map((template) => (
        <Card key={template.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg">{template.name}</CardTitle>
                {template.description && (
                  <CardDescription className="mt-2">
                    {template.description}
                  </CardDescription>
                )}
              </div>
              <FileText className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Badge variant="secondary">
                {(() => {
                  try {
                    const bankIds = template.questionBankIds 
                      ? (typeof template.questionBankIds === 'string' 
                          ? JSON.parse(template.questionBankIds) as string[]
                          : template.questionBankIds as string[])
                      : [];
                    return bankIds.length > 0 
                      ? `${bankIds.length} Soru Havuzu` 
                      : "Soru Havuzu Yok";
                  } catch {
                    return "Soru Havuzu Yok";
                  }
                })()}
              </Badge>
              <Button asChild size="sm" variant="outline">
                <Link href={`/denetim/templates/${template.id}`}>
                  Şablonu Yönet
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
