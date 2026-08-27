/** Local calendar day as yyyy-MM-dd. All FOD day keys use this format. */

export function localDateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function toDateKey(value: Date | string | undefined | null): string {
  if (value == null) return localDateKey();
  if (typeof value === "string") {
    const match = value.match(/^(\d{4}-\d{2}-\d{2})/);
    if (match) return match[1];
  }
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return localDateKey();
  return localDateKey(d);
}

export function dateKeyToLocalDate(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1, 12, 0, 0, 0);
}

export function addDaysKey(key: string, days: number): string {
  const d = dateKeyToLocalDate(key);
  d.setDate(d.getDate() + days);
  return localDateKey(d);
}

export function weekEndDateKey(date: Date = new Date()): string {
  const end = new Date(date);
  const daysUntilSunday = (7 - date.getDay()) % 7;
  end.setDate(date.getDate() + daysUntilSunday);
  return localDateKey(end);
}

export function daysUntil(deadlineKey: string, fromKey = localDateKey()): number {
  const a = dateKeyToLocalDate(fromKey).getTime();
  const b = dateKeyToLocalDate(deadlineKey).getTime();
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

export function localMidnight(): Date {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate());
}
