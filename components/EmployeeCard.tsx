import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, User } from "lucide-react";

interface EmployeeCardProps {
  id: string;
  name: string;
  hoursThisWeek: number;
  isClockedIn: boolean;
  onViewHistory?: () => void;
}

export default function EmployeeCard({
  name,
  hoursThisWeek,
  isClockedIn,
  onViewHistory,
}: EmployeeCardProps) {
  return (
    <Card className="hover-elevate">
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          {name}
        </CardTitle>
        <Badge
          variant={isClockedIn ? "default" : "secondary"}
          data-testid={`badge-status-${isClockedIn ? "in" : "out"}`}
        >
          {isClockedIn ? "Clocked In" : "Clocked Out"}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">This Week:</span>
          <span className="font-mono font-semibold" data-testid="text-hours">
            {hoursThisWeek.toFixed(1)}h
          </span>
        </div>
        {onViewHistory && (
          <Button
            size="sm"
            variant="outline"
            className="w-full"
            onClick={onViewHistory}
            data-testid="button-view-history"
          >
            View History
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
