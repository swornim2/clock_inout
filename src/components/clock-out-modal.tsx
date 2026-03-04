"use client";

import { useState } from "react";

interface ClockOutModalProps {
  employeeName: string;
  pin: string;
  onConfirm: (pin: string, minutes: number, breakType: string) => void;
  onCancel: () => void;
  loading: boolean;
}

const BREAK_OPTIONS = [
  { label: "30 min unpaid break", minutes: 30, type: "unpaid" },
  { label: "10 min paid break", minutes: 10, type: "paid" },
  { label: "No break", minutes: 0, type: "none" },
];

export function ClockOutModal({
  employeeName,
  pin,
  onConfirm,
  onCancel,
  loading,
}: ClockOutModalProps) {
  const [selected, setSelected] = useState<number | null>(null);

  const handleConfirm = () => {
    if (selected === null) return;
    const opt = BREAK_OPTIONS[selected];
    onConfirm(pin, opt.minutes, opt.type);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Clock Out</h2>
          <p className="text-gray-500 mt-1 text-sm">
            Hi <span className="font-medium text-gray-700">{employeeName}</span> — select your break before clocking out.
          </p>
        </div>

        <div className="p-6 space-y-3">
          {BREAK_OPTIONS.map((opt, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all text-sm font-medium ${
                selected === i
                  ? "border-gray-800 bg-gray-50 text-gray-900"
                  : "border-gray-100 bg-white text-gray-600 hover:border-gray-200"
              }`}
            >
              <span className={`inline-block w-4 h-4 rounded-full border-2 mr-3 align-middle transition-colors ${
                selected === i ? "border-gray-800 bg-gray-800" : "border-gray-300"
              }`} />
              {opt.label}
            </button>
          ))}
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 h-12 rounded-xl border-2 border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={selected === null || loading}
            className="flex-1 h-12 rounded-xl bg-gray-900 text-white font-medium hover:bg-gray-700 transition-colors disabled:opacity-30"
          >
            {loading ? "Clocking out…" : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}
