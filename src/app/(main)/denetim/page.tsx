import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { getFindings } from "@/action/finding-actions";
import { getMyActions } from "@/action/action-actions";
import { getMyDofs } from "@/action/dof-actions";
import { 
  ClipboardCheck, 
  AlertCircle, 
  CheckCircle2, 
  Clock 
} from "lucide-react";
import Link from "next/link";

export default async function DenetimDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Denetim Sistemi</h1>
        <p className="text-muted-foreground">
          Bulgular, Aksiyonlar ve DÖF takip sistemi
        </p>
      </div>

      <Suspense fallback={<StatsLoading />}>
        <StatsCards />
      </Suspense>

      <div className="grid gap-6 md:grid-cols-2">
        <Suspense fallback={<div>Yükleniyor...</div>}>
          <RecentFindings />
        </Suspense>

        <Suspense fallback={<div>Yükleniyor...</div>}>
          <MyTasks />
        </Suspense>
      </div>
    </div>
  );
}

async function StatsCards() {
  const findings = await getFindings();
  const actions = await getMyActions();
  const dofs = await getMyDofs();

  const stats = [
    {
      title: "Toplam Bulgu",
      value: findings.length,
      description: "Aktif bulgular",
      icon: AlertCircle,
      color: "text-orange-600",
    },
    {
      title: "Bekleyen Aksiyonlar",
      value: actions.filter(a => a.status !== "Completed").length,
      description: "Tamamlanmayı bekliyor",
      icon: Clock,
      color: "text-yellow-600",
    },
    {
      title: "Aktif DÖF",
      value: dofs.filter(d => d.status !== "Completed").length,
      description: "İşlemde olan DÖF'ler",
      icon: ClipboardCheck,
      color: "text-primary",
    },
    {
      title: "Tamamlanan",
      value: findings.filter(f => f.status === "Completed").length,
      description: "Kapatılan bulgular",
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
  const findings = await getFindings();
  const recentFindings = findings.slice(0, 5);

  const statusColors: Record<string, string> = {
    New: "bg-gray-100 text-gray-800",
    Assigned: "bg-blue-100 text-blue-800",
    InProgress: "bg-yellow-100 text-yellow-800",
    PendingAuditorClosure: "bg-purple-100 text-purple-800",
    Completed: "bg-green-100 text-green-800",
  };

  const statusLabels: Record<string, string> = {
    New: "Yeni",
    Assigned: "Atandı",
    InProgress: "İşlemde",
    PendingAuditorClosure: "Onay Bekliyor",
    Completed: "Tamamlandı",
    Rejected: "Reddedildi",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Son Bulgular</CardTitle>
        <CardDescription>En son eklenen bulgular</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentFindings.length === 0 ? (
            <p className="text-sm text-muted-foreground">Henüz bulgu yok</p>
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
                      {finding.audit?.title || "Denetim"}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${statusColors[finding.status]}`}>
                    {statusLabels[finding.status]}
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
  const actions = await getMyActions();
  const myPendingActions = actions.filter(a => 
    a.status === "Assigned" || a.status === "PendingManagerApproval"
  ).slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Görevlerim</CardTitle>
        <CardDescription>Bekleyen aksiyon ve onaylar</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {myPendingActions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              🎉 Bekleyen görev yok!
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
                    {action.status === "Assigned" ? "Sorumlu" : "Onay Bekliyor"}
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
