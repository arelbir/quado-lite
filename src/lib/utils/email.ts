/**
 * Email Utilities
 * Normalize email addresses for consistent validation
 */

/**
 * Convert Turkish characters to ASCII for email
 * Used in both seed and login to ensure consistency
 */
export function normalizeEmailForLogin(email: string): string {
  return email
    .trim()
    .toLowerCase()
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ı/g, 'i')
    .replace(/İ/g, 'i')
    .replace(/i̇/g, 'i')  // Combining dot above
    .replace(/ö/g, 'o')
    .replace(/ş/g, 's')
    .replace(/ü/g, 'u')
    .replace(/\s+/g, '')  // Remove all whitespace
    .normalize('NFD')      // Normalize Unicode
    .replace(/[\u0300-\u036f]/g, ''); // Remove combining diacritical marks
}
