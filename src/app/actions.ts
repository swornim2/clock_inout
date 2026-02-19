"use server";

import { db } from "@/lib/db";
import { employees, timeEntries, insertEmployeeSchema } from "@/lib/db/schema";
import { eq, and, isNull, gte, lte, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { startOfDay, startOfWeek, endOfWeek, subWeeks } from "date-fns";

export async function clockIn(pin: string, breakInfo?: { minutes: number; type: string }) {
  try {
    const employee = await db.query.employees.findFirst({
      where: eq(employees.pin, pin),
    });

    if (!employee) {
      return { success: false, message: "Invalid PIN" };
    }

    const activeTimeEntry = await db.query.timeEntries.findFirst({
      where: and(eq(timeEntries.employeeId, employee.id), isNull(timeEntries.clockOut)),
    });

    if (activeTimeEntry) {
      // Clock out
      const clockInTime = new Date(activeTimeEntry.clockIn).getTime();
      const clockOutTime = new Date().getTime();
      let hoursWorked = (clockOutTime - clockInTime) / (1000 * 60 * 60);

      if (breakInfo && breakInfo.type === "unpaid") {
        hoursWorked -= breakInfo.minutes / 60;
      }

      await db
        .update(timeEntries)
        .set({
          clockOut: new Date(),
          totalHours: hoursWorked,
          breakMinutes: breakInfo?.minutes,
          breakType: breakInfo?.type,
        })
        .where(eq(timeEntries.id, activeTimeEntry.id));
      revalidatePath("/clock");
      return { success: true, message: `Goodbye, ${employee.name}!` };
    } else {
      // Clock in
      await db.insert(timeEntries).values({
        employeeId: employee.id,
        clockIn: new Date(),
      });
      revalidatePath("/clock");
      return { success: true, message: `Welcome, ${employee.name}!` };
    }
  } catch (error) {
    return { success: false, message: "An unexpected error occurred." };
  }
}

export async function getDashboardStats() {
  const totalEmployeesResult = await db.select({ count: sql<number>`count(*)` }).from(employees);
  const clockedInResult = await db.select({ count: sql<number>`count(*)` }).from(timeEntries).where(isNull(timeEntries.clockOut));

  const today = startOfDay(new Date());
  const hoursTodayResult = await db.select({ total: sql<number>`sum(${timeEntries.totalHours})` }).from(timeEntries).where(gte(timeEntries.clockIn, today));

  const weekStart = startOfWeek(new Date());
  const hoursThisWeekResult = await db.select({ total: sql<number>`sum(${timeEntries.totalHours})` }).from(timeEntries).where(gte(timeEntries.clockIn, weekStart));

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
      lte(timeEntries.clockIn, endDate)
    ),
    with: {
      employee: true,
    },
    orderBy: (timeEntries, { desc }) => [desc(timeEntries.clockIn)],
  });

  return reports;
}

export async function createEmployee(values: z.infer<typeof insertEmployeeSchema>) {
  try {
    await db.insert(employees).values(values);
    revalidatePath("/admin/employees");
    return { success: true, message: "Employee created successfully" };
  } catch (error) {
    return { success: false, message: "Failed to create employee" };
  }
}
