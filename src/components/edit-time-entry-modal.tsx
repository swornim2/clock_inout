"use client";

import { useState, useTransition } from "react";
import { updateTimeEntry, deleteTimeEntry } from "@/app/actions";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

interface EditTimeEntryModalProps {
  entry: {
    id: number;
    clockIn: Date | string;
    clockOut: Date | string | null;
    breakType: string | null;
    breakMinutes: number | null;
  };
  onClose: () => void;
}

function toLocalDateTimeInput(d: Date | string | null): string {
  if (!d) return "";
  const dt = new Date(d);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
}

const BREAK_OPTIONS = [
  { label: "No break", type: "none", minutes: 0 },
  { label: "10 min paid break", type: "paid", minutes: 10 },
  { label: "30 min unpaid break", type: "unpaid", minutes: 30 },
];

export function EditTimeEntryModal({ entry, onClose }: EditTimeEntryModalProps) {
  const [clockIn, setClockIn] = useState(toLocalDateTimeInput(entry.clockIn));
  const [clockOut, setClockOut] = useState(toLocalDateTimeInput(entry.clockOut ?? null));
  const [breakType, setBreakType] = useState(entry.breakType ?? "none");
  const [breakMinutes, setBreakMinutes] = useState(entry.breakMinutes ?? 0);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const router = useRouter();

  const handleBreakChange = (type: string) => {
    setBreakType(type);
    const opt = BREAK_OPTIONS.find((o) => o.type === type);
    setBreakMinutes(opt?.minutes ?? 0);
  };

  const handleSave = () => {
    if (!clockIn || !clockOut) {
      setError("Both clock in and clock out times are required.");
      return;
    }
    if (new Date(clockIn) >= new Date(clockOut)) {
      setError("Clock out must be after clock in.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await updateTimeEntry(entry.id, { clockIn, clockOut, breakType, breakMinutes });
      if (res.success) {
        router.refresh();
        onClose();
      } else {
        setError(res.message ?? "Failed to update.");
      }
    });
  };

  const handleDelete = () => {
    startDeleteTransition(async () => {
      await deleteTimeEntry(entry.id);
      router.refresh();
      onClose();
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Edit Shift</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Clock In</label>
            <input
              type="datetime-local"
              value={clockIn}
              onChange={(e) => setClockIn(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Clock Out</label>
            <input
              type="datetime-local"
              value={clockOut}
              onChange={(e) => setClockOut(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Break</label>
            <div className="space-y-2">
              {BREAK_OPTIONS.map((opt) => (
                <button
                  key={opt.type}
                  type="button"
                  onClick={() => handleBreakChange(opt.type)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                    breakType === opt.type
                      ? "border-gray-800 bg-gray-50 text-gray-900"
                      : "border-gray-100 text-gray-600 hover:border-gray-200"
                  }`}
                >
                  <span className={`inline-block w-3.5 h-3.5 rounded-full border-2 mr-2 align-middle transition-colors ${
                    breakType === opt.type ? "border-gray-800 bg-gray-800" : "border-gray-300"
                  }`} />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        <div className="px-6 pb-4 flex gap-3">
          <button
            onClick={onClose}
            disabled={isPending}
            className="flex-1 h-10 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isPending}
            className="flex-1 h-10 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-40"
          >
            {isPending ? "Saving…" : "Save"}
          </button>
        </div>

        <div className="px-6 pb-6 border-t border-gray-100 pt-4">
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="w-full h-10 rounded-xl border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors"
            >
              Delete Shift…
            </button>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-red-600 text-center font-medium">Delete this shift record?</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="flex-1 h-9 rounded-xl border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 h-9 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-40"
                >
                  {isDeleting ? "Deleting…" : "Yes, Delete"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
