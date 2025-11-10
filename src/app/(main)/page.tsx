import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardStats, getMyTaskCounts } from "@/server/actions/dashboard-actions";
import { ClipboardCheck, AlertCircle, CheckCircle2, FileText, ArrowRight, Users, Building2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function Dashboard() {
  const [statsResult, tasksResult] = await Promise.all([
    getDashboardStats(),
    getMyTaskCounts(),
  ]);

  const stats = statsResult.success ? statsResult.data : null;
  const tasks = tasksResult.success ? tasksResult.data : null;

  return (
    <main className="flex flex-1 flex-col gap-6 p-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Kontrol Paneli</h1>
        <p className="text-muted-foreground mt-1">
          Denetim yönetim sistemi genel bakış ve bekleyen işlemler
        </p>
      </div>

      {/* Pending Tasks Summary - Highlighted */}
      {tasks && tasks.total > 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-orange-900 dark:text-orange-100 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Bekleyen İşlerim
            </CardTitle>
            <CardDescription className="text-orange-700 dark:text-orange-300">
              Toplam {tasks.total} adet bekleyen göreviniz var
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/denetim/actions" className="group">
              <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-lg border border-orange-100 dark:border-orange-900 group-hover:border-orange-300 dark:group-hover:border-orange-700 transition-colors">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Aksiyonlar</p>
                  <p className="text-2xl font-bold text-orange-600">{tasks.actions}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-orange-400" />
              </div>
            </Link>

            <Link href="/denetim/dofs" className="group">
              <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-lg border border-orange-100 dark:border-orange-900 group-hover:border-orange-300 dark:group-hover:border-orange-700 transition-colors">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">DÖF'ler</p>
                  <p className="text-2xl font-bold text-orange-600">{tasks.dofs}</p>
                </div>
                <FileText className="h-8 w-8 text-orange-400" />
              </div>
            </Link>

            <Link href="/denetim/actions" className="group">
              <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-lg border border-orange-100 dark:border-orange-900 group-hover:border-orange-300 dark:group-hover:border-orange-700 transition-colors">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Onaylar</p>
                  <p className="text-2xl font-bold text-orange-600">{tasks.approvals}</p>
                </div>
                <ClipboardCheck className="h-8 w-8 text-orange-400" />
              </div>
            </Link>

            <Link href="/denetim/findings" className="group">
              <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-lg border border-orange-100 dark:border-orange-900 group-hover:border-orange-300 dark:group-hover:border-orange-700 transition-colors">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Bulgular</p>
                  <p className="text-2xl font-bold text-orange-600">{tasks.findings}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-orange-400" />
              </div>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Statistics Overview */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Audits Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Denetimler</CardTitle>
              <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.audits.total}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.audits.mine} adet benim denetimim
              </p>
              <Link href="/denetim/audits">
                <Button variant="link" className="px-0 mt-2 h-auto">
                  Denetimleri Görüntüle <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Findings Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bulgular</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.findings.total}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.findings.mine} adet bekleyen bulgum
              </p>
              <Link href="/denetim/findings">
                <Button variant="link" className="px-0 mt-2 h-auto">
                  Bulguları Görüntüle <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Actions Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aksiyonlar</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.actions.total}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.actions.mine} adet bekleyen aksiyonum
              </p>
              <Link href="/denetim/actions">
                <Button variant="link" className="px-0 mt-2 h-auto">
                  Aksiyonları Görüntüle <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* DOFs Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">DÖF'ler</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.dofs.total}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.dofs.mine} adet bekleyen DÖF'üm
              </p>
              <Link href="/denetim/dofs">
                <Button variant="link" className="px-0 mt-2 h-auto">
                  DÖF'leri Görüntüle <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Hızlı Erişim - Denetim</CardTitle>
            <CardDescription>
              Sık kullanılan denetim işlemleri
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Link href="/denetim/audits">
              <Button variant="outline" className="w-full justify-start">
                <ClipboardCheck className="mr-2 h-4 w-4" />
                Tüm Denetimler
              </Button>
            </Link>
            <Link href="/denetim/my-audits">
              <Button variant="outline" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                Benim Denetimlerim
              </Button>
            </Link>
            <Link href="/denetim/findings">
              <Button variant="outline" className="w-full justify-start">
                <AlertCircle className="mr-2 h-4 w-4" />
                Tüm Bulgular
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hızlı Erişim - Yönetim</CardTitle>
            <CardDescription>
              Admin ve organizasyon işlemleri
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Link href="/admin/users">
              <Button variant="outline" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                Kullanıcı Yönetimi
              </Button>
            </Link>
            <Link href="/admin/organization/companies">
              <Button variant="outline" className="w-full justify-start">
                <Building2 className="mr-2 h-4 w-4" />
                Organizasyon Yönetimi
              </Button>
            </Link>
            <Link href="/admin/workflows">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4" />
                İş Akışları
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
