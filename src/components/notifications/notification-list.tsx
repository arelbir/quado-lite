"use client";

import { useEffect, useState, useTransition } from "react";
import { getUserNotifications, markNotificationAsRead, markAllAsRead } from "@/action/notification-actions";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { CheckCheck, Bell } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

interface NotificationListProps {
  onUnreadCountChange?: (count: number) => void;
}

type Notification = Awaited<ReturnType<typeof getUserNotifications>>[0];

export function NotificationList({ onUnreadCountChange }: NotificationListProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await getUserNotifications(20);
      setNotifications(data);
      
      const unreadCount = data.filter((n) => !n.isRead).length;
      onUnreadCountChange?.(unreadCount);
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    startTransition(async () => {
      const result = await markNotificationAsRead(notificationId);
      if (result.success) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, isRead: true, readAt: new Date() } : n
          )
        );
        
        const unreadCount = notifications.filter(
          (n) => n.id !== notificationId && !n.isRead
        ).length;
        onUnreadCountChange?.(unreadCount);
      }
    });
  };

  const handleMarkAllAsRead = async () => {
    startTransition(async () => {
      const result = await markAllAsRead();
      if (result.success) {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, isRead: true, readAt: new Date() }))
        );
        onUnreadCountChange?.(0);
        toast.success("Tüm bildirimler okundu olarak işaretlendi");
      }
    });
  };

  const getNotificationLink = (notification: Notification): string => {
    if (!notification.relatedEntityType || !notification.relatedEntityId) {
      return "/notifications";
    }

    switch (notification.relatedEntityType) {
      case "finding":
        return `/denetim/findings/${notification.relatedEntityId}`;
      case "action":
        return `/denetim/findings/${notification.relatedEntityId}`;
      case "dof":
        return `/denetim/dofs/${notification.relatedEntityId}`;
      case "audit":
        return `/denetim/audits/${notification.relatedEntityId}`;
      case "plan":
        return `/denetim/plans`;
      default:
        return "/notifications";
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        Yükleniyor...
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="p-8 text-center">
        <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-sm text-muted-foreground">Henüz bildiriminiz yok</p>
      </div>
    );
  }

  const unreadNotifications = notifications.filter((n) => !n.isRead);

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b">
        <div>
          <h3 className="font-semibold">Bildirimler</h3>
          {unreadNotifications.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {unreadNotifications.length} okunmamış
            </p>
          )}
        </div>
        {unreadNotifications.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={isPending}
          >
            <CheckCheck className="h-4 w-4 mr-2" />
            Tümü Okundu
          </Button>
        )}
      </div>

      {/* Notification List */}
      <ScrollArea className="h-[400px]">
        <div className="divide-y">
          {notifications.map((notification) => (
            <Link
              key={notification.id}
              href={getNotificationLink(notification)}
              onClick={() => {
                if (!notification.isRead) {
                  handleMarkAsRead(notification.id);
                }
              }}
              className={`block p-4 hover:bg-accent transition-colors ${
                !notification.isRead ? "bg-primary/5" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`mt-1 ${!notification.isRead ? "text-primary" : "text-muted-foreground"}`}>
                  <Bell className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium mb-1 ${!notification.isRead ? "text-primary" : ""}`}>
                    {notification.title}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(notification.createdAt), {
                      addSuffix: true,
                      locale: tr,
                    })}
                  </p>
                </div>
                {!notification.isRead && (
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                )}
              </div>
            </Link>
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <Separator />
      <div className="p-2">
        <Button variant="ghost" size="sm" className="w-full" asChild>
          <Link href="/notifications">Tüm Bildirimleri Gör</Link>
        </Button>
      </div>
    </div>
  );
}
