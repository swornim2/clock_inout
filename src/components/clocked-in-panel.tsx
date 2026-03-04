"use client";

import { useEffect, useState } from "react";
import { getClockedInEmployees } from "@/app/actions";
import { X, User } from "lucide-react";
import { fmtTime } from "@/lib/tz";

type ClockedInEmployee = {
  id: number;
  name: string;
  clockIn: Date;
};

export function ClockedInPanel({ onClose }: { onClose: () => void }) {
  const [employees, setEmployees] = useState<ClockedInEmployee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getClockedInEmployees().then((data) => {
      setEmployees(data as ClockedInEmployee[]);
      setLoading(false);
    });
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full sm:max-w-sm sm:mx-4 sm:rounded-2xl rounded-t-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Currently Clocked In
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Real-time from database
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-72">
          {loading ? (
            <div className="p-8 text-center text-sm text-gray-400 animate-pulse">
              Loading…
            </div>
          ) : employees.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-400">
              No employees are currently clocked in.
            </div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {employees.map((emp) => (
                <li key={emp.id} className="flex items-center gap-4 px-6 py-4">
                  <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {emp.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      Since {fmtTime(emp.clockIn)}
                    </p>
                  </div>
                  <span className="ml-auto shrink-0 text-xs font-medium bg-green-50 text-green-700 px-2.5 py-1 rounded-full">
                    In
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="p-4 border-t border-gray-50">
          <button
            onClick={onClose}
            className="w-full h-11 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
