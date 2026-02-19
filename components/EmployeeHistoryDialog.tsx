import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface ShiftEntry {
  id: string;
  date: Date;
  clockIn: Date;
  clockOut: Date | null;
  breakType: string | null;
  totalHours: number | null;
  isPaid: boolean;
}

interface EmployeeHistoryDialogProps {
  open: boolean;
  onClose: () => void;
  employeeName: string;
  shifts: ShiftEntry[];
  weeklyTotal: number;
}

export default function EmployeeHistoryDialog({
  open,
  onClose,
  employeeName,
  shifts,
  weeklyTotal,
}: EmployeeHistoryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{employeeName}</DialogTitle>
          <DialogDescription>
            Shift history and weekly summary
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border bg-card">
              <p className="text-sm text-muted-foreground">Total Shifts</p>
              <p className="text-3xl font-bold" data-testid="text-total-shifts">
                {shifts.length}
              </p>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <p className="text-sm text-muted-foreground">Weekly Hours</p>
              <p className="text-3xl font-bold font-mono" data-testid="text-weekly-hours">
                {weeklyTotal.toFixed(1)}h
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Clock In</TableHead>
                  <TableHead>Clock Out</TableHead>
                  <TableHead>Break</TableHead>
                  <TableHead className="text-right">Hours</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shifts.map((shift) => (
                  <TableRow key={shift.id} data-testid={`row-shift-${shift.id}`}>
                    <TableCell className="font-mono text-sm">
                      {format(shift.date, "MMM d, yyyy")}
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
                      {shift.totalHours !== null ? `${shift.totalHours.toFixed(1)}h` : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={shift.isPaid ? "default" : "secondary"}>
                        {shift.isPaid ? "Paid" : "Unpaid"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
