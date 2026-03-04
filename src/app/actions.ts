"use server";

import { db } from "@/lib/db";
import { employees, timeEntries, insertEmployeeSchema } from "@/lib/db/schema";
import { eq, and, isNull, gte, lte, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { startOfWeek, endOfWeek, subWeeks, subDays, format } from "date-fns";

const TZ = "Australia/Adelaide";

function toAdelaideLocal(date: Date = new Date()): Date {
  const str = date.toLocaleString("en-AU", { timeZone: TZ });
  return new Date(str);
}

function adelaideStartOfDay(date: Date = new Date()): Date {
  const local = toAdelaideLocal(date);
  local.setHours(0, 0, 0, 0);
  return local;
}

function adelaideStartOfWeek(date: Date = new Date()): Date {
  const local = toAdelaideLocal(date);
  local.setDate(local.getDate() - local.getDay());
  local.setHours(0, 0, 0, 0);
  return local;
}

function adelaideStartOfMonth(date: Date = new Date()): Date {
  const local = toAdelaideLocal(date);
  local.setDate(1);
  local.setHours(0, 0, 0, 0);
  return local;
}

export async function checkPin(
  pin: string,
): Promise<
  | { success: false; message: string }
  | { success: true; needsClockOut: false; employeeName: string }
  | { success: true; needsClockOut: true; employeeName: string }
> {
  try {
    const employee = await db.query.employees.findFirst({
      where: eq(employees.pin, pin),
    });
    if (!employee)
      return { success: false, message: "Invalid PIN. Please try again." };

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
    let hoursWorked = (clockOutTime - clockInTime) / (1000 * 60 * 60);
    if (breakInfo.type === "unpaid") hoursWorked -= breakInfo.minutes / 60;

    await db
      .update(timeEntries)
      .set({
        clockOut: new Date(),
        totalHours: hoursWorked,
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
  const now = new Date();
  let startDate: Date;
  let endDate: Date;

  if (week === "last") {
    const lastWeek = subWeeks(now, 1);
    startDate = startOfWeek(lastWeek);
    endDate = endOfWeek(lastWeek);
  } else {
    startDate = startOfWeek(now);
    endDate = endOfWeek(now);
  }

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
  try {
    await db.insert(employees).values(values);
    revalidatePath("/admin/employees");
    return { success: true, message: "Employee created successfully" };
  } catch (error) {
    return { success: false, message: "Failed to create employee" };
  }
}

export async function getExtendedDashboardStats() {
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
  return db.select().from(employees).orderBy(employees.name);
}

export interface TimeLogFilters {
  from?: string;
  to?: string;
  employeeId?: string;
  page?: number;
}

export async function getTimeLogs(filters: TimeLogFilters = {}) {
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

  const where = and(...conditions);

  const [rows, countResult] = await Promise.all([
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
  ]);

  return {
    rows,
    total: Number(countResult[0].count),
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.ceil(Number(countResult[0].count) / PAGE_SIZE),
  };
}

export async function getTimeLogsAll(
  filters: Omit<TimeLogFilters, "page"> = {},
) {
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

  const totalShifts = shifts.length;
  const totalHours = shifts.reduce(
    (sum, s) => sum + (Number(s.totalHours) || 0),
    0,
  );
  const avgShiftHours = totalShifts > 0 ? totalHours / totalShifts : 0;

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
    mostCommonBreak,
  };
}

export async function getEmployeeShifts(id: number) {
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
