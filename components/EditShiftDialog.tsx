import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface EditShiftDialogProps {
  open: boolean;
  onClose: () => void;
  shift: {
    id: string;
    employeeName: string;
    totalHours: number | null;
    isPaid: boolean;
  };
  onSave: (id: string, totalHours: number, isPaid: boolean) => void;
}

export default function EditShiftDialog({
  open,
  onClose,
  shift,
  onSave,
}: EditShiftDialogProps) {
  const [hours, setHours] = useState(shift.totalHours?.toString() || "0");
  const [isPaid, setIsPaid] = useState(shift.isPaid);

  const handleSave = () => {
    const parsedHours = parseFloat(hours);
    if (!isNaN(parsedHours) && parsedHours >= 0) {
      onSave(shift.id, parsedHours, isPaid);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Shift</DialogTitle>
          <DialogDescription>
            Editing shift for {shift.employeeName}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="hours">Total Hours</Label>
            <Input
              id="hours"
              type="number"
              step="0.1"
              min="0"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className="h-12 font-mono text-lg"
              data-testid="input-hours"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="paid-switch">Payment Status</Label>
              <p className="text-sm text-muted-foreground">
                Mark this shift as {isPaid ? "paid" : "unpaid"}
              </p>
            </div>
            <Switch
              id="paid-switch"
              checked={isPaid}
              onCheckedChange={setIsPaid}
              data-testid="switch-paid-status"
            />
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleSave}
              data-testid="button-save"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
