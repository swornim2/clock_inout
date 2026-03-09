import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { timeEntries, notifications } from "@/lib/db/schema";
import { isNull, eq } from "drizzle-orm";

const CRON_SECRET = process.env.CRON_SECRET;

function adelaideMidnight(): Date {
  // Get current Adelaide date and return midnight of that day as UTC
  const now = new Date();
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-AU", {
      timeZone: "Australia/Adelaide",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour12: false,
    })
      .formatToParts(now)
      .map((p) => [p.type, p.value]),
  );
  // Midnight Adelaide = start of today in Adelaide time
  return new Date(
    `${parts.year}-${parts.month}-${parts.day}T00:00:00+09:30`,
  );
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  if (!CRON_SECRET || secret !== CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const midnight = adelaideMidnight();

  // Find all open time entries (no clock-out)
  const open = await db.query.timeEntries.findMany({
    where: isNull(timeEntries.clockOut),
    with: { employee: true },
  });

  if (open.length === 0) {
    return NextResponse.json({ message: "No open shifts", processed: 0 });
  }

  const processed: number[] = [];

  for (const entry of open) {
    const clockInTime = new Date(entry.clockIn).getTime();
    const clockOutTime = midnight.getTime();

    // Skip entries that clocked in after midnight (shouldn't happen, but guard)
    if (clockOutTime <= clockInTime) continue;

    const totalHours = (clockOutTime - clockInTime) / (1000 * 60 * 60);

    await db
      .update(timeEntries)
      .set({
        clockOut: midnight,
        totalHours: Math.round(totalHours * 100) / 100,
        breakMinutes: 0,
        breakType: "none",
      })
      .where(eq(timeEntries.id, entry.id));

    await db.insert(notifications).values({
      employeeId: entry.employeeId,
      timeEntryId: entry.id,
      message: `${entry.employee.name} forgot to clock out — auto clocked out at midnight.`,
    });

    processed.push(entry.id);
  }

  return NextResponse.json({
    message: `Auto clocked out ${processed.length} shift(s)`,
    processed,
  });
}
