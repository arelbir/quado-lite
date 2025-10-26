import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { getFindings } from "@/server/actions/finding-actions";
import { getMyActions } from "@/server/actions/action-actions";
import { getMyDofs } from "@/server/actions/dof-actions";
import { 
  ClipboardCheck, 
  AlertCircle, 
  CheckCircle2, 
  Clock 
} from "lucide-react";
import Link from "next/link";
import { FINDING_STATUS_LABELS, FINDING_STATUS_COLORS } from "@/lib/constants/status-labels";
import { getTranslations } from 'next-intl/server';

export default async function DenetimDashboard() {
  const t = await getTranslations('dashboard');
  const tCommon = await getTranslations('common');
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">
          {t('description')}
        </p>
      </div>

      <Suspense fallback={<StatsLoading />}>
        <StatsCards />
      </Suspense>

      <div className="grid gap-6 md:grid-cols-2">
        <Suspense fallback={<div>{tCommon('status.loading')}</div>}>
          <RecentFindings />
        </Suspense>

        <Suspense fallback={<div>{tCommon('status.loading')}</div>}>
          <MyTasks />
        </Suspense>
      </div>
    </div>
  );
}

async function StatsCards() {
  const t = await getTranslations('dashboard.stats');
  const findings = await getFindings() as any[];
  const actions = await getMyActions() as any[];
  const dofs = await getMyDofs() as any[];

  const stats = [
    {
      title: t('totalFindings'),
      value: findings.length,
      description: t('activeFindings'),
      icon: AlertCircle,
      color: "text-orange-600",
    },
    {
      title: t('pendingActions'),
      value: actions.filter(a => a.status !== "Completed").length,
      description: t('waitingCompletion'),
      icon: Clock,
      color: "text-yellow-600",
    },
    {
      title: t('activeDofs'),
      value: dofs.filter(d => d.status !== "Completed").length,
      description: t('dofsInProgress'),
      icon: ClipboardCheck,
      color: "text-primary",
    },
    {
      title: t('completed'),
      value: findings.filter(f => f.status === "Completed").length,
      description: t('closedFindings'),
      icon: CheckCircle2,
      color: "text-green-600",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

async function RecentFindings() {
  const t = await getTranslations('dashboard');
  const findings = await getFindings() as any[];
  const recentFindings = findings.slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('recentFindings.title')}</CardTitle>
        <CardDescription>{t('recentFindings.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentFindings.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('recentFindings.noData')}</p>
          ) : (
            recentFindings.map((finding) => (
              <Link
                key={finding.id}
                href={`/denetim/findings/${finding.id}`}
                className="block hover:bg-accent p-3 rounded-lg transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {finding.details.substring(0, 60)}...
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {finding.audit?.title || t('recentFindings.audit')}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${FINDING_STATUS_COLORS[finding.status as keyof typeof FINDING_STATUS_COLORS]}`}>
                    {FINDING_STATUS_LABELS[finding.status as keyof typeof FINDING_STATUS_LABELS]}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

async function MyTasks() {
  const t = await getTranslations('dashboard');
  const actions = await getMyActions() as any[];
  const myPendingActions = actions.filter((a: any) => 
    a.status === "Assigned" || a.status === "InProgress"
  ).slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('myTasks.title')}</CardTitle>
        <CardDescription>{t('myTasks.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {myPendingActions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t('myTasks.noTasks')}
            </p>
          ) : (
            myPendingActions.map((action) => (
              <div
                key={action.id}
                className="flex items-start justify-between gap-4 p-3 rounded-lg border"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {action.details.substring(0, 50)}...
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {action.status === "Assigned" ? t('myTasks.responsible') : t('myTasks.waitingApproval')}
                  </p>
                </div>
                {action.status === "Assigned" ? (
                  <Clock className="h-4 w-4 text-yellow-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-purple-600" />
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function StatsLoading() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardHeader className="space-y-0 pb-2">
            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
          </CardHeader>
          <CardContent>
            <div className="h-8 w-16 bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
