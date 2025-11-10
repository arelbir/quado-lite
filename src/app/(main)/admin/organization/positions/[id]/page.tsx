import { notFound } from "next/navigation";
import { db } from "@/drizzle/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Users, FileText, Hash } from "lucide-react";
import { getTranslations } from 'next-intl/server';
import { cookies } from 'next/headers';
import { defaultLocale, type Locale, locales } from '@/i18n/config';

export default async function PositionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = cookies();
  const localeCookie = cookieStore.get('NEXT_LOCALE');
  const locale = (localeCookie?.value && locales.includes(localeCookie.value as Locale)) 
    ? (localeCookie.value as Locale)
    : defaultLocale;
  
  const t = await getTranslations({ locale, namespace: 'organization' });
  const tCommon = await getTranslations({ locale, namespace: 'common' });
  
  const position = await db.query.positions.findFirst({
    where: (positions, { eq }) => eq(positions.id, id),
  });

  if (!position) {
    notFound();
  }

  // Count users with this position
  const usersWithPosition = await db.query.user.findMany({
    where: (users, { eq }) => eq(users.positionId, id),
    columns: {
      id: true,
      name: true,
      email: true,
    },
  });

  const levelColors: Record<string, string> = {
    "10": "bg-purple-100 text-purple-800",
    "9": "bg-indigo-100 text-indigo-800",
    "8": "bg-blue-100 text-blue-800",
    "7": "bg-cyan-100 text-cyan-800",
    "6": "bg-teal-100 text-teal-800",
    "5": "bg-green-100 text-green-800",
    "4": "bg-lime-100 text-lime-800",
    "3": "bg-yellow-100 text-yellow-800",
    "2": "bg-orange-100 text-orange-800",
    "1": "bg-red-100 text-red-800",
  };

  const getLevelLabel = (level: string) => {
    return t(`positions.levels.${level}`);
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{position.name}</h1>
          <p className="text-muted-foreground">{t('positions.fields.name')} {tCommon('labels.details')}</p>
        </div>
        <Badge className={position.isActive ? "bg-green-100 text-green-800" : ""} variant={position.isActive ? "default" : "secondary"}>
          {position.isActive ? tCommon('status.active') : tCommon('status.inactive')}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              {t('positions.fields.basicInformation')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">{t('positions.fields.name')}</label>
              <p className="text-base font-medium">{position.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">{t('positions.fields.code')}</label>
              <p className="text-base font-medium">{position.code}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">{t('positions.fields.level')}</label>
              <div className="mt-1">
                <Badge className={position.level ? (levelColors[position.level] || "bg-gray-100 text-gray-800") : "bg-gray-100 text-gray-800"}>
                  {position.level ? `${tCommon('labels.level')} ${position.level} - ${getLevelLabel(position.level)}` : tCommon('labels.noLevelAssigned')}
                </Badge>
              </div>
            </div>
            {position.category && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">{t('positions.fields.category')}</label>
                <Badge variant="outline" className="mt-1">{position.category}</Badge>
              </div>
            )}
            {position.salaryGrade && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">{t('positions.fields.salaryGrade')}</label>
                <p className="text-base font-mono">{position.salaryGrade}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Description */}
        {position.description && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {t('positions.fields.description')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{position.description}</p>
            </CardContent>
          </Card>
        )}

        {/* Users */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Employees
            </CardTitle>
            <CardDescription>{usersWithPosition.length} employee(s) in this position</CardDescription>
          </CardHeader>
          <CardContent>
            {usersWithPosition.length > 0 ? (
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {usersWithPosition.map((user) => (
                  <Card key={user.id}>
                    <CardContent className="pt-6">
                      <p className="font-medium">{user.name}</p>
                      {user.email && (
                        <a href={`mailto:${user.email}`} className="text-sm text-primary hover:underline">
                          {user.email}
                        </a>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No employees assigned to this position</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
