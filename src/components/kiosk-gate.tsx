"use client";

import { useState, useEffect } from "react";

const CODE_1 = process.env.NEXT_PUBLIC_KIOSK_CODE_1?.trim().toUpperCase();
const CODE_2 = process.env.NEXT_PUBLIC_KIOSK_CODE_2?.trim().toUpperCase();

const LOCATION_MAP: Record<string, string> = {
  [CODE_1 ?? ""]: "Findon",
  [CODE_2 ?? ""]: "Firle",
};

const STORAGE_KEY = "kiosk_location";

export function KioskGate({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<"loading" | "unlocked" | "locked">(
    "loading",
  );
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!CODE_1 && !CODE_2) {
      setStatus("unlocked");
      return;
    }
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && LOCATION_MAP[saved]) {
      setStatus("unlocked");
    } else {
      setStatus("locked");
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const upper = input.trim().toUpperCase();
    if (LOCATION_MAP[upper]) {
      localStorage.setItem(STORAGE_KEY, upper);
      setStatus("unlocked");
    } else {
      setError("Incorrect code. Please try again.");
      setInput("");
    }
  };

  if (status === "loading") return null;

  if (status === "unlocked") return <>{children}</>;

  return (
    <main className="min-h-screen min-h-dvh bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-xs w-full">
        <div className="text-5xl mb-6">🔒</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Shop Device Only</h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-8">
          Enter the kiosk code to unlock this device for clock-ins.
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            value={input}
            onChange={(e) => { setInput(e.target.value); setError(""); }}
            placeholder="Enter kiosk code"
            autoComplete="off"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-center text-lg font-medium tracking-widest focus:outline-none focus:ring-2 focus:ring-gray-400 uppercase"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full h-12 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors"
          >
            Unlock
          </button>
        </form>
      </div>
    </main>
  );
}

export function useKioskLocation(): string | null {
  if (typeof window === "undefined") return null;
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved && LOCATION_MAP[saved]) return LOCATION_MAP[saved];
  return null;
}
