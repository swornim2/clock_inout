import { getTimeLogs, getAllEmployees } from "@/app/actions";
import { Card, CardContent } from "@/components/ui/card";
import { fmtDate, fmtTime } from "@/lib/tz";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";

interface SearchParams {
  from?: string;
  to?: string;
  employeeId?: string;
  page?: string;
}

function formatBreak(breakType: string | null, breakMinutes: number | null) {
  if (!breakType || breakType === "none") return "—";
  const mins = breakMinutes ?? 0;
  const paid = breakType === "paid" || breakType === "10_paid";
  return `${mins}m ${paid ? "(paid)" : "(unpaid)"}`;
}

function buildUrl(params: SearchParams, overrides: Partial<SearchParams>) {
  const merged = { ...params, ...overrides };
  const q = new URLSearchParams();
  if (merged.from) q.set("from", merged.from);
  if (merged.to) q.set("to", merged.to);
  if (merged.employeeId) q.set("employeeId", merged.employeeId);
  if (merged.page && merged.page !== "1") q.set("page", merged.page);
  const str = q.toString();
  return `/admin/time-logs${str ? `?${str}` : ""}`;
}

export default async function TimeLogsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const page = Number(searchParams.page ?? 1);

  const [logsResult, allEmployees] = await Promise.all([
    getTimeLogs({
      from: searchParams.from,
      to: searchParams.to,
      employeeId: searchParams.employeeId,
      page,
    }),
    getAllEmployees(),
  ]);

  const exportParams = new URLSearchParams();
  if (searchParams.from) exportParams.set("from", searchParams.from);
  if (searchParams.to) exportParams.set("to", searchParams.to);
  if (searchParams.employeeId)
    exportParams.set("employeeId", searchParams.employeeId);
  const exportUrl = `/api/admin/export${exportParams.toString() ? `?${exportParams}` : ""}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Time Logs</h1>
          <p className="text-sm text-gray-500 mt-1">
            {logsResult.total} completed shift
            {logsResult.total !== 1 ? "s" : ""}
          </p>
        </div>
        <a
          href={exportUrl}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </a>
      </div>

      <Card className="border-gray-200 shadow-none">
        <CardContent className="p-5">
          <form method="GET" className="flex flex-wrap gap-3">
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
              <label className="text-xs text-gray-500 font-medium">
                Employee
              </label>
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
              <a
                href="/admin/time-logs"
                className="px-4 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 transition-colors"
              >
                Clear
              </a>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-gray-200 shadow-none overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Employee
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Date
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Clock In
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Clock Out
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Break
                </th>
                <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Hours
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {logsResult.rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-12 text-gray-400 text-sm"
                  >
                    No time logs found
                  </td>
                </tr>
              ) : (
                logsResult.rows.map((entry) => (
                  <tr
                    key={entry.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-5 py-3.5 font-medium text-gray-800">
                      <Link
                        href={`/admin/employees/${entry.employee.id}`}
                        className="hover:underline"
                      >
                        {entry.employee.name}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">
                      {fmtDate(entry.clockIn)}
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">
                      {fmtTime(entry.clockIn)}
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">
                      {entry.clockOut ? (
                        fmtTime(entry.clockOut)
                      ) : (
                        <span className="text-amber-500 font-medium">
                          In progress
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-gray-500">
                      {formatBreak(entry.breakType, entry.breakMinutes)}
                    </td>
                    <td className="px-5 py-3.5 text-right font-medium text-gray-800">
                      {entry.totalHours != null
                        ? `${Number(entry.totalHours).toFixed(2)}h`
                        : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {logsResult.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Page {logsResult.page} of {logsResult.totalPages} &middot;{" "}
            {logsResult.total} records
          </p>
          <div className="flex gap-2">
            {logsResult.page > 1 ? (
              <Link
                href={buildUrl(searchParams, {
                  page: String(logsResult.page - 1),
                })}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Prev
              </Link>
            ) : (
              <span className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-100 text-sm text-gray-300 cursor-not-allowed">
                <ChevronLeft className="w-4 h-4" /> Prev
              </span>
            )}
            {logsResult.page < logsResult.totalPages ? (
              <Link
                href={buildUrl(searchParams, {
                  page: String(logsResult.page + 1),
                })}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Next <ChevronRight className="w-4 h-4" />
              </Link>
            ) : (
              <span className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-100 text-sm text-gray-300 cursor-not-allowed">
                Next <ChevronRight className="w-4 h-4" />
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
