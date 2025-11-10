import React from 'react';

import { Separator } from '@/components/ui/separator';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';

export const SidebarHeader = ({ collapsed }: { collapsed: boolean }) => {
  return (
    <>
      <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
        {/* Modern Q Logo with theme support */}
        <div className={cn(
          "relative flex items-center justify-center size-9 rounded-xl",
          "bg-gradient-to-br from-primary to-primary/80",
          "shadow-lg shadow-primary/20",
          "border border-primary/10",
          "transition-all duration-300 ease-in-out",
          "hover:shadow-xl hover:shadow-primary/30 hover:scale-105",
          "dark:shadow-primary/30 dark:border-primary/20"
        )}>
          <span className="text-primary-foreground font-bold text-xl tracking-tight">Q</span>
          {/* Subtle shine effect */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
        </div>
        
        <h1 className={cn(
          "opacity-100 visible block w-auto truncate transition-all duration-300",
          "font-semibold text-lg tracking-tight",
          "bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent",
          collapsed && "invisible hidden w-0 opacity-0"
        )}>
          Quado Lite
        </h1>
      </div>
      <Separator className="mt-4" />
    </>
  );
};
