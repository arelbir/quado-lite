"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, UsersRound } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface GroupsTableClientProps {
  data: any[];
  departments: any[];
  users: any[];
}

export function GroupsTableClient({ data, departments, users }: GroupsTableClientProps) {
  const router = useRouter();
  const [groups] = useState(data);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Grup Yönetimi</h1>
          <p className="text-muted-foreground">
            Fonksiyonel ve proje tabanlı grupları yönetin
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Grup
        </Button>
      </div>

      {/* Groups Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {groups.map((group) => (
          <Card 
            key={group.id} 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => router.push(`/admin/groups/${group.id}`)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl">{group.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {group.code}
                  </CardDescription>
                </div>
                <Badge variant={group.isActive ? "default" : "secondary"}>
                  {group.isActive ? "Aktif" : "Pasif"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Description */}
                {group.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {group.description}
                  </p>
                )}

                {/* Group Type */}
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {group.type}
                  </Badge>
                  <Badge variant="outline" className="text-xs capitalize">
                    {group.visibility}
                  </Badge>
                </div>

                {/* Member Count Placeholder */}
                <div className="flex items-center gap-2 pt-2 border-t">
                  <UsersRound className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Üye sayısı
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {groups.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <UsersRound className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Henüz grup yok</h3>
            <p className="text-sm text-muted-foreground mb-4">
              İlk grubunuzu oluşturmak için yukarıdaki butona tıklayın
            </p>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              İlk Grubu Oluştur
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
