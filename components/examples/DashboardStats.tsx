import DashboardStats from "../DashboardStats";

export default function DashboardStatsExample() {
  return (
    <div className="p-8 bg-background">
      <DashboardStats
        totalEmployees={12}
        clockedIn={5}
        hoursToday={38.5}
        hoursThisWeek={287.5}
      />
    </div>
  );
}
