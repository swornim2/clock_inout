"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bell, Check, Pencil, X } from "lucide-react";
import { resolveNotification, updateTimeEntry } from "@/app/actions";
import { fmtDate, fmtTime } from "@/lib/tz";

type Notif = {
  id: number;
  message: string;
  createdAt: Date;
  employee: { id: number; name: string };
  timeEntry: {
    id: number;
    clockIn: Date;
    clockOut: Date | null;
    breakType: string | null;
    breakMinutes: number | null;
  };
};

function toLocalDatetimeValue(d: Date | null): string {
  if (!d) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  // Format as YYYY-MM-DDTHH:mm in Adelaide time for the input
  const adelaide = new Date(
    d.toLocaleString("en-AU", { timeZone: "Australia/Adelaide" }),
  );
  return `${adelaide.getFullYear()}-${pad(adelaide.getMonth() + 1)}-${pad(adelaide.getDate())}T${pad(adelaide.getHours())}:${pad(adelaide.getMinutes())}`;
}

function NotifRow({ notif }: { notif: Notif }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [clockOut, setClockOut] = useState(
    toLocalDatetimeValue(notif.timeEntry.clockOut),
  );
  const [isPending, startTransition] = useTransition();

  const handleResolve = () => {
    startTransition(async () => {
      await resolveNotification(notif.id);
      router.refresh();
    });
  };

  const handleSaveEdit = () => {
    startTransition(async () => {
      await updateTimeEntry(notif.timeEntry.id, {
        clockIn: new Date(notif.timeEntry.clockIn).toISOString(),
        clockOut: new Date(clockOut).toISOString(),
        breakType: notif.timeEntry.breakType ?? "none",
        breakMinutes: notif.timeEntry.breakMinutes ?? 0,
      });
      await resolveNotification(notif.id);
      router.refresh();
    });
  };

  return (
    <div className="border border-orange-200 rounded-xl p-4 bg-orange-50 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-orange-900">
            {notif.employee.name}
          </p>
          <p className="text-xs text-orange-600 mt-0.5">
            {fmtDate(notif.timeEntry.clockIn)} · clocked in {fmtTime(notif.timeEntry.clockIn)} → auto out at midnight
          </p>
        </div>
        <div className="flex gap-1.5 shrink-0">
          <button
            onClick={() => setEditing((v) => !v)}
            disabled={isPending}
            className="p-1.5 rounded-lg text-orange-500 hover:bg-orange-100 transition-colors"
            title="Edit clock-out time"
          >
            {editing ? <X className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
          </button>
          <button
            onClick={handleResolve}
            disabled={isPending}
            className="p-1.5 rounded-lg text-green-600 hover:bg-green-100 transition-colors"
            title="Dismiss"
          >
            <Check className="w-4 h-4" />
          </button>
        </div>
      </div>

      {editing && (
        <div className="space-y-2 pt-1">
          <label className="block text-xs font-medium text-orange-700">
            Correct clock-out time
          </label>
          <input
            type="datetime-local"
            value={clockOut}
            onChange={(e) => setClockOut(e.target.value)}
            className="w-full border border-orange-300 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
          />
          <button
            onClick={handleSaveEdit}
            disabled={isPending || !clockOut}
            className="w-full h-9 rounded-lg bg-orange-600 text-white text-sm font-medium hover:bg-orange-700 transition-colors disabled:opacity-50"
          >
            {isPending ? "Saving…" : "Save & Resolve"}
          </button>
        </div>
      )}
    </div>
  );
}

export function NotificationsPanel({ notifications }: { notifications: Notif[] }) {
  if (notifications.length === 0) return null;

  return (
    <div className="rounded-2xl border border-orange-300 bg-white shadow-none overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-orange-200 bg-orange-50">
        <Bell className="w-4 h-4 text-orange-500" />
        <h2 className="text-sm font-semibold text-orange-800">
          Missed Clock-Outs
        </h2>
        <span className="ml-auto text-xs font-medium bg-orange-200 text-orange-700 px-2 py-0.5 rounded-full">
          {notifications.length} unresolved
        </span>
      </div>
      <div className="p-4 space-y-3">
        {notifications.map((n) => (
          <NotifRow key={n.id} notif={n} />
        ))}
      </div>
    </div>
  );
}
