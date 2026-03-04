"use client";

import { CheckCircle, LogOut } from "lucide-react";

interface SuccessOverlayProps {
  message: string;
  type: "in" | "out";
}

export function SuccessOverlay({ message, type }: SuccessOverlayProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center animate-fade-in"
      style={{
        background: type === "in"
          ? "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)"
          : "linear-gradient(135deg, #2d1b69 0%, #11998e 100%)",
      }}
    >
      <div className="text-center px-8">
        <div className="flex justify-center mb-6">
          {type === "in" ? (
            <CheckCircle className="w-20 h-20 text-white opacity-90" strokeWidth={1.5} />
          ) : (
            <LogOut className="w-20 h-20 text-white opacity-90" strokeWidth={1.5} />
          )}
        </div>
        <h1 className="text-4xl font-bold text-white tracking-tight leading-tight">
          {message}
        </h1>
        <p className="mt-4 text-white/60 text-lg">
          {type === "in" ? "You are now clocked in." : "You are now clocked out."}
        </p>
      </div>
    </div>
  );
}
