"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Coffee, Clock } from "lucide-react";

interface BreakModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (breakMinutes: number, breakType: string) => void;
}

export function BreakModal({ isOpen, onClose, onSubmit }: BreakModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Break Time</DialogTitle>
          <p className="text-muted-foreground">
            Your shift is longer than 6 hours. Did you take a break?
          </p>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          <div
            onClick={() => onSubmit(10, "paid")}
            className="cursor-pointer rounded-lg border p-4 transition-colors hover:bg-muted"
          >
            <div className="flex items-center space-x-4">
              <Coffee className="h-6 w-6" />
              <div>
                <h3 className="font-semibold">10 Minute Paid Break</h3>
                <p className="text-sm text-muted-foreground">
                  Counts towards total hours
                </p>
              </div>
            </div>
          </div>
          <div
            onClick={() => onSubmit(30, "unpaid")}
            className="cursor-pointer rounded-lg border p-4 transition-colors hover:bg-muted"
          >
            <div className="flex items-center space-x-4">
              <Clock className="h-6 w-6" />
              <div>
                <h3 className="font-semibold">30 Minute Unpaid Break</h3>
                <p className="text-sm text-muted-foreground">
                  Deducted from total hours
                </p>
              </div>
            </div>
          </div>
        </div>
        <Button variant="link" className="mt-4 w-full" onClick={() => onSubmit(0, "none")}>
          Skip - No break taken
        </Button>
      </DialogContent>
    </Dialog>
  );
}
