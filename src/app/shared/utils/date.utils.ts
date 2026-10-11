/**
 * Date helpers working with ISO calendar strings (`YYYY-MM-DD`) in LOCAL time.
 * `new Date('2025-01-01')` is parsed as UTC and shifts a day back in Ecuador (UTC-5),
 * so dates are always built from their parts instead.
 * ISO strings compare correctly as plain strings: '2025-01-01' < '2025-02-01'.
 */

const pad = (n: number): string => String(n).padStart(2, '0');

export function toIsoDate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function todayIso(): string {
  return toIsoDate(new Date());
}

/** Adds whole years; Feb 29 falls back to Feb 28 on non-leap years. */
export function addYearsIso(iso: string, years: number): string {
  const [year, month, day] = iso.split('-').map(Number);
  const targetYear = year + years;
  const lastDayOfMonth = new Date(targetYear, month, 0).getDate();
  return toIsoDate(new Date(targetYear, month - 1, Math.min(day, lastDayOfMonth)));
}
