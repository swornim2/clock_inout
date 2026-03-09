"use client";

import { useTransition } from "react";
import { markShiftsPaid, markShiftsUnpaid } from "@/app/actions";
import { useRouter } from "next/navigation";

interface PayrollToggleProps {
  shiftId: number;
  isPaid: boolean;
}

export function PayrollToggle({ shiftId, isPaid }: PayrollToggleProps) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const handleClick = () => {
    startTransition(async () => {
      if (isPaid) {
        await markShiftsUnpaid([shiftId]);
      } else {
        await markShiftsPaid([shiftId]);
      }
      router.refresh();
    });
  };

  if (isPaid) {
    return (
      <button
        onClick={handleClick}
        disabled={pending}
        title="Click to mark as unpaid"
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200 transition-colors disabled:opacity-50 cursor-pointer"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
        Paid
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      title="Click to mark as paid"
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 hover:bg-green-100 hover:text-green-700 transition-colors disabled:opacity-50 cursor-pointer"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
      {pending ? "Saving…" : "Unpaid"}
    </button>
  );
}
