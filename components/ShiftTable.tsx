import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Edit } from "lucide-react";

interface ShiftEntry {
  id: string;
  employeeName: string;
  date: Date;
  clockIn: Date;
  clockOut: Date | null;
  breakType: string | null;
  totalHours: number | null;
  isPaid: boolean;
}

interface ShiftTableProps {
  shifts: ShiftEntry[];
  weekLabel?: string;
  onEditShift?: (shift: ShiftEntry) => void;
}

export default function ShiftTable({ shifts, weekLabel, onEditShift }: ShiftTableProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle>{weekLabel || "Weekly Shift Summary"}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[150px]">Employee</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Clock In</TableHead>
                <TableHead>Clock Out</TableHead>
                <TableHead>Break</TableHead>
                <TableHead className="text-right">Hours</TableHead>
                <TableHead>Status</TableHead>
                {onEditShift && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {shifts.map((shift) => (
                <TableRow key={shift.id} data-testid={`row-shift-${shift.id}`}>
                  <TableCell className="font-medium">
                    {shift.employeeName}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {format(shift.date, "EEE, MMM d")}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {format(shift.clockIn, "h:mm a")}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {shift.clockOut ? format(shift.clockOut, "h:mm a") : "-"}
                  </TableCell>
                  <TableCell>
                    {shift.breakType ? (
                      <Badge variant="outline" className="text-xs">
                        {shift.breakType === "paid" ? "10m Paid" : "30m Unpaid"}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">None</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold">
                    {shift.totalHours !== null
                      ? `${shift.totalHours.toFixed(1)}h`
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={shift.isPaid ? "default" : "secondary"}
                      data-testid={`badge-payment-${shift.isPaid ? "paid" : "unpaid"}`}
                    >
                      {shift.isPaid ? "Paid" : "Unpaid"}
                    </Badge>
                  </TableCell>
                  {onEditShift && (
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onEditShift(shift)}
                        data-testid={`button-edit-${shift.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
