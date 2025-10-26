import { db } from "@/drizzle/db";
import { audits } from "@/drizzle/schema";
import { currentUser } from "@/lib/auth";
import { eq, and, isNull, gte, inArray, not } from "drizzle-orm";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, ClipboardCheck, AlertCircle, Play, Eye } from "lucide-react";
import Link from "next/link";
import { AUDIT_STATUS_LABELS, AUDIT_STATUS_COLORS } from "@/lib/constants/status-labels";
import { getTranslations } from 'next-intl/server';
import { cookies } from 'next/headers';
import { defaultLocale, type Locale, locales } from '@/i18n/config';

/**
 * My Audits Page - Denetimlerim
 * Sadece benim denetimlerim, son 1 yıl içinde, aktif olanlar
 */
export default async function MyAuditsPage() {
  const cookieStore = cookies();
  const localeCookie = cookieStore.get('NEXT_LOCALE');
  const locale = (localeCookie?.value && locales.includes(localeCookie.value as Locale)) 
    ? (localeCookie.value as Locale)
    : defaultLocale;
  
  const t = await getTranslations({ locale, namespace: 'audit.myAudits' });
  const user = await currentUser();
  
  if (!user) {
    redirect("/auth/login");
  }

  // 1 yıl öncesi tarihi hesapla
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  // Benim denetimlerim - aktif olanlar (Closed ve Archived hariç)
  const myAudits = await db.query.audits.findMany({
    where: and(
      eq(audits.createdById, user.id),
      isNull(audits.deletedAt),
      not(inArray(audits.status, ["Closed", "Archived"])),
      gte(audits.createdAt, oneYearAgo)
    ),
    orderBy: (audits, { desc }) => [desc(audits.createdAt)],
  });

  // Status colors ve labels merkezi constants'tan alınıyor

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">
          {t('description')}
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">{t('stats.total')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myAudits.length}</div>
            <p className="text-xs text-muted-foreground">{t('stats.totalDescription')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">{t('stats.active')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {myAudits.filter(a => a.status === "Active").length}
            </div>
            <p className="text-xs text-muted-foreground">{t('stats.activeDescription')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">{t('stats.inReview')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {myAudits.filter(a => a.status === "InReview" || a.status === "PendingClosure").length}
            </div>
            <p className="text-xs text-muted-foreground">{t('stats.inReviewDescription')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Denetim Listesi */}
      <Card>
        <CardHeader>
          <CardTitle>{t('activeAudits')}</CardTitle>
        </CardHeader>
        <CardContent>
          {myAudits.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t('noAudits')}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t('noAuditsDescription')}
              </p>
              <Button asChild>
                <Link href="/denetim/all">
                  {t('viewAll')}
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {myAudits.map((audit) => (
                <Card key={audit.id} className="hover:bg-accent/50 transition-colors">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{audit.title}</h4>
                          <Badge className={`text-xs ${AUDIT_STATUS_COLORS[audit.status as keyof typeof AUDIT_STATUS_COLORS] || ""}`}>
                            {AUDIT_STATUS_LABELS[audit.status as keyof typeof AUDIT_STATUS_LABELS] || audit.status}
                          </Badge>
                        </div>
                        {audit.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {audit.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>
                            {t('auditDate')}: {audit.auditDate 
                              ? new Date(audit.auditDate).toLocaleDateString("tr-TR")
                              : t('notSet')
                            }
                          </span>
                          <span>•</span>
                          <span>
                            {t('createdAt')}: {new Date(audit.createdAt).toLocaleDateString("tr-TR")}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button asChild size="sm" variant={audit.status === "Active" ? "default" : "outline"}>
                          <Link href={`/denetim/audits/${audit.id}`}>
                            {audit.status === "Active" ? (
                              <>
                                <Play className="h-4 w-4 mr-2" />
                                {t('startAudit')}
                              </>
                            ) : (
                              <>
                                <Eye className="h-4 w-4 mr-2" />
                                {t('viewDetails')}
                              </>
                            )}
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
