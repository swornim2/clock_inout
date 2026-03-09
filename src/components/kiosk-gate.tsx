"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "kiosk_verified";
const KIOSK_CODE = process.env.NEXT_PUBLIC_KIOSK_CODE ?? "";

export function KioskGate({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<"loading" | "verified" | "blocked" | "entry">("loading");
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // No code configured → restriction disabled
    if (!KIOSK_CODE) {
      setStatus("verified");
      return;
    }
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === KIOSK_CODE) {
      setStatus("verified");
    } else {
      setStatus("entry");
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim().toUpperCase() === KIOSK_CODE.toUpperCase()) {
      localStorage.setItem(STORAGE_KEY, KIOSK_CODE);
      setStatus("verified");
    } else {
      setError("Incorrect code. Please ask your manager.");
      setInput("");
    }
  };

  if (status === "loading") return null;

  if (status === "verified") return <>{children}</>;

  return (
    <main className="min-h-screen min-h-dvh bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-xs text-center">
        <div className="text-5xl mb-6">🔒</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Shop Device Only</h1>
        <p className="text-sm text-gray-500 mb-8 leading-relaxed">
          This page is only for the in-store kiosk.
          <br />
          Enter the kiosk code to continue.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            value={input}
            onChange={(e) => { setInput(e.target.value.toUpperCase()); setError(""); }}
            placeholder="Enter kiosk code"
            autoComplete="off"
            autoCapitalize="characters"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-center text-lg font-mono tracking-widest text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300 uppercase"
          />
          {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
          <button
            type="submit"
            className="w-full h-12 rounded-xl bg-gray-900 text-white font-medium hover:bg-gray-700 transition-colors touch-manipulation"
          >
            Unlock
          </button>
        </form>
      </div>
    </main>
  );
}
