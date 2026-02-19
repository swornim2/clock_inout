import { db } from "@/lib/db";
import { timeEntries, employees } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { format } from "date-fns";

export default async function ReportsPage() {
  const allTimeEntries = await db
    .select({
      employeeName: employees.name,
      clockIn: timeEntries.clockIn,
      clockOut: timeEntries.clockOut,
      totalHours: timeEntries.totalHours,
    })
    .from(timeEntries)
    .leftJoin(employees, eq(timeEntries.employeeId, employees.id));

  return (
    <div>
      <h1 className="text-2xl font-bold">Time Reports</h1>
      <div className="mt-8 rounded-md border">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th className="p-4">Employee</th>
              <th className="p-4">Clock In</th>
              <th className="p-4">Clock Out</th>
              <th className="p-4">Total Hours</th>
            </tr>
          </thead>
          <tbody>
            {allTimeEntries.map((entry, index) => (
              <tr key={index} className="border-b">
                <td className="p-4">{entry.employeeName}</td>
                <td className="p-4">
                  {format(new Date(entry.clockIn), "yyyy-MM-dd HH:mm:ss")}
                </td>
                <td className="p-4">
                  {entry.clockOut
                    ? format(new Date(entry.clockOut), "yyyy-MM-dd HH:mm:ss")
                    : "-"}
                </td>
                <td className="p-4">{entry.totalHours?.toFixed(2) ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
