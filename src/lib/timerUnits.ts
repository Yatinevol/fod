export function hoursToMinutes(hours: number): number {
  return Math.max(0, Math.round(hours * 60));
}

/** UI shows hours; DB stores minutes. Values 1–24 are treated as legacy hour locks. */
export function storedTargetToMinutes(stored: number | undefined | null): number {
  if (stored == null || Number.isNaN(stored) || stored <= 0) return 0;
  if (stored <= 24) return hoursToMinutes(stored);
  return stored;
}

export function minutesToHours(minutes: number): number {
  if (!minutes) return 0;
  return Math.round((minutes / 60) * 100) / 100;
}

export function elapsedMinutesFromSeconds(elapsedSeconds: number): number {
  return Math.max(0, Math.floor(elapsedSeconds / 60));
}

export function secondsToHms(total: number) {
  const s = Math.max(0, Math.floor(total));
  return {
    hours: Math.floor(s / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
}

export function hmsToSeconds(hours: number, minutes: number, seconds: number) {
  return Math.max(0, hours * 3600 + minutes * 60 + seconds);
}
