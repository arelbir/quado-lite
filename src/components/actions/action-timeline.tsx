"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Clock, User, XCircle, MessageSquare, Ban } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { useTranslations } from 'next-intl';

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
    progressNotes?: Array<{
      id: string;
      note: string;
      createdAt: Date;
      createdBy?: {
        name: string | null;
        email: string | null;
      } | null;
    }>;
  };
}

export function ActionTimeline({ action }: ActionTimelineProps) {
  const t = useTranslations('action');
  const events = [];

  // 1. Oluşturulma
  events.push({
    title: t('timeline.created'),
    description: `${action.createdBy?.name || action.createdBy?.email || t('timeline.unknown')} ${t('timeline.createdBy')}`,
    date: action.createdAt,
    icon: User,
    color: "text-blue-600 dark:text-blue-400",
  });

  // 2. Atama
  if (action.assignedTo) {
    events.push({
      title: t('timeline.assigned'),
      description: `${action.assignedTo.name || action.assignedTo.email} ${t('timeline.assignedDescription')}`,
      date: action.createdAt,
      icon: User,
      color: "text-purple-600 dark:text-purple-400",
    });
  }

  // 2.5. İlerleme Notları (Progress Notes)
  if (action.progressNotes && action.progressNotes.length > 0) {
    action.progressNotes.forEach((progress) => {
      events.push({
        title: t('timeline.progressNote'),
        description: `${progress.createdBy?.name || progress.createdBy?.email || t('fields.responsiblePerson')}: "${progress.note}"`,
        date: progress.createdAt,
        icon: MessageSquare,
        color: "text-blue-600 dark:text-blue-400",
      });
    });
  }

  // 3. Tamamlanma
  if (action.completedAt) {
    let description = `${action.assignedTo?.name || action.assignedTo?.email} ${t('timeline.completedDescription')}`;
    if (action.completionNotes) {
      description += `\n\n"${action.completionNotes}"`;
    }
    events.push({
      title: t('timeline.completed'),
      description,
      date: action.completedAt,
      icon: CheckCircle2,
      color: "text-green-600 dark:text-green-400",
    });
  }

  // 4. Onay/Red
  if (action.status === "Completed" && action.updatedAt) {
    events.push({
      title: t('timeline.approved'),
      description: `${action.manager?.name || action.manager?.email} ${t('timeline.approvedDescription')}`,
      date: action.updatedAt,
      icon: CheckCircle2,
      color: "text-green-600 dark:text-green-400",
    });
  }
  
  // Red History - Her zaman göster (döngü takibi için)
  if (action.rejectionReason) {
    let description = `${action.manager?.name || action.manager?.email} ${t('timeline.rejectedDescription')}`;
    description += `\n\n📋 ${t('timeline.rejectedNote')}: "${action.rejectionReason}"`;
    description += `\n\n→ ${t('timeline.rejectedReassigned')}`;
    events.push({
      title: t('timeline.rejected'),
      description,
      date: action.updatedAt || action.createdAt,
      icon: XCircle,
      color: "text-orange-600 dark:text-orange-400",
    });
  }
  
  if (action.status === "PendingManagerApproval") {
    events.push({
      title: t('timeline.pendingApprovalTitle'),
      description: `${action.manager?.name || action.manager?.email} ${t('timeline.pendingApprovalDescription')}`,
      date: action.completedAt || action.updatedAt || action.createdAt,
      icon: Clock,
      color: "text-yellow-600 dark:text-yellow-400",
    });
  }

  // Cancelled - İptal edildi (döngüden çıkış)
  if (action.status === "Cancelled") {
    let description = t('timeline.cancelledDescription');
    if (action.rejectionReason) {
      description += `\n\n📋 ${t('timeline.cancelledNote')}: "${action.rejectionReason}"`;
    }
    events.push({
      title: t('timeline.cancelled'),
      description,
      date: action.updatedAt || action.createdAt,
      icon: Ban,
      color: "text-gray-600 dark:text-gray-400",
    });
  }

  // Sort: En yeni üstte, en eski altta (günümüzden geçmişe)
  const sortedEvents = [...events].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">{t('sections.timeline')}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Scrollable Timeline Container */}
        <div 
          className="relative max-h-[400px] overflow-y-auto pr-2 
          [&::-webkit-scrollbar]:w-2 
          [&::-webkit-scrollbar-track]:bg-transparent 
          [&::-webkit-scrollbar-thumb]:bg-border 
          [&::-webkit-scrollbar-thumb]:rounded-full
          hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/20">
          
          {/* Events */}
          <div className="space-y-6 relative">
            {/* Timeline Line - height auto adjusts */}
            <div className="absolute left-[11px] top-2 bottom-8 w-0.5 bg-border" />
            
            {sortedEvents.map((event, index) => {
              const Icon = event.icon;
              return (
                <div key={index} className="relative flex gap-4">
                  {/* Icon Circle */}
                  <div className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-background">
                    <Icon className={`h-4 w-4 ${event.color}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
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
