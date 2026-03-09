"use server";

import { db } from "@/lib/db";
import { employees, timeEntries, insertEmployeeSchema } from "@/lib/db/schema";
import { eq, and, isNull, gte, lte, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";
import { subDays, format } from "date-fns";
import { getWeekDateRange } from "@/lib/tz";

const TZ = "Australia/Adelaide";

async function requireAdmin() {
  const session = cookies().get("admin-session")?.value;
  if (!session) throw new Error("Unauthorized");
}

function getAdeParts(d: Date = new Date()) {
  const fmt = new Intl.DateTimeFormat("en-AU", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const parts = Object.fromEntries(
    fmt.formatToParts(d).map((p) => [p.type, p.value]),
  );
  const wdMap: Record<string, number> = {
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
    weekday: wdMap[parts.weekday] ?? 1,
  };
}

function adelaideStartOfDay(date: Date = new Date()): Date {
  const p = getAdeParts(date);
  return new Date(p.year, p.month, p.day, 0, 0, 0, 0);
}

function adelaideStartOfWeek(date: Date = new Date()): Date {
  const p = getAdeParts(date);
  const mondayOffset = p.weekday === 0 ? -6 : 1 - p.weekday;
  return new Date(p.year, p.month, p.day + mondayOffset, 0, 0, 0, 0);
}

function adelaideStartOfMonth(date: Date = new Date()): Date {
  const p = getAdeParts(date);
  return new Date(p.year, p.month, 1, 0, 0, 0, 0);
}

// In-memory PIN rate limiter: key = PIN, value = { count, lockedUntil }
const pinAttempts = new Map<string, { count: number; lockedUntil: number }>();

async function checkPinRateLimited(pin: string) {
  const now = Date.now();
  const entry = pinAttempts.get(pin);
  if (entry && entry.lockedUntil > now) {
    const mins = Math.ceil((entry.lockedUntil - now) / 60000);
    return {
      locked: true,
      message: `Too many failed attempts. Try again in ${mins} minute${mins !== 1 ? "s" : ""}.`,
    };
  }
  return { locked: false, message: undefined };
}

async function recordFailedPin(pin: string) {
  const now = Date.now();
  const entry = pinAttempts.get(pin) ?? { count: 0, lockedUntil: 0 };
  const count = entry.count + 1;
  if (count >= 5) {
    pinAttempts.set(pin, { count, lockedUntil: now + 5 * 60 * 1000 });
  } else {
    pinAttempts.set(pin, { count, lockedUntil: 0 });
  }
}

async function clearPinAttempts(pin: string) {
  pinAttempts.delete(pin);
}

export async function checkPin(
  pin: string,
): Promise<
  | { success: false; message: string }
  | { success: true; needsClockOut: false; employeeName: string }
  | { success: true; needsClockOut: true; employeeName: string }
> {
  try {
    const rateCheck = await checkPinRateLimited(pin);
    if (rateCheck.locked)
      return { success: false, message: rateCheck.message! };

    const employee = await db.query.employees.findFirst({
      where: eq(employees.pin, pin),
    });
    if (!employee) {
      await recordFailedPin(pin);
      return { success: false, message: "Invalid PIN. Please try again." };
    }

    await clearPinAttempts(pin);
    const active = await db.query.timeEntries.findFirst({
      where: and(
        eq(timeEntries.employeeId, employee.id),
        isNull(timeEntries.clockOut),
      ),
    });

    return {
      success: true,
      needsClockOut: !!active,
      employeeName: employee.name,
    };
  } catch {
    return { success: false, message: "An error occurred. Please try again." };
  }
}

export async function clockIn(
  pin: string,
): Promise<{ success: boolean; message: string }> {
  try {
    const employee = await db.query.employees.findFirst({
      where: eq(employees.pin, pin),
    });
    if (!employee) return { success: false, message: "Invalid PIN." };

    await db.insert(timeEntries).values({
      employeeId: employee.id,
      clockIn: new Date(),
    });
    return { success: true, message: `Welcome, ${employee.name}!` };
  } catch {
    return { success: false, message: "An error occurred. Please try again." };
  }
}

export async function clockOut(
  pin: string,
  breakInfo: { minutes: number; type: string },
): Promise<{ success: boolean; message: string }> {
  try {
    const employee = await db.query.employees.findFirst({
      where: eq(employees.pin, pin),
    });
    if (!employee) return { success: false, message: "Invalid PIN." };

    const activeTimeEntry = await db.query.timeEntries.findFirst({
      where: and(
        eq(timeEntries.employeeId, employee.id),
        isNull(timeEntries.clockOut),
      ),
    });
    if (!activeTimeEntry) return { success: false, message: "Not clocked in." };

    const clockInTime = new Date(activeTimeEntry.clockIn).getTime();
    const clockOutTime = Date.now();
    const rawHours = (clockOutTime - clockInTime) / (1000 * 60 * 60);
    const unpaidDeduction =
      breakInfo.type === "unpaid" ? breakInfo.minutes / 60 : 0;
    const paidHours = Math.max(0, rawHours - unpaidDeduction);

    await db
      .update(timeEntries)
      .set({
        clockOut: new Date(),
        totalHours: paidHours,
        breakMinutes: breakInfo.minutes,
        breakType: breakInfo.type,
      })
      .where(eq(timeEntries.id, activeTimeEntry.id));

    return { success: true, message: `Goodbye, ${employee.name}!` };
  } catch {
    return { success: false, message: "An error occurred. Please try again." };
  }
}

export async function getClockedInEmployees() {
  try {
    const active = await db.query.timeEntries.findMany({
      where: isNull(timeEntries.clockOut),
      with: { employee: true },
      orderBy: (t, { asc }) => [asc(t.clockIn)],
    });
    return active.map((e) => ({
      id: e.employee.id,
      name: e.employee.name,
      clockIn: e.clockIn,
    }));
  } catch {
    return [];
  }
}

export async function getDashboardStats() {
  const totalEmployeesResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(employees);
  const clockedInResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(timeEntries)
    .where(isNull(timeEntries.clockOut));

  const today = adelaideStartOfDay();
  const hoursTodayResult = await db
    .select({ total: sql<number>`sum(${timeEntries.totalHours})` })
    .from(timeEntries)
    .where(gte(timeEntries.clockIn, today));

  const weekStart = adelaideStartOfWeek();
  const hoursThisWeekResult = await db
    .select({ total: sql<number>`sum(${timeEntries.totalHours})` })
    .from(timeEntries)
    .where(gte(timeEntries.clockIn, weekStart));

  return {
    totalEmployees: totalEmployeesResult[0].count,
    clockedIn: clockedInResult[0].count,
    hoursToday: hoursTodayResult[0].total || 0,
    hoursThisWeek: hoursThisWeekResult[0].total || 0,
  };
}

export async function getShiftReports(week?: string) {
  const range = getWeekDateRange(week === "last" ? -1 : 0);
  const startDate = new Date(range.from);
  const endDate = new Date(range.to + "T23:59:59");

  const reports = await db.query.timeEntries.findMany({
    where: and(
      gte(timeEntries.clockIn, startDate),
      lte(timeEntries.clockIn, endDate),
    ),
    with: {
      employee: true,
    },
    orderBy: (timeEntries, { desc }) => [desc(timeEntries.clockIn)],
  });

  return reports;
}

export async function createEmployee(
  values: z.infer<typeof insertEmployeeSchema>,
) {
  await requireAdmin();
  try {
    await db.insert(employees).values(values);
    revalidatePath("/admin/employees");
    return { success: true, message: "Employee created successfully" };
  } catch (error) {
    return { success: false, message: "Failed to create employee" };
  }
}

export async function getExtendedDashboardStats() {
  await requireAdmin();
  const today = adelaideStartOfDay();
  const weekStart = adelaideStartOfWeek();
  const monthStart = adelaideStartOfMonth();

  const [
    totalEmployeesResult,
    clockedInResult,
    hoursTodayResult,
    hoursWeekResult,
    hoursMonthResult,
  ] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(employees),
    db
      .select({ count: sql<number>`count(*)` })
      .from(timeEntries)
      .where(isNull(timeEntries.clockOut)),
    db
      .select({
        total: sql<number>`coalesce(sum(${timeEntries.totalHours}), 0)`,
      })
      .from(timeEntries)
      .where(
        and(
          gte(timeEntries.clockIn, today),
          sql`${timeEntries.clockOut} is not null`,
        ),
      ),
    db
      .select({
        total: sql<number>`coalesce(sum(${timeEntries.totalHours}), 0)`,
      })
      .from(timeEntries)
      .where(
        and(
          gte(timeEntries.clockIn, weekStart),
          sql`${timeEntries.clockOut} is not null`,
        ),
      ),
    db
      .select({
        total: sql<number>`coalesce(sum(${timeEntries.totalHours}), 0)`,
      })
      .from(timeEntries)
      .where(
        and(
          gte(timeEntries.clockIn, monthStart),
          sql`${timeEntries.clockOut} is not null`,
        ),
      ),
  ]);

  return {
    totalEmployees: Number(totalEmployeesResult[0].count),
    clockedIn: Number(clockedInResult[0].count),
    hoursToday: Number(hoursTodayResult[0].total),
    hoursThisWeek: Number(hoursWeekResult[0].total),
    hoursThisMonth: Number(hoursMonthResult[0].total),
  };
}

