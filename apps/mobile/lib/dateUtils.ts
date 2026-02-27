/** Format a Date as YYYY-MM-DD string */
export function toDateString(d: Date): string {
  return d.toISOString().split('T')[0];
}
