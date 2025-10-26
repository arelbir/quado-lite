import { Icons } from "@/components/icons";
import { MenuWithChildren, session } from "@/drizzle/schema";
import { getUserPermissions } from "@/server/data/permissions";
import { LucideIcon } from "lucide-react";
import { MenuItem, SidebarContainer } from "./sidebar-container";
import { Skeleton } from "@/components/ui/skeleton";
import { getTranslations } from 'next-intl/server';

/**
 * Helper function to translate menu labels
 * Database labels are used directly as translation keys
 */
function translateLabel(t: any, key: string): string {
  try {
    // Try to translate with "menu." prefix
    const translationKey = `menu.${key}`;
    return t(translationKey);
  } catch {
    // Fallback: return original key if translation not found
    return key;
  }
}

function buildMenu(menus: MenuWithChildren[], t: any): MenuItem[] {
  return menus.map(menu => {
    const Icon = Icons[menu.icon as keyof typeof Icons] as LucideIcon || Icons.Package
    
    // Translate label using translation key from database
    const translatedLabel = translateLabel(t, menu.label);
    
    return {
      path: menu.path,
      label: translatedLabel,
      icon: <Icon className='size-4' />,
      children: menu.children && menu.children.length > 0 ? buildMenu(menu.children, t) : []
    }
  })
}

export const Sidebar = async ({ userId, locale }: { userId?: string; locale: string }) => {
  const permissions = await getUserPermissions({ userId });

  if (!permissions) return null;

  // Get translations for navigation with explicit locale
  const t = await getTranslations({ locale, namespace: 'navigation' });
  
  const routes = buildMenu(permissions.menus, t)
  return <SidebarContainer routes={routes} />;
};

export const SidebarSkeleton = () => {
  return (
    <div className="h-screen w-72 border-r" >
      <div className="border-b">
        <Skeleton className="h-12 w-4/5 mx-auto my-4" />
      </div>
      <div className="mx-auto px-4 space-y-2 my-4">
        {
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-4/5 mx-auto" />
          ))
        }
      </div>
    </div>
  )
}
