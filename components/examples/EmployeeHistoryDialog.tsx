import { useState } from "react";
import EmployeeHistoryDialog from "../EmployeeHistoryDialog";
import { Button } from "@/components/ui/button";

export default function EmployeeHistoryDialogExample() {
  const [open, setOpen] = useState(true);

  const mockShifts = [
    {
      id: "1",
      date: new Date(2025, 10, 3),
      clockIn: new Date(2025, 10, 3, 9, 0),
      clockOut: new Date(2025, 10, 3, 17, 30),
      breakType: "unpaid" as const,
      totalHours: 8.0,
      isPaid: true,
    },
    {
      id: "2",
      date: new Date(2025, 10, 2),
      clockIn: new Date(2025, 10, 2, 8, 30),
      clockOut: new Date(2025, 10, 2, 16, 0),
      breakType: "paid" as const,
      totalHours: 7.5,
      isPaid: false,
    },
  ];

  return (
    <div className="p-8 min-h-screen flex items-center justify-center bg-background">
      <div className="space-y-4">
        <Button onClick={() => setOpen(true)}>Open History</Button>
        <EmployeeHistoryDialog
          open={open}
          onClose={() => setOpen(false)}
          employeeName="Sarah Johnson"
          shifts={mockShifts}
          weeklyTotal={15.5}
        />
      </div>
    </div>
  );
}
