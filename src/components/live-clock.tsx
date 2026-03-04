"use client";

import { useState, useEffect } from "react";

const TZ = "Australia/Adelaide";

function getNow() {
  const now = new Date();
  const time = now.toLocaleTimeString("en-AU", {
    timeZone: TZ,
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  const date = now.toLocaleDateString("en-AU", {
    timeZone: TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return { time, date };
}

interface LiveClockProps {
  variant?: "default" | "large" | "compact";
}

export function LiveClock({ variant = "default" }: LiveClockProps) {
  const [display, setDisplay] = useState<{ time: string; date: string } | null>(null);

  useEffect(() => {
    setDisplay(getNow());
    const interval = setInterval(() => setDisplay(getNow()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!display) return null;

  if (variant === "large") {
    return (
      <div className="text-center">
        <div className="text-5xl font-bold text-gray-900 tabular-nums tracking-tight">
          {display.time}
        </div>
        <div className="text-sm text-gray-400 mt-1">{display.date}</div>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <span className="text-sm text-gray-500 tabular-nums">{display.time}</span>
    );
  }

  return (
    <div className="text-center">
      <div className="text-2xl font-semibold text-gray-800 tabular-nums">{display.time}</div>
      <div className="text-xs text-gray-400 mt-0.5">{display.date}</div>
    </div>
  );
}
