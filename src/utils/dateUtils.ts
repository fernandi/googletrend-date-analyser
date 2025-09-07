export type ObservedDate = {
  id: string;
  day: number; // 1-31
  month: number; // 1-12
  year: number; // full year
};

export const FRENCH_MONTHS = [
  'janvier',
  'février',
  'mars',
  'avril',
  'mai',
  'juin',
  'juillet',
  'août',
  'septembre',
  'octobre',
  'novembre',
  'décembre',
] as const;

export function formatKeywordFromDate(day: number, month: number): string {
  const monthIndex = month - 1;
  const monthName = FRENCH_MONTHS[monthIndex] ?? '';
  // Keyword format: "JJ mois" (no leading zero expected by Trends UI)
  return `${day} ${monthName}`;
}

export function toISODateString(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function makeDateFromObserved(d: ObservedDate): Date {
  // Construct at noon to avoid DST issues impacting date arithmetic
  const date = new Date(Date.UTC(d.year, d.month - 1, d.day, 12, 0, 0));
  return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

export function addDays(base: Date, days: number): Date {
  const result = new Date(base);
  result.setDate(result.getDate() + days);
  return result;
}

export type RelativeWindow = {
  startOffsetDays: number; // negative number up to -30
  endOffsetDays: number; // <= 0 (0 means day J)
};

export function computeTimeRangeISO(
  observed: ObservedDate,
  window: RelativeWindow,
  today: Date = new Date()
): { start: string; end: string } {
  const eventDate = makeDateFromObserved(observed);
  const startCandidate = addDays(eventDate, window.startOffsetDays);
  const endCandidate = addDays(eventDate, window.endOffsetDays);

  const end = endCandidate > today ? today : endCandidate;
  const start = startCandidate > end ? end : startCandidate;

  return { start: toISODateString(start), end: toISODateString(end) };
}

export function observedLabel(d: ObservedDate): string {
  return `${d.day} ${FRENCH_MONTHS[d.month - 1]} ${d.year}`;
}

function pad2(n: number): string {
  return `${n}`.padStart(2, '0');
}

export function stableIdForDate(d: { year: number; month: number; day: number }): string {
  return `d-${d.year}-${pad2(d.month)}-${pad2(d.day)}`;
}

export function serializeDates(dates: ObservedDate[]): string {
  // Format: YYYY-MM-DD,YYYY-MM-DD,...
  return dates
    .map((d) => `${d.year}-${pad2(d.month)}-${pad2(d.day)}`)
    .join(',');
}

export function deserializeDates(param: string | null | undefined): ObservedDate[] | null {
  if (!param) return null;
  const parts = param
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const result: ObservedDate[] = [];
  for (const p of parts) {
    const m = p.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) continue;
    const year = parseInt(m[1], 10);
    const month = parseInt(m[2], 10);
    const day = parseInt(m[3], 10);
    result.push({ id: stableIdForDate({ year, month, day }), year, month, day });
  }
  return result.length ? result : null;
}


