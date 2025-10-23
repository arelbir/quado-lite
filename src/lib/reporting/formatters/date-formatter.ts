/**
 * Date Formatter
 * Turkish date formatting utilities
 */

export type DateFormatType = "short" | "long" | "datetime" | "time";

export function formatDate(date: Date | string | null | undefined, format: DateFormatType = "short"): string {
  if (!date) return "-";
  
  const d = typeof date === "string" ? new Date(date) : date;
  
  if (isNaN(d.getTime())) return "-";

  switch (format) {
    case "short":
      return d.toLocaleDateString("tr-TR");
    
    case "long":
      return d.toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    
    case "datetime":
      return d.toLocaleString("tr-TR", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    
    case "time":
      return d.toLocaleTimeString("tr-TR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    
    default:
      return d.toLocaleDateString("tr-TR");
  }
}

/**
 * Calculate days between two dates
 */
export function calculateDaysBetween(startDate: Date | string, endDate: Date | string = new Date()): number {
  const start = typeof startDate === "string" ? new Date(startDate) : startDate;
  const end = typeof endDate === "string" ? new Date(endDate) : endDate;
  
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * Format date range
 */
export function formatDateRange(startDate: Date | string, endDate: Date | string): string {
  return `${formatDate(startDate, "short")} - ${formatDate(endDate, "short")}`;
}

/**
 * Format relative time (e.g., "2 gün önce")
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Bugün";
  if (diffDays === 1) return "Dün";
  if (diffDays < 7) return `${diffDays} gün önce`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} hafta önce`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} ay önce`;
  return `${Math.floor(diffDays / 365)} yıl önce`;
}
