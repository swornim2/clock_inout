export const TZ = "Australia/Adelaide";

/** Extract date/time components in Adelaide timezone reliably */
function getAdeParts(d: Date): {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  weekday: number;
} {
  const fmt = new Intl.DateTimeFormat("en-AU", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    weekday: "short",
  });
  const parts = Object.fromEntries(
    fmt.formatToParts(d).map((p) => [p.type, p.value]),
  );
  const weekdays: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  return {
    year: Number(parts.year),
    month: Number(parts.month) - 1,
    day: Number(parts.day),
    hour: Number(parts.hour) === 24 ? 0 : Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second),
    weekday:
      weekdays[parts.weekday] ??
      new Date(
        Number(parts.year),
        Number(parts.month) - 1,
        Number(parts.day),
      ).getDay(),
  };
}

/** Returns a plain Date whose .getFullYear()/.getMonth() etc. reflect Adelaide local time */
function toAdelaide(d: Date | string | number): Date {
  const date = new Date(d);
  const p = getAdeParts(date);
  return new Date(p.year, p.month, p.day, p.hour, p.minute, p.second);
}

export function fmtDate(d: Date | string | number): string {
  return new Date(d).toLocaleDateString("en-AU", {
    timeZone: TZ,
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function fmtTime(d: Date | string | number): string {
  return new Date(d).toLocaleTimeString("en-AU", {
    timeZone: TZ,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function fmtDateShort(d: Date | string | number): string {
  return new Date(d).toLocaleDateString("en-AU", {
    timeZone: TZ,
    weekday: "short",
    day: "numeric",
  });
}

export function fmtCsvDate(d: Date | string | number): string {
  const ad = toAdelaide(d);
  const y = ad.getFullYear();
  const m = String(ad.getMonth() + 1).padStart(2, "0");
  const day = String(ad.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function fmtCsvTime(d: Date | string | number): string {
  const ad = toAdelaide(d);
  const h = String(ad.getHours()).padStart(2, "0");
  const min = String(ad.getMinutes()).padStart(2, "0");
  return `${h}:${min}`;
}

/** Returns start of today (midnight Adelaide time) as a UTC Date */
export function adelaideStartOfDay(date: Date = new Date()): Date {
  const ad = toAdelaide(date);
  ad.setHours(0, 0, 0, 0);
  return ad;
}

function startOfWeekAdelaide(date: Date): Date {
  const local = toAdelaide(date);
  const dow = local.getDay();
  const mondayOffset = dow === 0 ? -6 : 1 - dow;
  local.setDate(local.getDate() + mondayOffset);
  local.setHours(0, 0, 0, 0);
  return local;
}

function fmtIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Returns { from, to } ISO date strings for the week at the given offset (0 = this week, -1 = last week) */
export function getWeekDateRange(offset: number = 0): {
  from: string;
  to: string;
} {
  const now = new Date();
  const local = toAdelaide(now);
  local.setDate(local.getDate() + offset * 7);
  const start = startOfWeekAdelaide(local);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { from: fmtIso(start), to: fmtIso(end) };
}
