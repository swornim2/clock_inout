"use client";

import { useState } from "react";
import { EditEmployeeModal } from "@/components/edit-employee-modal";
import { EditTimeEntryModal } from "@/components/edit-time-entry-modal";
import { Pencil, Trash2 } from "lucide-react";

interface Employee {
  id: number;
  name: string;
  pin: string;
}

interface TimeEntry {
  id: number;
  clockIn: Date | string;
  clockOut: Date | string | null;
  breakType: string | null;
  breakMinutes: number | null;
}

export function EditEmployeeButton({ employee }: { employee: Employee }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-50 transition-colors"
      >
        <Pencil className="w-3.5 h-3.5" />
        Edit
      </button>
      {open && <EditEmployeeModal employee={employee} onClose={() => setOpen(false)} />}
    </>
  );
}

export function EditTimeEntryButton({ entry }: { entry: TimeEntry }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Edit shift"
        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
      >
        <Pencil className="w-3.5 h-3.5" />
      </button>
      {open && <EditTimeEntryModal entry={entry} onClose={() => setOpen(false)} />}
    </>
  );
}
