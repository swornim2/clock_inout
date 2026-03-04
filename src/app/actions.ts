"use server";

import { db } from "@/lib/db";
import { employees, timeEntries, insertEmployeeSchema } from "@/lib/db/schema";
import { eq, and, isNull, gte, lte, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { startOfDay, startOfWeek, endOfWeek, subWeeks } from "date-fns";

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

  const today = startOfDay(new Date());
  const hoursTodayResult = await db
    .select({ total: sql<number>`sum(${timeEntries.totalHours})` })
    .from(timeEntries)
    .where(gte(timeEntries.clockIn, today));

  const weekStart = startOfWeek(new Date());
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
