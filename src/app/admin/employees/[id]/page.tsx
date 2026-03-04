import { getEmployeeProfile, getEmployeeShifts } from "@/app/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, BarChart2, Repeat2, Calendar } from "lucide-react";

function formatBreak(breakType: string | null, breakMinutes: number | null) {
  if (!breakType || breakType === "none") return "—";
  const mins = breakMinutes ?? 0;
  const paid = breakType === "paid" || breakType === "10_paid";
  return `${mins}m ${paid ? "(paid)" : "(unpaid)"}`;
}

function formatBreakLabel(value: string) {
  if (value === "none" || !value) return "No break";
  if (value === "paid" || value === "10_paid") return "10 min paid";
  if (value === "unpaid" || value === "30_unpaid") return "30 min unpaid";
  return value;
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

  const { employee, totalShifts, totalHours, avgShiftHours, mostCommonBreak } = profile;

  const stats = [
    { label: "Total Shifts", value: totalShifts, icon: Calendar },
    { label: "Total Hours", value: `${totalHours.toFixed(1)}h`, icon: Clock },
    { label: "Avg Shift", value: `${avgShiftHours.toFixed(1)}h`, icon: BarChart2 },
    { label: "Common Break", value: formatBreakLabel(mostCommonBreak), icon: Repeat2 },
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
          Member since {format(new Date(employee.createdAt), "MMMM d, yyyy")}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="border-gray-200 shadow-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4 px-5">
              <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                {label}
              </CardTitle>
              <Icon className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent className="px-5 pb-4">
              <div className="text-2xl font-bold text-gray-900">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-gray-200 shadow-none overflow-hidden">
        <CardHeader className="px-5 pt-5 pb-3 border-b border-gray-100">
          <CardTitle className="text-sm font-semibold text-gray-700">Shift History</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Date</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Clock In</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Clock Out</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Break</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Hours</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {shifts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-400">
                    No shifts recorded yet
                  </td>
                </tr>
              ) : (
                shifts.map((shift) => (
                  <tr key={shift.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5 text-gray-600">
                      {format(new Date(shift.clockIn), "MMM d, yyyy")}
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">
                      {format(new Date(shift.clockIn), "h:mm a")}
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">
                      {shift.clockOut ? (
                        format(new Date(shift.clockOut), "h:mm a")
                      ) : (
                        <span className="text-amber-500 font-medium">In progress</span>
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
