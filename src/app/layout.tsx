import { Provider } from "@/components/provider";
import { TailwindIndicator } from "@/components/shared/tailwind-indicator";
import { Toaster } from "@/components/ui/sonner";
import { ViewTransitions } from 'next-view-transitions'
import HolyLoader from "holy-loader";
import "@/styles/globals.css";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { cookies } from 'next/headers';
import { defaultLocale, type Locale, locales } from '@/i18n/config';

import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export async function generateMetadata() {
  const t = await getTranslations('common');
  
  return {
    title: t('app.name'),
    description: t('app.description'),
    icons: [{ rel: "icon", url: "/favicon.ico" }],
  };
}

type RootLayoutProps = {
  children: React.ReactNode;
};

export default async function RootLayout({ children }: RootLayoutProps) {
  // Get locale from cookie
  const cookieStore = cookies();
  const localeCookie = cookieStore.get('NEXT_LOCALE');
  const locale = (localeCookie?.value && locales.includes(localeCookie.value as Locale)) 
    ? (localeCookie.value as Locale)
    : defaultLocale;

  // Get messages for the current locale
  const messages = await getMessages({ locale });

  return (
    <ViewTransitions>
      <html lang={locale} suppressHydrationWarning>
        <body vaul-drawer-wrapper="" className={`font-sans ${inter.variable}`}>
          <HolyLoader />
          <NextIntlClientProvider messages={messages}>
            <Provider>
              {children}
              <TailwindIndicator />
              <Toaster richColors />
            </Provider>
          </NextIntlClientProvider>
        </body>
      </html>
    </ViewTransitions>
  );
}
