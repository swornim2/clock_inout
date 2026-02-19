import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock, UserCheck, Calendar } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
}

function StatCard({ title, value, icon, description }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold" data-testid={`stat-${title.toLowerCase().replace(/\s+/g, "-")}`}>
          {value}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

interface DashboardStatsProps {
  totalEmployees: number;
  clockedIn: number;
  hoursToday: number;
  hoursThisWeek: number;
}

export default function DashboardStats({
  totalEmployees,
  clockedIn,
  hoursToday,
  hoursThisWeek,
}: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Total Employees"
        value={totalEmployees}
        icon={<Users className="h-4 w-4" />}
      />
      <StatCard
        title="Clocked In"
        value={clockedIn}
        icon={<UserCheck className="h-4 w-4" />}
        description={`${totalEmployees - clockedIn} clocked out`}
      />
      <StatCard
        title="Hours Today"
        value={`${hoursToday.toFixed(1)}h`}
        icon={<Clock className="h-4 w-4" />}
      />
      <StatCard
        title="Hours This Week"
        value={`${hoursThisWeek.toFixed(1)}h`}
        icon={<Calendar className="h-4 w-4" />}
      />
    </div>
  );
}
