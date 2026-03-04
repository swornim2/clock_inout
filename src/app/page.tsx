import { Clock, LayoutGrid } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-900 mb-6">
          <Clock className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
          TimeTrack
        </h1>
        <p className="mt-2 text-gray-500">Employee time management system</p>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Link
          href="/clock"
          className="flex items-center justify-center gap-3 h-14 rounded-xl bg-gray-900 text-white font-medium hover:bg-gray-700 transition-colors"
        >
          <Clock className="w-5 h-5" />
          Employee Clock
        </Link>
        <Link
          href="/admin"
          className="flex items-center justify-center gap-3 h-14 rounded-xl border-2 border-gray-200 bg-white text-gray-700 font-medium hover:bg-gray-50 transition-colors"
        >
          <LayoutGrid className="w-5 h-5" />
          Owner Dashboard
        </Link>
      </div>

      <p className="mt-8 text-xs text-gray-400">
        PIN-based clock in/out · break tracking · weekly reports
      </p>
    </main>
  );
}
