"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Clock, User, XCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

interface ActionTimelineProps {
  action: {
    status: string;
    createdAt: Date;
    completedAt: Date | null;
    updatedAt: Date | null;
    completionNotes?: string | null;
    rejectionReason?: string | null;
    createdBy?: {
      name: string | null;
      email: string | null;
    } | null;
    assignedTo?: {
      name: string | null;
      email: string | null;
    } | null;
    manager?: {
      name: string | null;
      email: string | null;
    } | null;
  };
}

export function ActionTimeline({ action }: ActionTimelineProps) {
  const events = [];

  // 1. Oluşturulma
  events.push({
    title: "Aksiyon Oluşturuldu",
    description: `${action.createdBy?.name || action.createdBy?.email || "Bilinmeyen"} tarafından`,
    date: action.createdAt,
    icon: User,
    color: "text-blue-600 dark:text-blue-400",
  });

  // 2. Atama
  if (action.assignedTo) {
    events.push({
      title: "Sorumluya Atandı",
      description: `${action.assignedTo.name || action.assignedTo.email} sorumlu olarak atandı`,
      date: action.createdAt,
      icon: User,
      color: "text-purple-600 dark:text-purple-400",
    });
  }

  // 3. Tamamlanma
  if (action.completedAt) {
    let description = `${action.assignedTo?.name || action.assignedTo?.email} aksiyonu tamamladı`;
    if (action.completionNotes) {
      description += `\n\n"${action.completionNotes}"`;
    }
    events.push({
      title: "Sorumlu Tamamladı",
      description,
      date: action.completedAt,
      icon: CheckCircle2,
      color: "text-green-600 dark:text-green-400",
    });
  }

  // 4. Onay/Red
  if (action.status === "Completed" && action.updatedAt) {
    events.push({
      title: "Yönetici Onayladı",
      description: `${action.manager?.name || action.manager?.email} aksiyonu onayladı`,
      date: action.updatedAt,
      icon: CheckCircle2,
      color: "text-green-600 dark:text-green-400",
    });
  } else if (action.status === "Rejected" && action.updatedAt) {
    let description = `${action.manager?.name || action.manager?.email} aksiyonu reddetti`;
    if (action.rejectionReason) {
      description += `\n\nNeden: "${action.rejectionReason}"`;
    }
    events.push({
      title: "Yönetici Reddetti",
      description,
      date: action.updatedAt,
      icon: XCircle,
      color: "text-red-600 dark:text-red-400",
    });
  } else if (action.status === "PendingManagerApproval") {
    events.push({
      title: "Yönetici Onayı Bekleniyor",
      description: `${action.manager?.name || action.manager?.email} onaylamalı`,
      date: action.completedAt || action.updatedAt || action.createdAt,
      icon: Clock,
      color: "text-yellow-600 dark:text-yellow-400",
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aksiyon Geçmişi</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-[11px] top-0 bottom-0 w-0.5 bg-border" />

          {/* Events */}
          <div className="space-y-6">
            {events.map((event, index) => {
              const Icon = event.icon;
              return (
                <div key={index} className="relative flex gap-4">
                  {/* Icon Circle */}
                  <div className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-background">
                    <Icon className={`h-4 w-4 ${event.color}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-6">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-sm">{event.title}</p>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(event.date), { 
                          addSuffix: true, 
                          locale: tr 
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{event.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(event.date).toLocaleString("tr-TR")}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