export async function getDailyHoursLast7Days(): Promise<
  { date: string; hours: number }[]
> {
  await requireAdmin();
  const days = Array.from({ length: 7 }, (_, i) =>
    subDays(adelaideStartOfDay(), 6 - i),
  );

  const results = await Promise.all(
    days.map(async (day) => {
      const nextDay = new Date(day.getTime() + 24 * 60 * 60 * 1000);
      const [row] = await db
        .select({
          total: sql<number>`coalesce(sum(${timeEntries.totalHours}), 0)`,
        })
        .from(timeEntries)
        .where(
          and(
            gte(timeEntries.clockIn, day),
            lte(timeEntries.clockIn, nextDay),
            sql`${timeEntries.clockOut} is not null`,
          ),
        );
      return {
        date: format(day, "EEE d"),
        hours: Math.round(Number(row.total) * 10) / 10,
      };
    }),
  );

  return results;
}

export async function getAllEmployees() {
  await requireAdmin();
  return db.select().from(employees).orderBy(employees.name);
}

export interface TimeLogFilters {
  from?: string;
  to?: string;
  employeeId?: string;
  page?: number;
  payStatus?: "paid" | "unpaid" | "all";
}

export async function getTimeLogs(filters: TimeLogFilters = {}) {
  await requireAdmin();
  const PAGE_SIZE = 25;
  const page = Math.max(1, filters.page ?? 1);
  const offset = (page - 1) * PAGE_SIZE;

  const conditions = [sql`${timeEntries.clockOut} is not null`];

  if (filters.from) {
    conditions.push(gte(timeEntries.clockIn, new Date(filters.from)));
  }
  if (filters.to) {
    const toDate = new Date(filters.to);
    toDate.setHours(23, 59, 59, 999);
    conditions.push(lte(timeEntries.clockIn, toDate));
  }
  if (filters.employeeId) {
    conditions.push(eq(timeEntries.employeeId, Number(filters.employeeId)));
  }
  if (filters.payStatus === "paid") {
    conditions.push(sql`${timeEntries.isPaid} = 1`);
  } else if (filters.payStatus === "unpaid") {
    conditions.push(sql`${timeEntries.isPaid} = 0`);
  }

  const where = and(...conditions);

  const [rows, countResult, totalsResult] = await Promise.all([
    db.query.timeEntries.findMany({
      where,
      with: { employee: true },
      orderBy: (t, { desc }) => [desc(t.clockIn)],
      limit: PAGE_SIZE,
      offset,
    }),
    db
      .select({ count: sql<number>`count(*)` })
      .from(timeEntries)
      .where(where),
    db
      .select({
        totalPaidHours: sql<number>`coalesce(sum(${timeEntries.totalHours}), 0)`,
        totalUnpaidMins: sql<number>`coalesce(sum(case when ${timeEntries.breakType} = 'unpaid' then ${timeEntries.breakMinutes} else 0 end), 0)`,
      })
      .from(timeEntries)
      .where(where),
  ]);

  const rowsWithBreakdown = rows.map((r) => ({
    ...r,
    paidHours: Number(r.totalHours ?? 0),
    unpaidBreakHours: r.breakType === "unpaid" ? (r.breakMinutes ?? 0) / 60 : 0,
  }));

  return {
    rows: rowsWithBreakdown,
    total: Number(countResult[0].count),
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.ceil(Number(countResult[0].count) / PAGE_SIZE),
    totalPaidHours: Number(totalsResult[0].totalPaidHours),
    totalUnpaidHours: Number(totalsResult[0].totalUnpaidMins) / 60,
  };
}

