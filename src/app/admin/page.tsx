import {
  getExtendedDashboardStats,
  getDailyHoursLast7Days,
  getClockedInNow,
  getTotalOutstandingHours,
  getUnresolvedNotifications,
} from "@/app/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Clock,
  Hourglass,
  Calendar,
  CalendarDays,
  UserCheck,
  AlertCircle,
} from "lucide-react";
import { HoursChart } from "@/components/hours-chart";
import { fmtTime } from "@/lib/tz";
import { LiveClock } from "@/components/live-clock";
import { NotificationsPanel } from "@/components/notifications-panel";
import { ClockOutAllButton } from "@/components/clock-out-all-button";

export default async function AdminPage() {
  const [stats, chartData, clockedIn, outstandingHours, unresolvedNotifs] =
    await Promise.all([
      getExtendedDashboardStats(),
      getDailyHoursLast7Days(),
      getClockedInNow(),
      getTotalOutstandingHours(),
      getUnresolvedNotifications(),
    ]);

  const summaryCards = [
    {
      label: "Total Employees",
      value: stats.totalEmployees,
      icon: Users,
      sub: null,
    },
    {
      label: "Currently Clocked In",
      value: stats.clockedIn,
      icon: UserCheck,
      sub: `${stats.totalEmployees - stats.clockedIn} clocked out`,
    },
    {
      label: "Hours Today",
      value: `${stats.hoursToday.toFixed(1)}h`,
      icon: Hourglass,
      sub: null,
    },
    {
      label: "Hours This Week",
      value: `${stats.hoursThisWeek.toFixed(1)}h`,
      icon: Calendar,
      sub: null,
    },
    {
      label: "Hours This Month",
      value: `${stats.hoursThisMonth.toFixed(1)}h`,
      icon: CalendarDays,
      sub: null,
    },
    {
      label: "Outstanding Pay",
      value: `${outstandingHours.toFixed(1)}h`,
      icon: AlertCircle,
      sub: outstandingHours > 0 ? "unpaid hours" : "all paid",
      highlight: outstandingHours > 0,
    },
  ];

  return (
    <div className="space-y-8">
      <NotificationsPanel notifications={unresolvedNotifs as any} />
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Overview of your team's time tracking
          </p>
        </div>
        <div className="text-right">
          <LiveClock variant="compact" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {summaryCards.map(({ label, value, icon: Icon, sub, highlight }) => (
          <Card
            key={label}
            className={`shadow-none ${
              highlight ? "border-orange-300 bg-orange-50" : "border-gray-200"
            }`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4 px-5">
              <CardTitle
                className={`text-xs font-medium uppercase tracking-wide ${
                  highlight ? "text-orange-600" : "text-gray-500"
                }`}
              >
                {label}
              </CardTitle>
              <Icon
                className={`h-4 w-4 ${highlight ? "text-orange-400" : "text-gray-400"}`}
              />
            </CardHeader>
            <CardContent className="px-5 pb-4">
              <div
                className={`text-2xl font-bold ${
                  highlight ? "text-orange-700" : "text-gray-900"
                }`}
              >
                {value}
              </div>
              {sub && (
                <p
                  className={`text-xs mt-1 ${
                    highlight ? "text-orange-500" : "text-gray-400"
                  }`}
                >
                  {sub}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-gray-200 shadow-none">
          <CardHeader className="px-5 pt-5 pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700">
              Hours Worked — Last 7 Days
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <HoursChart data={chartData} />
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-none">
          <CardHeader className="px-5 pt-5 pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Currently Clocked In
              {clockedIn.length > 0 && (
                <span className="text-xs font-normal bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                  {clockedIn.length}
                </span>
              )}
              <div className="ml-auto">
                <ClockOutAllButton count={clockedIn.length} />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            {clockedIn.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">
                No one is clocked in
              </p>
            ) : (
              <ul className="space-y-3">
                {clockedIn.map((emp) => (
                  <li
                    key={emp.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-400" />
                      <span className="text-sm font-medium text-gray-800">
                        {emp.name}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">
                      since {fmtTime(emp.clockIn)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
