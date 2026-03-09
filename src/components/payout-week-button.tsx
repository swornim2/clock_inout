"use client";

import { useTransition } from "react";
import { markEmployeeWeekPaid } from "@/app/actions";
import { useRouter } from "next/navigation";

interface PayoutWeekButtonProps {
  employeeId: number;
  unpaidCount: number;
}

export function PayoutWeekButton({ employeeId, unpaidCount }: PayoutWeekButtonProps) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  if (unpaidCount === 0) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-50 text-green-600 border border-green-200">
        ✓ All paid
      </span>
    );
  }

  const handleClick = () => {
    startTransition(async () => {
      await markEmployeeWeekPaid(employeeId);
      router.refresh();
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {pending ? "Marking paid…" : `Payout This Week (${unpaidCount} shift${unpaidCount !== 1 ? "s" : ""})`}
    </button>
  );
}