export async function getTimeLogsAll(
  filters: Omit<TimeLogFilters, "page"> = {},
) {
  await requireAdmin();
  const conditions = [sql`${timeEntries.clockOut} is not null`];

  if (filters.from)
    conditions.push(gte(timeEntries.clockIn, new Date(filters.from)));
  if (filters.to) {
    const toDate = new Date(filters.to);
    toDate.setHours(23, 59, 59, 999);
    conditions.push(lte(timeEntries.clockIn, toDate));
  }
  if (filters.employeeId)
    conditions.push(eq(timeEntries.employeeId, Number(filters.employeeId)));

  return db.query.timeEntries.findMany({
    where: and(...conditions),
    with: { employee: true },
    orderBy: (t, { desc }) => [desc(t.clockIn)],
  });
}

export async function getEmployeeProfile(id: number) {
  await requireAdmin();
  const employee = await db.query.employees.findFirst({
    where: eq(employees.id, id),
  });
  if (!employee) return null;

  const shifts = await db.query.timeEntries.findMany({
    where: and(
      eq(timeEntries.employeeId, id),
      sql`${timeEntries.clockOut} is not null`,
    ),
    orderBy: (t, { desc }) => [desc(t.clockIn)],
  });

  // Compute Adelaide this-week boundaries (Mon–Sun) using reliable Intl parts
  const _fmt = new Intl.DateTimeFormat("en-AU", {
    timeZone: "Australia/Adelaide",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour12: false,
  });
  const _parts = Object.fromEntries(
    _fmt.formatToParts(new Date()).map((p) => [p.type, p.value]),
  );
  const _wdMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  const _dow = _wdMap[_parts.weekday] ?? 1;
  const _mondayOffset = _dow === 0 ? -6 : 1 - _dow;
  const weekStart = new Date(
    Number(_parts.year),
    Number(_parts.month) - 1,
    Number(_parts.day) + _mondayOffset,
    0,
    0,
    0,
    0,
  );
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  const totalShifts = shifts.length;
  const totalHours = shifts.reduce(
    (sum, s) => sum + (Number(s.totalHours) || 0),
    0,
  );
  const avgShiftHours = totalShifts > 0 ? totalHours / totalShifts : 0;

  const thisWeekHours = shifts
    .filter((s) => {
      const clockInAd = new Date(
        new Date(s.clockIn).toLocaleString("en-AU", {
          timeZone: "Australia/Adelaide",
        }),
      );
      return clockInAd >= weekStart && clockInAd <= weekEnd;
    })
    .reduce((sum, s) => sum + (Number(s.totalHours) || 0), 0);

  const unpaidHours = shifts
    .filter((s) => !s.isPaid)
    .reduce((sum, s) => sum + (Number(s.totalHours) || 0), 0);

  const breakCounts: Record<string, number> = {};
  shifts.forEach((s) => {
    const bt = s.breakType ?? "none";
    breakCounts[bt] = (breakCounts[bt] ?? 0) + 1;
  });
  const mostCommonBreak =
    Object.entries(breakCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "none";

  return {
    employee,
    totalShifts,
    totalHours: Math.round(totalHours * 100) / 100,
    avgShiftHours: Math.round(avgShiftHours * 100) / 100,
    thisWeekHours: Math.round(thisWeekHours * 100) / 100,
    unpaidHours: Math.round(unpaidHours * 100) / 100,
    mostCommonBreak,
    weekStart,
    weekEnd,
  };
}

export async function getEmployeeShifts(id: number) {
  await requireAdmin();
  return db.query.timeEntries.findMany({
    where: eq(timeEntries.employeeId, id),
    orderBy: (t, { desc }) => [desc(t.clockIn)],
  });
}

export async function getClockedInNow() {
  const active = await db.query.timeEntries.findMany({
    where: isNull(timeEntries.clockOut),
    with: { employee: true },
    orderBy: (t, { asc }) => [asc(t.clockIn)],
  });
  return active.map((e) => ({
    id: e.employee.id,
    name: e.employee.name,
    clockIn: e.clockIn,
  }));
}

export async function markShiftsPaid(ids: number[]) {
  await requireAdmin();
  if (!ids.length) return { success: false };
  await db
    .update(timeEntries)
    .set({ isPaid: true })
    .where(sql`${timeEntries.id} in ${ids}`);
  revalidatePath("/admin/time-logs");
  revalidatePath("/admin");
  return { success: true };
}

export async function markShiftsUnpaid(ids: number[]) {
  await requireAdmin();
  if (!ids.length) return { success: false };
  await db
    .update(timeEntries)
    .set({ isPaid: false })
    .where(sql`${timeEntries.id} in ${ids}`);
  revalidatePath("/admin/time-logs");
  revalidatePath("/admin");
  return { success: true };
}

export async function getPayrollSummary() {
  await requireAdmin();
  const rows = await db
    .select({
      employeeId: employees.id,
      employeeName: employees.name,
      unpaidHours: sql<number>`coalesce(sum(case when ${timeEntries.isPaid} = 0 and ${timeEntries.clockOut} is not null then ${timeEntries.totalHours} else 0 end), 0)`,
      paidHours: sql<number>`coalesce(sum(case when ${timeEntries.isPaid} = 1 then ${timeEntries.totalHours} else 0 end), 0)`,
      unpaidShifts: sql<number>`coalesce(sum(case when ${timeEntries.isPaid} = 0 and ${timeEntries.clockOut} is not null then 1 else 0 end), 0)`,
    })
    .from(employees)
    .leftJoin(timeEntries, eq(timeEntries.employeeId, employees.id))
    .groupBy(employees.id)
    .orderBy(employees.name);

  return rows.map((r) => ({
    employeeId: r.employeeId,
    employeeName: r.employeeName,
    unpaidHours: Number(r.unpaidHours),
    paidHours: Number(r.paidHours),
    unpaidShifts: Number(r.unpaidShifts),
  }));
}

export async function getTotalOutstandingHours() {
  await requireAdmin();
  const [result] = await db
    .select({
      total: sql<number>`coalesce(sum(${timeEntries.totalHours}), 0)`,
    })
    .from(timeEntries)
    .where(
      and(
        sql`${timeEntries.isPaid} = 0`,
        sql`${timeEntries.clockOut} is not null`,
      ),
    );
  return Number(result.total);
}

export async function markEmployeeWeekPaid(employeeId: number) {
  await requireAdmin();
  const weekStart = adelaideStartOfWeek();
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  await db
    .update(timeEntries)
    .set({ isPaid: true })
    .where(
      and(
        eq(timeEntries.employeeId, employeeId),
        sql`${timeEntries.isPaid} = 0`,
        sql`${timeEntries.clockOut} is not null`,
        gte(timeEntries.clockIn, weekStart),
        lte(timeEntries.clockIn, weekEnd),
      ),
    );

  revalidatePath(`/admin/employees/${employeeId}`);
  revalidatePath("/admin");
  revalidatePath("/admin/time-logs");
  return { success: true };
}

export async function updateEmployee(
  id: number,
  values: { name: string; pin: string },
) {
  await requireAdmin();
  try {
    await db.update(employees).set(values).where(eq(employees.id, id));
    revalidatePath("/admin/employees");
    revalidatePath(`/admin/employees/${id}`);
    return { success: true };
  } catch {
    return { success: false, message: "Failed to update employee" };
  }
}

export async function deleteEmployee(id: number) {
  await requireAdmin();
  try {
    await db.delete(timeEntries).where(eq(timeEntries.employeeId, id));
    await db.delete(employees).where(eq(employees.id, id));
    revalidatePath("/admin/employees");
    revalidatePath("/admin");
    return { success: true };
  } catch {
    return { success: false, message: "Failed to delete employee" };
  }
}

export async function updateTimeEntry(
  id: number,
  values: {
    clockIn: string;
    clockOut: string;
    breakType: string;
    breakMinutes: number;
  },
) {
  await requireAdmin();
  try {
    const clockIn = new Date(values.clockIn);
    const clockOut = new Date(values.clockOut);
    const rawHours =
      (clockOut.getTime() - clockIn.getTime()) / (1000 * 60 * 60);
    const unpaidDeduction =
      values.breakType === "unpaid" ? values.breakMinutes / 60 : 0;
    const totalHours = Math.max(0, rawHours - unpaidDeduction);
    await db
      .update(timeEntries)
      .set({
        clockIn,
        clockOut,
        breakType: values.breakType,
        breakMinutes: values.breakMinutes,
        totalHours,
      })
      .where(eq(timeEntries.id, id));
    revalidatePath("/admin/time-logs");
    revalidatePath("/admin");
    const entry = await db.query.timeEntries.findFirst({
      where: eq(timeEntries.id, id),
    });
    if (entry) revalidatePath(`/admin/employees/${entry.employeeId}`);
    return { success: true };
  } catch {
    return { success: false, message: "Failed to update time entry" };
  }
}

export async function deleteTimeEntry(id: number) {
  await requireAdmin();
  try {
    const entry = await db.query.timeEntries.findFirst({
      where: eq(timeEntries.id, id),
    });
    await db.delete(timeEntries).where(eq(timeEntries.id, id));
    if (entry) revalidatePath(`/admin/employees/${entry.employeeId}`);
    revalidatePath("/admin/time-logs");
    revalidatePath("/admin");
    return { success: true };
  } catch {
    return { success: false, message: "Failed to delete time entry" };
  }
}

export async function getEmployeeShiftsLimited(id: number, limit = 50) {
  await requireAdmin();
  return db.query.timeEntries.findMany({
    where: eq(timeEntries.employeeId, id),
    orderBy: (t, { desc }) => [desc(t.clockIn)],
    limit,
  });
}
