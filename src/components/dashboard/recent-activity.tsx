"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

const activities = [
  {
    id: 1,
    user: { name: "Mehmet Yılmaz", image: null },
    action: "yeni bir kullanıcı oluşturdu",
    target: "Ayşe Demir",
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
  },
  {
    id: 2,
    user: { name: "Admin", image: null },
    action: "rol izinlerini güncelledi",
    target: "Manager",
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
  },
  {
    id: 3,
    user: { name: "Zeynep Çelik", image: null },
    action: "iş akışını tamamladı",
    target: "Onay Süreci #42",
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: 4,
    user: { name: "Can Arslan", image: null },
    action: "takıma üye ekledi",
    target: "DevOps Ekibi",
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
  },
  {
    id: 5,
    user: { name: "Selin Yıldırım", image: null },
    action: "departman oluşturdu",
    target: "İnovasyon",
    timestamp: new Date(Date.now() - 1000 * 60 * 120),
  },
];

export function RecentActivity() {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Son Aktiviteler</CardTitle>
        <CardDescription>Sistemdeki son işlemler</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-4">
              <Avatar className="h-9 w-9">
                <AvatarImage src={activity.user.image || undefined} />
                <AvatarFallback>
                  {activity.user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <p className="text-sm">
                  <span className="font-medium">{activity.user.name}</span>{" "}
                  <span className="text-muted-foreground">{activity.action}</span>{" "}
                  <span className="font-medium">{activity.target}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(activity.timestamp, {
                    addSuffix: true,
                    locale: tr,
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
