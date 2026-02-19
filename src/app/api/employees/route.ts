import { db } from "@/lib/db";
import { employees, timeEntries } from "@/lib/db/schema";
import { isNull } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const allEmployees = await db.select().from(employees);
  const activeTimeEntries = await db
    .select()
    .from(timeEntries)
    .where(isNull(timeEntries.clockOut));

  const employeesWithStatus = allEmployees.map((employee) => {
    const isActive = activeTimeEntries.some(
      (entry) => entry.employeeId === employee.id
    );
    return { ...employee, isClockedIn: isActive };
  });

  return NextResponse.json(employeesWithStatus);
}
