/**
 * HR SYNC DASHBOARD
 * Main dashboard for HR sync monitoring
 * 
 * Features:
 * - Config cards
 * - Sync logs table
 * - Statistics
 * - Manual trigger
 * 
 * Created: 2025-01-24
 * Week 7-8: Day 7
 */

"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Database, Play, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useTranslations } from 'next-intl';

interface HRSyncConfig {
  id: string;
  name: string;
  sourceType: string;
  isActive: boolean;
  syncMode: string;
  lastSyncAt: Date | null;
}

interface HRSyncDashboardProps {
  configs: HRSyncConfig[];
  stats: {
    totalSyncs: number;
    successfulSyncs: number;
    failedSyncs: number;
    lastSyncAt: Date | null;
    avgDuration: number | null;
  };
}

export function HRSyncDashboard({ configs, stats }: HRSyncDashboardProps) {
  const t = useTranslations('hrSync');
  const tCommon = useTranslations('common');
  
  // Trigger sync
  const triggerSync = async (configId: string, sourceType: string) => {
    toast.loading(t('dashboard.triggeringSync'));
    try {
      // TODO: Call appropriate API based on sourceType
      const endpoints: Record<string, string> = {
        'LDAP': '/api/hr-sync/ldap',
        'CSV': '/api/hr-sync/csv',
        'REST_API': '/api/hr-sync/rest-api',
      };

      const endpoint = endpoints[sourceType];
      if (!endpoint) {
        toast.error(t('dashboard.unknownSourceType'));
        return;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ configId }),
      });

      const data = await response.json() as { success: boolean; error?: string };
      
      if (data.success) {
        toast.success(t('dashboard.syncCompleted'));
      } else {
        toast.error(t('dashboard.syncFailed', { error: data.error || tCommon('messages.unknownError') }));
      }
    } catch (error) {
      toast.error(t('dashboard.triggerFailed'));
    }
  };

  // Get source type icon
  const getSourceTypeIcon = (type: string) => {
    switch (type) {
      case 'LDAP': return '🔐';
      case 'CSV': return '📄';
      case 'REST_API': return '🌐';
      default: return '📊';
    }
  };

  return (
    <div className="space-y-4">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.totalSyncs}</div>
            <p className="text-xs text-muted-foreground">{t('dashboard.stats.totalSyncs')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{stats.successfulSyncs}</div>
            <p className="text-xs text-muted-foreground">{t('dashboard.stats.successful')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">{stats.failedSyncs}</div>
            <p className="text-xs text-muted-foreground">{t('dashboard.stats.failed')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Sync Configs */}
      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.title')}</CardTitle>
          <CardDescription>
            {t('dashboard.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {configs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {configs.map((config) => (
                <Card key={config.id} className="border-2">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getSourceTypeIcon(config.sourceType)}</span>
                        <div>
                          <CardTitle className="text-base">{config.name}</CardTitle>
                          <CardDescription>{config.sourceType}</CardDescription>
                        </div>
                      </div>
                      {config.isActive ? (
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Sync Mode:</span>
                        <Badge variant="outline">{config.syncMode}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Last Sync:</span>
                        <span>
                          {config.lastSyncAt ? format(new Date(config.lastSyncAt), "PPp") : "Never"}
                        </span>
                      </div>
                      <Button
                        className="w-full mt-2"
                        size="sm"
                        onClick={() => triggerSync(config.id, config.sourceType)}
                        disabled={!config.isActive}
                      >
                        <Play className="w-3 h-3 mr-2" />
                        {t('dashboard.triggerSync')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{t('dashboard.noConfigs')}</p>
              <Button className="mt-4">{t('dashboard.createConfig')}</Button>
            </div>
          )}
        </CardContent>
      </Card>


      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.quickActions.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto py-4">
              <div className="text-center">
                <Database className="w-8 h-8 mx-auto mb-2" />
                <div className="font-semibold">{t('dashboard.quickActions.createConfig')}</div>
                <div className="text-xs text-muted-foreground">{t('dashboard.quickActions.createConfigDesc')}</div>
              </div>
            </Button>
            <Button variant="outline" className="h-auto py-4">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 mx-auto mb-2" />
                <div className="font-semibold">{t('dashboard.quickActions.syncAll')}</div>
                <div className="text-xs text-muted-foreground">{t('dashboard.quickActions.syncAllDesc')}</div>
              </div>
            </Button>
            <Button variant="outline" className="h-auto py-4">
              <div className="text-center">
                <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                <div className="font-semibold">{t('dashboard.quickActions.viewErrors')}</div>
                <div className="text-xs text-muted-foreground">{t('dashboard.quickActions.viewErrorsDesc')}</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
