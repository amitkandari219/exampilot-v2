/** Format a Date as YYYY-MM-DD string. */
export function toDateString(d: Date): string {
  return d.toISOString().split('T')[0];
}

/** Days from `from` (default: now) until `target`. Always >= 1. */
export function daysUntil(target: Date | string, from: Date | string = new Date()): number {
  const t = typeof target === 'string' ? new Date(target) : target;
  const f = typeof from === 'string' ? new Date(from) : from;
  return Math.max(1, Math.ceil((t.getTime() - f.getTime()) / 86400000));
}

/** Absolute days between two dates. */
export function daysBetween(a: Date | string, b: Date | string): number {
  const d1 = typeof a === 'string' ? new Date(a) : a;
  const d2 = typeof b === 'string' ? new Date(b) : b;
  return Math.abs(Math.round((d1.getTime() - d2.getTime()) / 86400000));
}

/** Return a Date that is `n` days before `from` (default: now). */
export function daysAgo(n: number, from: Date = new Date()): Date {
  const d = new Date(from);
  d.setDate(d.getDate() - n);
  return d;
}

/** Return today's date as YYYY-MM-DD. */
export function todayString(): string {
  return toDateString(new Date());
}
