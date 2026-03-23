import { getTimeLogs, getAllEmployees } from "@/app/actions";
import { Card, CardContent } from "@/components/ui/card";
import { fmtDate, fmtTime } from "@/lib/tz";
import { PayrollToggle } from "@/components/payroll-actions";
import Link from "next/link";

interface SearchParams {
  location?: string;
  from?: string;
  to?: string;
  employeeId?: string;
}

const LOCATIONS = ["All", "Findon", "Firle"] as const;

function locationBadge(loc: string | null) {
  if (!loc) return null;
  const cls =
    loc === "Findon"
      ? "bg-blue-100 text-blue-700"
      : "bg-purple-100 text-purple-700";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {loc}
    </span>
  );
}

export default async function PayrollPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const activeLocation = searchParams.location ?? "All";

  const [logsResult, allEmployees] = await Promise.all([
    getTimeLogs({
      from: searchParams.from,
      to: searchParams.to,
      employeeId: searchParams.employeeId,
      location: activeLocation === "All" ? undefined : activeLocation,
      payStatus: "all",
      page: 1,
    }),
    getAllEmployees(),
  ]);

  // Group by employee
  const byEmployee = new Map<
    number,
    {
      name: string;
      totalHours: number;
      unpaidHours: number;
      shifts: typeof logsResult.rows;
    }
  >();

  for (const row of logsResult.rows) {
    const emp = row.employee;
    if (!byEmployee.has(emp.id)) {
      byEmployee.set(emp.id, { name: emp.name, totalHours: 0, unpaidHours: 0, shifts: [] });
    }
    const entry = byEmployee.get(emp.id)!;
    entry.totalHours += row.paidHours;
    if (!row.isPaid) entry.unpaidHours += row.paidHours;
    entry.shifts.push(row);
  }

  const employees = Array.from(byEmployee.entries()).sort((a, b) =>
    a[1].name.localeCompare(b[1].name),
  );

  function tabUrl(loc: string) {
    const q = new URLSearchParams();
    if (loc !== "All") q.set("location", loc);
    if (searchParams.from) q.set("from", searchParams.from);
    if (searchParams.to) q.set("to", searchParams.to);
    if (searchParams.employeeId) q.set("employeeId", searchParams.employeeId);
    const s = q.toString();
    return `/admin/payroll${s ? `?${s}` : ""}`;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payroll by Location</h1>
        <p className="text-sm text-gray-500 mt-1">Hours worked per employee, split by shop location</p>
      </div>

      {/* Location tabs */}
      <div className="flex gap-2">
        {LOCATIONS.map((loc) => (
          <Link
            key={loc}
            href={tabUrl(loc)}
            className={`px-4 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
              activeLocation === loc
                ? loc === "Findon"
                  ? "bg-blue-600 text-white border-blue-600"
                  : loc === "Firle"
                    ? "bg-purple-600 text-white border-purple-600"
                    : "bg-gray-900 text-white border-gray-900"
                : "border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {loc}
          </Link>
        ))}
      </div>

      {/* Date + employee filters */}
      <Card className="border-gray-200 shadow-none">
        <CardContent className="p-5">
          <form method="GET" className="flex flex-wrap gap-3">
            {activeLocation !== "All" && (
              <input type="hidden" name="location" value={activeLocation} />
            )}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-medium">From</label>
              <input
                type="date"
                name="from"
                defaultValue={searchParams.from ?? ""}
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-medium">To</label>
              <input
                type="date"
                name="to"
                defaultValue={searchParams.to ?? ""}
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-medium">Employee</label>
              <select
                name="employeeId"
                defaultValue={searchParams.employeeId ?? ""}
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white"
              >
                <option value="">All employees</option>
                {allEmployees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end gap-2">
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors"
              >
                Filter
              </button>
              <Link
                href={tabUrl(activeLocation)}
                className="px-4 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 transition-colors"
              >
                Clear
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

      {employees.length === 0 ? (
        <Card className="border-gray-200 shadow-none">
          <CardContent className="p-12 text-center text-gray-400 text-sm">
            No shifts found for {activeLocation === "All" ? "any location" : activeLocation}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {employees.map(([empId, data]) => (
            <Card key={empId} className="border-gray-200 shadow-none overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center gap-3">
                  <h2 className="text-sm font-semibold text-gray-900">{data.name}</h2>
                  <span className="text-xs text-gray-400">{data.shifts.length} shift{data.shifts.length !== 1 ? "s" : ""}</span>
                </div>
                <div className="flex items-center gap-4 text-right">
                  <div>
                    <p className="text-xs text-gray-400">Total</p>
                    <p className="text-sm font-bold text-gray-900">{data.totalHours.toFixed(2)}h</p>
                  </div>
                  {data.unpaidHours > 0 && (
                    <div>
                      <p className="text-xs text-orange-400">Unpaid</p>
                      <p className="text-sm font-bold text-orange-600">{data.unpaidHours.toFixed(2)}h</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-50">
                      <th className="text-left px-5 py-2.5 text-xs font-medium text-gray-400 uppercase tracking-wide">Date</th>
                      <th className="text-left px-5 py-2.5 text-xs font-medium text-gray-400 uppercase tracking-wide">Clock In</th>
                      <th className="text-left px-5 py-2.5 text-xs font-medium text-gray-400 uppercase tracking-wide">Clock Out</th>
                      <th className="text-left px-5 py-2.5 text-xs font-medium text-gray-400 uppercase tracking-wide">Location</th>
                      <th className="text-right px-5 py-2.5 text-xs font-medium text-gray-400 uppercase tracking-wide">Hours</th>
                      <th className="text-center px-5 py-2.5 text-xs font-medium text-gray-400 uppercase tracking-wide">Paid</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {data.shifts.map((shift) => (
                      <tr key={shift.id} className={`hover:bg-gray-50 ${shift.isPaid ? "" : "bg-orange-50/20"}`}>
                        <td className="px-5 py-3 text-gray-600">{fmtDate(shift.clockIn)}</td>
                        <td className="px-5 py-3 text-gray-600">{fmtTime(shift.clockIn)}</td>
                        <td className="px-5 py-3 text-gray-600">
                          {shift.clockOut ? fmtTime(shift.clockOut) : (
                            <span className="text-amber-500 font-medium">In progress</span>
                          )}
                        </td>
                        <td className="px-5 py-3">{locationBadge(shift.location ?? null)}</td>
                        <td className="px-5 py-3 text-right font-medium text-gray-800">
                          {shift.paidHours > 0 ? `${shift.paidHours.toFixed(2)}h` : "—"}
                        </td>
                        <td className="px-5 py-3 text-center">
                          <PayrollToggle shiftId={shift.id} isPaid={shift.isPaid ?? false} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
