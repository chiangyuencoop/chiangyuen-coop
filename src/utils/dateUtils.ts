import { NewsItem } from '../types';

/**
 * Parses a date string (supporting both CE e.g. 2024-03-15 and Thai Buddhist Era BE e.g. 2567-03-15 or 2568-01-01)
 * into a numerical timestamp for accurate comparison.
 */
export function parseDateToTimestamp(dateStr?: string): number {
  if (!dateStr || typeof dateStr !== 'string') return 0;

  const trimmed = dateStr.trim();
  if (!trimmed) return 0;

  // Check for YYYY-MM-DD or YYYY/MM/DD or YYYY.MM.DD
  const ymdMatch = trimmed.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (ymdMatch) {
    let year = parseInt(ymdMatch[1], 10);
    const month = parseInt(ymdMatch[2], 10) - 1;
    const day = parseInt(ymdMatch[3], 10);

    // If year is in Thai Buddhist Era (BE > 2400), convert to CE for proper Date object
    if (year > 2400) {
      year -= 543;
    }
    return new Date(year, month, day).getTime();
  }

  // Check for DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = trimmed.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10) - 1;
    let year = parseInt(dmyMatch[3], 10);
    if (year > 2400) {
      year -= 543;
    }
    return new Date(year, month, day).getTime();
  }

  // Standard Date.parse fallback
  const parsed = Date.parse(trimmed);
  if (!isNaN(parsed)) {
    return parsed;
  }

  return 0;
}

/**
 * Compares two NewsItems so that newest items appear first (Descending by publishDate / createdAt).
 */
export function compareNewsDescending(a: NewsItem, b: NewsItem): number {
  const timeA = parseDateToTimestamp(a.publishDate || a.createdAt);
  const timeB = parseDateToTimestamp(b.publishDate || b.createdAt);

  if (timeB !== timeA) {
    return timeB - timeA;
  }

  // Fallback to createdAt comparison if publishDate matches
  const createdA = a.createdAt ? parseDateToTimestamp(a.createdAt) : 0;
  const createdB = b.createdAt ? parseDateToTimestamp(b.createdAt) : 0;
  if (createdB !== createdA) {
    return createdB - createdA;
  }

  // Fallback to string comparison
  return (b.id || '').localeCompare(a.id || '');
}

/**
 * Formats date into standard Thai display
 */
export function formatThaiDate(dateStr?: string): string {
  if (!dateStr) return '';
  const trimmed = dateStr.trim();

  const thaiMonths = [
    'ม.ค.',
    'ก.พ.',
    'มี.ค.',
    'เม.ย.',
    'พ.ค.',
    'มิ.ย.',
    'ก.ค.',
    'ส.ค.',
    'ก.ย.',
    'ต.ค.',
    'พ.ย.',
    'ธ.ค.',
  ];

  const ymdMatch = trimmed.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (ymdMatch) {
    let year = parseInt(ymdMatch[1], 10);
    const monthIndex = parseInt(ymdMatch[2], 10) - 1;
    const day = parseInt(ymdMatch[3], 10);
    const beYear = year < 2400 ? year + 543 : year;
    const monthName = thaiMonths[monthIndex] || `เดือน ${monthIndex + 1}`;
    return `${day} ${monthName} ${beYear}`;
  }

  return trimmed;
}
