"use client";

import { useEffect, useState } from "react";
import { User } from "lucide-react";
import { PinModal } from "@/components/pin-modal";
import { BreakModal } from "@/components/break-modal";
import { AnimationOverlay } from "@/components/animation-overlay";
import { clockIn } from "@/app/actions";
import { useToast } from "@/components/ui/use-toast";
import type { Employee } from "@/lib/db/schema";

async function getEmployeesWithStatus(): Promise<
  (Employee & { isClockedIn: boolean })[]
> {
  const res = await fetch("/api/employees", { cache: "no-store" });
  return res.json();
}

export default function ClockPage() {
  const { toast } = useToast();
  const [employees, setEmployees] = useState<
    (Employee & { isClockedIn: boolean })[]
  >([]);
  const [selectedEmployee, setSelectedEmployee] = useState<
    (Employee & { isClockedIn: boolean }) | null
  >(null);
  const [isBreakModalOpen, setBreakModalOpen] = useState(false);
  const [animationMessage, setAnimationMessage] = useState<string | null>(null);

  useEffect(() => {
    getEmployeesWithStatus().then(setEmployees);
  }, []);

  const handlePinSubmit = async (pin: string) => {
    if (!selectedEmployee) return;

    if (pin !== selectedEmployee.pin) {
      toast({
        title: "Error",
        description: "Invalid PIN",
        variant: "destructive",
      });
      return;
    }

    if (selectedEmployee.isClockedIn) {
      setBreakModalOpen(true);
    } else {
      handleClockIn();
    }
  };

  const handleClockIn = async (minutes?: number, type?: string) => {
    if (!selectedEmployee) return;

    const result = await clockIn(selectedEmployee.pin, {
      minutes: minutes || 0,
      type: type || "none",
    });
    if (result.success) {
      setAnimationMessage(result.message);
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      });
    }
  };

  if (animationMessage) {
    return <AnimationOverlay message={animationMessage} />;
  }

  return (
    <main className="container mx-auto flex min-h-screen flex-col items-center justify-center space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">Employee Clock</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Select your name to clock in or out
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {employees.map((employee) => (
          <div
            key={employee.id}
            onClick={() => setSelectedEmployee(employee)}
            className="flex cursor-pointer flex-col items-center space-y-3 rounded-lg border bg-card p-6 text-center transition-transform hover:scale-105"
          >
            <div className="rounded-full bg-muted p-4">
              <User className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold">{employee.name}</h2>
            <span
              className={`rounded-full px-3 py-1 text-sm font-medium ${
                employee.isClockedIn
                  ? "bg-blue-100 text-blue-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {employee.isClockedIn ? "Clocked In" : "Clocked Out"}
            </span>
          </div>
        ))}
      </div>
      <PinModal
        employee={selectedEmployee}
        onClose={() => setSelectedEmployee(null)}
        onSubmit={handlePinSubmit}
      />
      <BreakModal
        isOpen={isBreakModalOpen}
        onClose={() => setBreakModalOpen(false)}
        onSubmit={(minutes, type) => handleClockIn(minutes, type)}
      />
    </main>
  );
}
