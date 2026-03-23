"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { clockOutAll } from "@/app/actions";

export function ClockOutAllButton({ count }: { count: number }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirm, setConfirm] = useState(false);

  if (count === 0) return null;

  const handleClick = () => {
    if (!confirm) {
      setConfirm(true);
      setTimeout(() => setConfirm(false), 3000);
      return;
    }
    startTransition(async () => {
      await clockOutAll();
      setConfirm(false);
      router.refresh();
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
        confirm
          ? "bg-red-600 text-white hover:bg-red-700"
          : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
      }`}
    >
      <LogOut className="w-4 h-4" />
      {isPending
        ? "Clocking out…"
        : confirm
          ? `Confirm — clock out ${count}`
          : `Clock out all (${count})`}
    </button>
  );
}
