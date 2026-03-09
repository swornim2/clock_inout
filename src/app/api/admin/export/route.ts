import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { timeEntries, employees } from "@/lib/db/schema";
import { and, eq, gte, lte, sql } from "drizzle-orm";
import { fmtCsvDate, fmtCsvTime } from "@/lib/tz";
import { format } from "date-fns";

export async function GET(request: NextRequest) {
  const session = cookies().get("admin-session")?.value;
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const employeeId = searchParams.get("employeeId");

  const conditions = [sql`${timeEntries.clockOut} is not null`];
  if (from) conditions.push(gte(timeEntries.clockIn, new Date(from)));
  if (to) {
    const toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999);
    conditions.push(lte(timeEntries.clockIn, toDate));
  }
  if (employeeId)
    conditions.push(eq(timeEntries.employeeId, Number(employeeId)));

  const rows = await db
    .select({
      employeeName: employees.name,
      clockIn: timeEntries.clockIn,
      clockOut: timeEntries.clockOut,
      breakType: timeEntries.breakType,
      breakMinutes: timeEntries.breakMinutes,
      totalHours: timeEntries.totalHours,
      isPaid: timeEntries.isPaid,
    })
    .from(timeEntries)
    .leftJoin(employees, eq(timeEntries.employeeId, employees.id))
    .where(and(...conditions))
    .orderBy(timeEntries.clockIn);

  const headers = [
    "Employee",
    "Date",
    "Clock In",
    "Clock Out",
    "Break Type",
    "Break Mins",
    "Hours Worked",
    "Pay Status",
  ];

  const escape = (v: string | number | null | undefined) => {
    const s = String(v ?? "");
    return s.includes(",") || s.includes('"') || s.includes("\n")
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };

  const csvRows = rows.map((r) => {
    const breakLabel =
      !r.breakType || r.breakType === "none"
        ? "None"
        : r.breakType === "paid" || r.breakType === "10_paid"
          ? "10 min paid"
          : "30 min unpaid";

    return [
      escape(r.employeeName),
      escape(r.clockIn ? fmtCsvDate(r.clockIn) : ""),
      escape(r.clockIn ? fmtCsvTime(r.clockIn) : ""),
      escape(r.clockOut ? fmtCsvTime(r.clockOut) : ""),
      escape(breakLabel),
      escape(r.breakMinutes ?? 0),
      escape(r.totalHours != null ? Number(r.totalHours).toFixed(2) : ""),
      escape(r.isPaid ? "Paid" : "Unpaid"),
    ].join(",");
  });

  const csv = [headers.join(","), ...csvRows].join("\n");
  const filename = `timelog-${format(new Date(), "yyyy-MM-dd")}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
