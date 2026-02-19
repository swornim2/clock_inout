"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Employee } from "@/lib/db/schema";
import { PinPad } from "./pin-pad";
import { User } from "lucide-react";
import { useState } from "react";

interface PinModalProps {
  employee: (Employee & { isClockedIn: boolean }) | null;
  onClose: () => void;
  onSubmit: (pin: string) => void;
}

export function PinModal({ employee, onClose, onSubmit }: PinModalProps) {
  const [pin, setPin] = useState("");

  if (!employee) return null;

  const handlePinSubmit = () => {
    onSubmit(pin);
    setPin("");
  };

  return (
    <Dialog open={!!employee} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="sr-only">Enter PIN</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4 pt-8">
          <div className="rounded-full bg-muted p-4">
            <User className="h-16 w-16 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold">{employee.name}</h2>
          <span
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              employee.isClockedIn
                ? "bg-blue-100 text-blue-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            Currently {employee.isClockedIn ? "Clocked In" : "Clocked Out"}
          </span>
        </div>
        <div className="mt-8 text-center">
          <h3 className="text-xl font-semibold">Enter Your PIN to Clock In</h3>
          <p className="text-muted-foreground">4-digit PIN</p>
        </div>
        <PinPad pin={pin} onPinChange={setPin} onSubmit={handlePinSubmit} />
      </DialogContent>
    </Dialog>
  );
}
