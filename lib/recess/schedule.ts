export type EpochStatus = "Open" | "Locked" | "Settled" | "Void";

export type Epoch = {
  id: string;
  label: string;
  openTime: number;
  lockTime: number;
  /**
   * The schedule alone only knows Open and Locked. Settled needs the reference
   * print, so only a RecessClient reports it.
   */
  status: "Open" | "Locked" | "Settled";
};

/** Corrective brief section 3.2. Holidays and shifts are listed here. */
export const SCHEDULE = {
  timeZone: "America/New_York",
  open: { weekday: 5, hour: 16, minute: 0 },
  lock: { weekday: 0, hour: 19, minute: 0 },
  /** TO AGREE. ISO dates on which the Friday close shifts. */
  holidays: [] as string[],
} as const;

const DAY = 86_400_000;

const PARTS = new Intl.DateTimeFormat("en-US", {
  timeZone: SCHEDULE.timeZone,
  hour12: false,
  year: "numeric", month: "2-digit", day: "2-digit",
  hour: "2-digit", minute: "2-digit", second: "2-digit",
  weekday: "short",
});

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function fields(utcMs: number) {
  const out: Record<string, string> = {};
  for (const p of PARTS.formatToParts(new Date(utcMs))) out[p.type] = p.value;
  return {
    year: +out.year, month: +out.month, day: +out.day,
    hour: +out.hour % 24, minute: +out.minute, second: +out.second,
    weekday: WEEKDAYS.indexOf(out.weekday),
  };
}

/** Offset of New York from UTC at this instant, in milliseconds. Negative. */
export function etOffsetMs(utcMs: number): number {
  const f = fields(utcMs);
  const asUtc = Date.UTC(f.year, f.month - 1, f.day, f.hour, f.minute, f.second);
  return asUtc - Math.floor(utcMs / 1000) * 1000;
}

/** UTC milliseconds for a wall-clock moment in New York. */
export function etToUtc(y: number, m: number, d: number, h: number, min: number): number {
  const guess = Date.UTC(y, m - 1, d, h, min);
  const corrected = guess - etOffsetMs(guess);
  return guess - etOffsetMs(corrected);
}

export function epochAt(nowMs: number): Epoch {
  const f = fields(nowMs);
  const backToFriday = (f.weekday - SCHEDULE.open.weekday + 7) % 7;
  let friday = etToUtc(f.year, f.month, f.day - backToFriday, SCHEDULE.open.hour, SCHEDULE.open.minute);
  if (friday > nowMs) {
    const g = fields(friday - 7 * DAY);
    friday = etToUtc(g.year, g.month, g.day, SCHEDULE.open.hour, SCHEDULE.open.minute);
  }

  const fri = fields(friday);
  const lock = etToUtc(fri.year, fri.month, fri.day + 2, SCHEDULE.lock.hour, SCHEDULE.lock.minute);
  const mon = fields(friday + 3 * DAY);

  return {
    id: `${fri.year}-${String(fri.month).padStart(2, "0")}-${String(fri.day).padStart(2, "0")}`,
    label: `Weekend of ${MONTHS[fri.month - 1]} ${fri.day}\u2013${mon.day}`,
    openTime: friday,
    lockTime: lock,
    status: nowMs < lock ? "Open" : "Locked",
  };
}

export function formatCountdown(ms: number): string {
  if (ms <= 0) return "0m";
  const total = Math.floor(ms / 60_000);
  const d = Math.floor(total / 1440);
  const h = Math.floor((total % 1440) / 60);
  const m = total % 60;
  const hh = String(h).padStart(2, "0");
  const mm = String(m).padStart(2, "0");
  if (d > 0) return `${d}d ${hh}h ${mm}m`;
  if (h > 0) return `${hh}h ${mm}m`;
  return `${m}m`;
}
