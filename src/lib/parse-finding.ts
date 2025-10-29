/**
 * Otomatik bulgu metnini parse eder
 * Format: [Otomatik Bulgu] Soru: ... | Cevap: ... | Not: ...
 */
export interface ParsedFinding {
  isAutomatic: boolean;
  question?: string;
  answer?: string;
  notes?: string;
  rawText: string;
}

export function parseFindingDetails(details: string): ParsedFinding {
  const result: ParsedFinding = {
    isAutomatic: false,
    rawText: details,
  };

  // Otomatik bulgu kontrolü
  if (!details.includes("[Otomatik Bulgu]")) {
    return result;
  }

  result.isAutomatic = true;

  // Soru parse - pipe separator ile
  const questionMatch = details.match(/Soru:\s*(.+?)(?:\s*\|\s*Cevap:|$)/);
  if (questionMatch && questionMatch[1]) {
    result.question = questionMatch[1].trim();
  }

  // Cevap parse - pipe separator ile
  const answerMatch = details.match(/Cevap:\s*(.+?)(?:\s*\|\s*Not:|$)/);
  if (answerMatch && answerMatch[1]) {
    result.answer = answerMatch[1].trim();
  }

  // Not parse - pipe separator ile
  const notesMatch = details.match(/Not:\s*(.+?)$/);
  if (notesMatch && notesMatch[1]) {
    result.notes = notesMatch[1].trim();
  }

  return result;
}
