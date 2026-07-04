export const DAY = 24 * 60 * 60 * 1000;
export const HOUR = 60 * 60 * 1000;

/** Invites within this window count as "expiring soon". */
export const EXPIRING_WINDOW_MS = 2 * DAY;

/** A review waiting longer than this is over SLA and rendered as urgent.
 *  TODO(phase-3): make configurable per company. */
export const REVIEW_SLA_MS = 2 * DAY;

export function median(xs: number[]): number | null {
  if (xs.length === 0) return null;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2);
}

export function relativeTime(ts: number, nowMs: number, locale: string): string {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  const mins = Math.round((ts - nowMs) / 60000);
  if (Math.abs(mins) < 60) return rtf.format(mins, "minute");
  const hours = Math.round(mins / 60);
  if (Math.abs(hours) < 24) return rtf.format(hours, "hour");
  const days = Math.round(hours / 24);
  if (Math.abs(days) <= 7) return rtf.format(days, "day");
  return new Date(ts).toLocaleDateString(locale, { month: "short", day: "numeric" });
}

/** Compact duration for wait chips: "3d", "5h", "<1h". Locale-neutral. */
export function shortDuration(ms: number): string {
  if (ms >= DAY) return `${Math.floor(ms / DAY)}d`;
  if (ms >= HOUR) return `${Math.floor(ms / HOUR)}h`;
  return "<1h";
}
