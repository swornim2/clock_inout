import { getEmployeeProfile, getEmployeeShifts } from "@/app/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PayrollToggle } from "@/components/payroll-actions";
import { PayoutWeekButton } from "@/components/payout-week-button";
import { fmtDate, fmtTime } from "@/lib/tz";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  BarChart2,
  Calendar,
  AlertCircle,
} from "lucide-react";

function formatBreak(breakType: string | null, breakMinutes: number | null) {
  if (!breakType || breakType === "none") return "—";
  const mins = breakMinutes ?? 0;
  const paid = breakType === "paid" || breakType === "10_paid";
  return `${mins}m ${paid ? "(paid)" : "(unpaid)"}`;
}

export default async function EmployeeProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const id = Number(params.id);
  if (isNaN(id)) notFound();

  const [profile, shifts] = await Promise.all([
    getEmployeeProfile(id),
    getEmployeeShifts(id),
  ]);

  if (!profile) notFound();

  const {
    employee,
    totalShifts,
    totalHours,
    avgShiftHours,
    thisWeekHours,
    unpaidHours,
    weekStart,
    weekEnd,
  } = profile;

  // Split shifts into this-week and history
  const _wkFmt = new Intl.DateTimeFormat("en-AU", {
    timeZone: "Australia/Adelaide",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour12: false,
  });
  const thisWeekShifts = shifts.filter((s) => {
    if (!s.clockOut) return false;
    const _p = Object.fromEntries(
      _wkFmt.formatToParts(new Date(s.clockIn)).map((x) => [x.type, x.value]),
    );
    const clockInAd = new Date(
      Number(_p.year),
      Number(_p.month) - 1,
      Number(_p.day),
    );
    return clockInAd >= weekStart && clockInAd <= weekEnd;
  });

  const unpaidWeekCount = thisWeekShifts.filter((s) => !s.isPaid).length;

  const completedShifts = shifts.filter((s) => s.clockOut != null);

  const stats = [
    {
      label: "This Week",
      value: `${thisWeekHours.toFixed(2)}h`,
      icon: Clock,
      highlight: false,
      sub: `${thisWeekShifts.length} shift${thisWeekShifts.length !== 1 ? "s" : ""}`,
    },
    {
      label: "Unpaid Hours",
      value: `${unpaidHours.toFixed(2)}h`,
      icon: AlertCircle,
      highlight: unpaidHours > 0,
      sub: unpaidHours > 0 ? "outstanding" : "all paid",
    },
    {
      label: "Total Shifts",
      value: totalShifts,
      icon: Calendar,
      highlight: false,
      sub: null,
    },
    {
      label: "Avg Shift",
      value: `${avgShiftHours.toFixed(1)}h`,
      icon: BarChart2,
      highlight: false,
      sub: null,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/employees"
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Employees
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">{employee.name}</h1>
        <p className="text-sm text-gray-500 mt-1">
          Member since {fmtDate(employee.createdAt)}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, highlight, sub }) => (
          <Card
            key={label}
            className={`shadow-none ${highlight ? "border-orange-300 bg-orange-50" : "border-gray-200"}`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4 px-5">
              <CardTitle
                className={`text-xs font-medium uppercase tracking-wide ${highlight ? "text-orange-600" : "text-gray-500"}`}
              >
                {label}
              </CardTitle>
              <Icon
                className={`h-4 w-4 ${highlight ? "text-orange-400" : "text-gray-400"}`}
              />
            </CardHeader>
            <CardContent className="px-5 pb-4">
              <div
                className={`text-2xl font-bold ${highlight ? "text-orange-700" : "text-gray-900"}`}
              >
                {value}
              </div>
              {sub && (
                <p
                  className={`text-xs mt-1 ${highlight ? "text-orange-500" : "text-gray-400"}`}
                >
                  {sub}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* This Week section */}
      <Card className="border-gray-200 shadow-none overflow-hidden">
        <CardHeader className="px-5 pt-5 pb-3 border-b border-gray-100 flex flex-row items-center justify-between gap-3 flex-wrap">
          <div>
            <CardTitle className="text-sm font-semibold text-gray-700">
              This Week
            </CardTitle>
            <p className="text-xs text-gray-400 mt-0.5">
              {fmtDate(weekStart)} – {fmtDate(weekEnd)}
            </p>
          </div>
          <PayoutWeekButton
            employeeId={employee.id}
            unpaidCount={unpaidWeekCount}
          />
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
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
                <th className="text-center px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Pay Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {thisWeekShifts.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-8 text-gray-400 text-sm"
                  >
                    No shifts this week yet
                  </td>
                </tr>
              ) : (
                thisWeekShifts.map((shift) => (
                  <tr
                    key={shift.id}
                    className={`hover:bg-gray-50 transition-colors ${shift.isPaid ? "" : "bg-orange-50/40"}`}
                  >
                    <td className="px-5 py-3.5 text-gray-600">
                      {fmtDate(shift.clockIn)}
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">
                      {fmtTime(shift.clockIn)}
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">
                      {shift.clockOut ? (
                        fmtTime(shift.clockOut)
                      ) : (
                        <span className="text-amber-500 font-medium">
                          In progress
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-gray-500">
                      {formatBreak(shift.breakType, shift.breakMinutes)}
                    </td>
                    <td className="px-5 py-3.5 text-right font-medium text-gray-800">
                      {shift.totalHours != null
                        ? `${Number(shift.totalHours).toFixed(2)}h`
                        : "—"}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <PayrollToggle
                        shiftId={shift.id}
                        isPaid={shift.isPaid ?? false}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {thisWeekShifts.length > 0 && (
              <tfoot>
                <tr className="border-t border-gray-100 bg-gray-50">
                  <td
                    colSpan={4}
                    className="px-5 py-3 text-xs font-medium text-gray-500"
                  >
                    Week Total
                  </td>
                  <td className="px-5 py-3 text-right text-sm font-bold text-gray-800">
                    {thisWeekHours.toFixed(2)}h
                  </td>
                  <td />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </Card>

      {/* Full shift history */}
      <Card className="border-gray-200 shadow-none overflow-hidden">
        <CardHeader className="px-5 pt-5 pb-3 border-b border-gray-100 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold text-gray-700">
            Shift History
          </CardTitle>
          <span className="text-xs text-gray-400">
            {totalHours.toFixed(2)}h total · {totalShifts} shifts
          </span>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
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
                <th className="text-center px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Pay Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {completedShifts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">
                    No shifts recorded yet
                  </td>
                </tr>
              ) : (
                completedShifts.map((shift) => (
                  <tr
                    key={shift.id}
                    className={`hover:bg-gray-50 transition-colors ${shift.isPaid ? "" : "bg-orange-50/30"}`}
                  >
                    <td className="px-5 py-3.5 text-gray-600">
                      {fmtDate(shift.clockIn)}
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">
                      {fmtTime(shift.clockIn)}
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">
                      {shift.clockOut ? (
                        fmtTime(shift.clockOut)
                      ) : (
                        <span className="text-amber-500 font-medium">
                          In progress
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-gray-500">
                      {formatBreak(shift.breakType, shift.breakMinutes)}
                    </td>
                    <td className="px-5 py-3.5 text-right font-medium text-gray-800">
                      {shift.totalHours != null
                        ? `${Number(shift.totalHours).toFixed(2)}h`
                        : "—"}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <PayrollToggle
                        shiftId={shift.id}
                        isPaid={shift.isPaid ?? false}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
