"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TeamsTableClientProps {
  data: any[];
  departments: any[];
  users: any[];
}

export function TeamsTableClient({ data, departments, users }: TeamsTableClientProps) {
  const router = useRouter();
  const [teams] = useState(data);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Takım Yönetimi</h1>
          <p className="text-muted-foreground">
            Organizasyonel takımları yönetin
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Takım
        </Button>
      </div>

      {/* Teams Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {teams.map((team) => (
          <Card 
            key={team.id} 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => router.push(`/admin/teams/${team.id}`)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl">{team.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {team.code}
                  </CardDescription>
                </div>
                <Badge variant={team.isActive ? "default" : "secondary"}>
                  {team.isActive ? "Aktif" : "Pasif"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Description */}
                {team.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {team.description}
                  </p>
                )}

                {/* Team Type */}
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {team.type}
                  </Badge>
                </div>

                {/* Department */}
                {team.department && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Departman: </span>
                    <span className="font-medium">{team.department.name}</span>
                  </div>
                )}

                {/* Leader */}
                {team.leader && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Lider: </span>
                    <span className="font-medium">{team.leader.name}</span>
                  </div>
                )}

                {/* Member Count */}
                <div className="flex items-center gap-2 pt-2 border-t">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {team.members?.length || 0} Üye
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {teams.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Henüz takım yok</h3>
            <p className="text-sm text-muted-foreground mb-4">
              İlk takımınızı oluşturmak için yukarıdaki butona tıklayın
            </p>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              İlk Takımı Oluştur
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
