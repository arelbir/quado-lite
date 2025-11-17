import { Header, HeaderSkeleton } from '@/components/layout/header'
import { Sidebar, SidebarSkeleton } from '@/components/layout/sidebar'
import { auth } from '@/server/auth';
import { SessionProvider } from 'next-auth/react';
import React, { Suspense } from 'react'
import { cookies } from 'next/headers';
import { defaultLocale, type Locale, locales } from '@/i18n/config';




export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  
  // Get locale from cookie
  // cookies() returns Promise in Next.js 14.2.3+
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get('NEXT_LOCALE');
  const locale = (localeCookie?.value && locales.includes(localeCookie.value as Locale)) 
    ? (localeCookie.value as Locale)
    : defaultLocale;

  return (
    <SessionProvider session={session}>
      <div className=" min-h-screen w-full flex">
        <div className="sticky bg-background top-0 h-screen z-[49]">
          <Suspense fallback={<SidebarSkeleton />}>
            <Sidebar userId={session?.user?.id} locale={locale} />
          </Suspense>
        </div>
        <div className="flex flex-col flex-1">
          <div className="sticky bg-background top-0 z-[49]">
            <Suspense fallback={<HeaderSkeleton />}>
              <Header />
            </Suspense>
          </div>
          <div className='relative h-full p-6'>
            {children}
          </div>
        </div>
      </div>
    </SessionProvider>
  )
}
