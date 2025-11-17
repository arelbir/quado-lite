'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { locales, localeNames, localeFlags, type Locale, defaultLocale } from '@/core/i18n/config';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';

// Helper to get cookie value
function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
}

// Helper to set cookie
function setCookie(name: string, value: string, days: number = 365) {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/`;
}

export function LanguageSwitcher() {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [currentLocale, setCurrentLocale] = React.useState<Locale>(defaultLocale);

  // Get locale from cookie on mount
  React.useEffect(() => {
    const savedLocale = getCookie('NEXT_LOCALE') as Locale;
    if (savedLocale && locales.includes(savedLocale)) {
      setCurrentLocale(savedLocale);
    }
  }, []);

  const switchLocale = (newLocale: Locale) => {
    startTransition(() => {
      // Save to cookie
      setCookie('NEXT_LOCALE', newLocale);
      setCurrentLocale(newLocale);
      
      // Refresh page to apply new locale
      router.refresh();
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          disabled={isPending}
          className="gap-2"
        >
          <Languages className="h-4 w-4" />
          <span className="hidden sm:inline">{localeFlags[currentLocale]}</span>
          <span className="hidden md:inline">{localeNames[currentLocale]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => switchLocale(loc)}
            className="gap-2"
            disabled={loc === currentLocale}
          >
            <span>{localeFlags[loc]}</span>
            <span>{localeNames[loc]}</span>
            {loc === currentLocale && (
              <span className="ml-auto text-xs text-muted-foreground">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
