/**
 * Time and Duration Utilities for Indian Standard Time (IST - Asia/Kolkata)
 */

/**
 * Formats a decimal hour value (e.g. 1.0833...) into a human-readable string.
 *
 * Examples:
 *   formatHours(22)       → "22h"
 *   formatHours(21.0833)  → "21h 5min"
 *   formatHours(0.833)    → "50min"
 *   formatHours(0)        → "0h"
 */
export function formatHours(hours: number): string {
  if (!hours || hours <= 0) return '0h';

  const totalMinutes = Math.round(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;

  if (h > 0 && m > 0) return `${h}h ${m}min`;
  if (h > 0) return `${h}h`;
  return `${m}min`;
}

/**
 * Formats an ISO string or Date into Indian Standard Time (IST) 12-hour format (e.g., "05:00 AM", "10:30 PM").
 */
export function formatTimeIST(dateOrIso?: string | Date | null): string {
  if (!dateOrIso) return '';
  try {
    const d = typeof dateOrIso === 'string' ? new Date(dateOrIso) : dateOrIso;
    if (isNaN(d.getTime())) return typeof dateOrIso === 'string' ? dateOrIso : '';
    return new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(d);
  } catch {
    return '';
  }
}

/**
 * Formats an ISO string or Date into Indian Standard Time (IST) Date string (e.g., "22 Aug 2026" or "Sat, 22 Aug").
 */
export function formatDateIST(dateOrIso?: string | Date | null, includeYear = true): string {
  if (!dateOrIso) return '';
  try {
    const d = typeof dateOrIso === 'string' ? new Date(dateOrIso) : dateOrIso;
    if (isNaN(d.getTime())) return '';
    return new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: 'numeric',
      month: 'short',
      ...(includeYear ? { year: 'numeric' } : { weekday: 'short' }),
    }).format(d);
  } catch {
    return '';
  }
}

/**
 * Formats start and duration / end ISO into a clear IST range (e.g., "05:00 AM – 06:00 AM").
 */
export function formatTimeRangeIST(startIso?: string | Date | null, durationMinutes = 60): string {
  if (!startIso) return '';
  try {
    const start = typeof startIso === 'string' ? new Date(startIso) : startIso;
    if (isNaN(start.getTime())) return '';
    const end = new Date(start.getTime() + durationMinutes * 60000);
    const startStr = formatTimeIST(start);
    const endStr = formatTimeIST(end);
    return `${startStr} – ${endStr}`;
  } catch {
    return '';
  }
}
