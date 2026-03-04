"use client";

import { useState, useEffect } from "react";
import { checkPin, clockIn, clockOut } from "@/app/actions";
import { PinPad } from "@/components/pin-pad";
import { ClockOutModal } from "@/components/clock-out-modal";
import { ClockedInPanel } from "@/components/clocked-in-panel";
import { SuccessOverlay } from "@/components/success-overlay";
import { LiveClock } from "@/components/live-clock";

type Screen =
  | { name: "pin" }
  | { name: "clockout"; employeeName: string; pin: string }
  | { name: "success"; message: string; type: "in" | "out" }
  | { name: "list" };

export default function ClockPage() {
  const [screen, setScreen] = useState<Screen>({ name: "pin" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (screen.name === "success") {
      const t = setTimeout(() => setScreen({ name: "pin" }), 2500);
      return () => clearTimeout(t);
    }
  }, [screen.name]);

  const handlePinSubmit = async (pin: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await checkPin(pin);
      if (!result.success) {
        setError(result.message);
        return;
      }
      if (result.needsClockOut) {
        setScreen({ name: "clockout", employeeName: result.employeeName, pin });
      } else {
        const res = await clockIn(pin);
        if (!res.success) {
          setError(res.message);
          return;
        }
        setScreen({ name: "success", message: res.message, type: "in" });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClockOut = async (
    pin: string,
    minutes: number,
    breakType: string,
  ) => {
    setLoading(true);
    try {
      const res = await clockOut(pin, { minutes, type: breakType });
      if (!res.success) {
        setError(res.message);
        setScreen({ name: "pin" });
        return;
      }
      setScreen({ name: "success", message: res.message, type: "out" });
    } finally {
      setLoading(false);
    }
  };

  if (screen.name === "success") {
    return <SuccessOverlay message={screen.message} type={screen.type} />;
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-4">
            TimeTrack
          </h1>
          <LiveClock variant="large" />
          <p className="text-gray-400 mt-4 text-sm">Enter your 4-digit PIN</p>
        </div>

        <PinPad
          onSubmit={handlePinSubmit}
          error={error}
          loading={loading}
          onClearError={() => setError(null)}
        />

        <button
          onClick={() => setScreen({ name: "list" })}
          className="mt-6 w-full text-center text-sm text-gray-400 hover:text-gray-700 transition-colors py-2"
        >
          View currently clocked-in employees →
        </button>
      </div>

      {screen.name === "clockout" && (
        <ClockOutModal
          employeeName={screen.employeeName}
          pin={screen.pin}
          onConfirm={handleClockOut}
          onCancel={() => setScreen({ name: "pin" })}
          loading={loading}
        />
      )}

      {screen.name === "list" && (
        <ClockedInPanel onClose={() => setScreen({ name: "pin" })} />
      )}
    </main>
  );
}
