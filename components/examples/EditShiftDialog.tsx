import { useState } from "react";
import EditShiftDialog from "../EditShiftDialog";
import { Button } from "@/components/ui/button";

export default function EditShiftDialogExample() {
  const [open, setOpen] = useState(true);

  const mockShift = {
    id: "1",
    employeeName: "Sarah Johnson",
    totalHours: 8.5,
    isPaid: false,
  };

  return (
    <div className="p-8 min-h-screen flex items-center justify-center bg-background">
      <div className="space-y-4">
        <Button onClick={() => setOpen(true)}>Open Edit Dialog</Button>
        <EditShiftDialog
          open={open}
          onClose={() => setOpen(false)}
          shift={mockShift}
          onSave={(id, hours, isPaid) => {
            console.log("Saved:", { id, hours, isPaid });
            setOpen(false);
          }}
        />
      </div>
    </div>
  );
}
