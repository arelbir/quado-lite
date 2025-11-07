"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from 'next-intl';
import Link from "next/link";
import { StatusBadge } from "@/components/ui/status-badge";
import { Badge } from "@/components/ui/badge";
import { User, Calendar, ExternalLink, FileCheck, ListChecks, Edit, HelpCircle, MessageSquare, AlertCircle, UserPlus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { parseFindingDetails } from "@/lib/parse-finding";
import { QuickAssignDialog } from "./quick-assign-dialog";
import { QuickActionDialog } from "./quick-action-dialog";
import { QuickDofDialog } from "./quick-dof-dialog";

interface FindingCardProps {
  finding: {
    id: string;
    details: string;
    status: string;
    riskType: string | null;
    createdAt: Date;
    assignedToId?: string | null;
    assignedTo?: {
      id: string;
      name: string | null;
    } | null;
  };
  auditId: string;
  users: Array<{ id: string; name: string | null; email: string | null }>;
}

export function FindingCard({ finding, auditId, users }: FindingCardProps) {
  const t = useTranslations('finding');
  const isCompleted = finding.status === "Completed";
  const parsedFinding = parseFindingDetails(finding.details);

  const riskColorMap: Record<string, string> = {
    "Kritik": "text-red-600 dark:text-red-400",
    "Yüksek": "text-orange-600 dark:text-orange-400",
    "Orta": "text-yellow-600 dark:text-yellow-400",
    "Düşük": "text-green-600 dark:text-green-400",
  };

  return (
    <div
      className={cn(
        "rounded-lg border p-3 md:p-4 transition-colors hover:bg-accent/50",
        isCompleted && "border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20"
      )}
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4">
        {/* Sol: İçerik */}
        <div className="space-y-2 min-w-0">
          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge status={finding.status as any} type="finding" />
            {finding.riskType && (
              <Badge 
                variant="outline" 
                className={cn(
                  "text-xs font-medium",
                  riskColorMap[finding.riskType] || "text-muted-foreground"
                )}
              >
                {finding.riskType} Risk
              </Badge>
            )}
            <Badge variant="secondary" className="text-xs">
              <Calendar className="h-3 w-3 mr-1" />
              {new Date(finding.createdAt).toLocaleDateString("tr-TR")}
            </Badge>
          </div>
          
          {/* Details - Tek satır kompakt */}
          {parsedFinding.isAutomatic ? (
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="text-xs">{t('card.auto')}</Badge>
              
              {parsedFinding.question && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1.5 min-w-0 max-w-[200px] px-2 py-1 rounded-md bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
                        <HelpCircle className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                        <span className="text-xs truncate">{parsedFinding.question}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="font-semibold text-xs mb-1">{t('card.question')}</p>
                      <p>{parsedFinding.question}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              
              {parsedFinding.answer && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1.5 min-w-0 max-w-[150px] px-2 py-1 rounded-md bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900">
                        <MessageSquare className="h-3.5 w-3.5 text-green-600 dark:text-green-400 flex-shrink-0" />
                        <span className="text-xs truncate font-medium">{parsedFinding.answer}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="font-semibold text-xs mb-1">{t('card.answer')}</p>
                      <p>{parsedFinding.answer}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              
              {parsedFinding.notes && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1.5 min-w-0 max-w-[150px] px-2 py-1 rounded-md bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900">
                        <AlertCircle className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                        <span className="text-xs truncate">{parsedFinding.notes}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="font-semibold text-xs mb-1">{t('card.notes')}</p>
                      <p>{parsedFinding.notes}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          ) : (
            <p className="font-medium text-sm md:text-base line-clamp-2">
              {finding.details}
            </p>
          )}
          
          {/* Meta Info */}
          {finding.assignedTo && (
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {finding.assignedTo.name}
              </span>
            </div>
          )}
        </div>

        {/* Sağ: Quick Actions (Belirgin Butonlar) */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2">
          <Button asChild size="sm" variant="outline" className="w-full md:w-auto">
            <Link href={`/denetim/findings/${finding.id}`}>
              <ExternalLink className="h-4 w-4 mr-2" />
              {t('card.details')}
            </Link>
          </Button>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <QuickAssignDialog 
                    findingId={finding.id} 
                    users={users}
                    currentAssigneeId={finding.assignedToId}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Risk seviyesi belirle ve sorumlu ata</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <QuickActionDialog 
            findingId={finding.id} 
            users={users}
          />

          <QuickDofDialog 
            findingId={finding.id} 
            users={users}
          />
        </div>
      </div>
    </div>
  );
}
