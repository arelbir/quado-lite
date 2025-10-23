/**
 * Number Formatter
 * Format numbers, percentages, counts
 */

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return "-";
  return value.toLocaleString("tr-TR");
}

export function formatPercentage(value: number | null | undefined, decimals: number = 1): string {
  if (value === null || value === undefined) return "-";
  return `${value.toFixed(decimals)}%`;
}

export function formatCount(value: number | null | undefined): string {
  if (value === null || value === undefined) return "0";
  return value.toString();
}

export function formatDecimal(value: number | null | undefined, decimals: number = 2): string {
  if (value === null || value === undefined) return "-";
  return value.toFixed(decimals);
}

/**
 * Calculate percentage
 */
export function calculatePercentage(part: number, total: number): number {
  if (total === 0) return 0;
  return (part / total) * 100;
}

/**
 * Format completion rate
 */
export function formatCompletionRate(completed: number, total: number): string {
  if (total === 0) return "0%";
  const percentage = calculatePercentage(completed, total);
  return formatPercentage(percentage);
}
