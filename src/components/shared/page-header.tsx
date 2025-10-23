import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface PageHeaderProps {
  title: string;
  description?: string;
  backHref: string;
  backLabel?: string;
}

/**
 * Reusable Page Header Component
 * DRY: Tüm create/edit sayfalarda kullanılır
 */
export function PageHeader({ 
  title, 
  description, 
  backHref, 
  backLabel = "Geri" 
}: PageHeaderProps) {
  return (
    <div className="flex items-center gap-4">
      <Button variant="ghost" size="sm" asChild>
        <Link href={backHref}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {backLabel}
        </Link>
      </Button>
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
}
