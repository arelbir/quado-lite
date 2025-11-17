"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Users, Edit, Trash2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TeamDetailClientProps {
  team: any;
  members: any[];
  availableUsers: any[];
  departments: any[];
  users: any[];
}

export function TeamDetailClient({
  team,
  members,
  availableUsers,
  departments,
  users,
}: TeamDetailClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("info");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/admin/teams")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{team.name}</h1>
              <Badge variant={team.isActive ? "default" : "secondary"}>
                {team.isActive ? "Aktif" : "Pasif"}
              </Badge>
            </div>
            <p className="text-muted-foreground">{team.code}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            Düzenle
          </Button>
          <Button variant="destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Sil
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="info">Bilgiler</TabsTrigger>
          <TabsTrigger value="members">
            Üyeler ({members.length})
          </TabsTrigger>
          <TabsTrigger value="activity">Aktivite</TabsTrigger>
        </TabsList>

        {/* Info Tab */}
        <TabsContent value="info" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Takım Bilgileri</CardTitle>
              <CardDescription>Takım detaylarını görüntüleyin</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Takım Adı
                  </label>
                  <p className="text-lg font-medium">{team.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Takım Kodu
                  </label>
                  <p className="text-lg font-medium">{team.code}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Tip
                  </label>
                  <p className="text-lg font-medium">
                    <Badge variant="outline">{team.type}</Badge>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Durum
                  </label>
                  <p className="text-lg font-medium">
                    <Badge variant={team.isActive ? "default" : "secondary"}>
                      {team.isActive ? "Aktif" : "Pasif"}
                    </Badge>
                  </p>
                </div>
              </div>
              {team.description && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Açıklama
                  </label>
                  <p className="mt-1">{team.description}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Takım Üyeleri</CardTitle>
                  <CardDescription>
                    Takım üyelerini yönetin
                  </CardDescription>
                </div>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Üye Ekle
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {members.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Üye</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead>Katılım Tarihi</TableHead>
                      <TableHead className="text-right">İşlem</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={member.user?.image || ""} />
                              <AvatarFallback>
                                {member.user?.name?.charAt(0) || "?"}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">
                              {member.user?.name || "Unknown"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{member.user?.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{member.role}</Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(member.joinedAt).toLocaleDateString("tr-TR")}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    Henüz üye yok
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Takıma ilk üyeyi eklemek için yukarıdaki butona tıklayın
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Aktivite Geçmişi</CardTitle>
              <CardDescription>Takım aktivitelerini görüntüleyin</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center py-8">
                Aktivite geçmişi yakında eklenecek...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
