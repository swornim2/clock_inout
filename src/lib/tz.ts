export const TZ = "Australia/Adelaide";

function toAdelaide(d: Date | string | number): Date {
  const date = new Date(d);
  const str = date.toLocaleString("en-AU", { timeZone: TZ });
  return new Date(str);
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
