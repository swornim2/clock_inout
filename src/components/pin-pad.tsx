"use client";

import { useState, useEffect } from "react";
import { Delete } from "lucide-react";

interface PinPadProps {
  onSubmit: (pin: string) => void;
  error: string | null;
  loading: boolean;
  onClearError: () => void;
}

export function PinPad({
  onSubmit,
  error,
  loading,
  onClearError,
}: PinPadProps) {
  const [pin, setPin] = useState("");

  useEffect(() => {
    if (error) {
      const t = setTimeout(() => {
        setPin("");
        onClearError();
      }, 1200);
      return () => clearTimeout(t);
    }
  }, [error, onClearError]);

  const handlePress = (digit: string) => {
    if (loading || pin.length >= 4) return;
    onClearError();
    const next = pin + digit;
    setPin(next);
    if (next.length === 4) {
      onSubmit(next);
    }
  };

  const handleBackspace = () => {
    if (loading) return;
    onClearError();
    setPin((p) => p.slice(0, -1));
  };

  const handleClear = () => {
    if (loading) return;
    setPin("");
    onClearError();
  };

  const dots = Array.from({ length: 4 }, (_, i) => i);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col items-center gap-6">
      <div className="flex gap-4 h-10 items-center">
        {dots.map((i) => (
          <div
            key={i}
            className={`rounded-full transition-all duration-150 ${
              i < pin.length
                ? error
                  ? "w-4 h-4 bg-red-400"
                  : "w-4 h-4 bg-gray-800"
                : "w-3 h-3 bg-gray-200"
            }`}
          />
        ))}
      </div>

      {error && (
        <p className="text-red-500 text-sm font-medium -mt-2 animate-pulse">
          {error}
        </p>
      )}

      <div className="grid grid-cols-3 gap-3 w-full">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
          <button
            key={d}
            onClick={() => handlePress(d)}
            disabled={loading}
            className="h-16 rounded-xl bg-gray-50 hover:bg-gray-100 active:bg-gray-200 text-2xl font-medium text-gray-800 transition-colors disabled:opacity-40 select-none"
          >
            {d}
          </button>
        ))}
        <button
          onClick={handleClear}
          disabled={loading}
          className="h-16 rounded-xl bg-gray-50 hover:bg-gray-100 active:bg-gray-200 text-sm font-medium text-gray-500 transition-colors disabled:opacity-40 select-none"
        >
          Clear
        </button>
        <button
          onClick={() => handlePress("0")}
          disabled={loading}
          className="h-16 rounded-xl bg-gray-50 hover:bg-gray-100 active:bg-gray-200 text-2xl font-medium text-gray-800 transition-colors disabled:opacity-40 select-none"
        >
          0
        </button>
        <button
          onClick={handleBackspace}
          disabled={loading}
          className="h-16 rounded-xl bg-gray-50 hover:bg-gray-100 active:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors disabled:opacity-40 select-none"
        >
          <Delete className="w-5 h-5" />
        </button>
      </div>

      {loading && (
        <p className="text-sm text-gray-400 animate-pulse">Checking PIN…</p>
      )}
    </div>
  );
}
