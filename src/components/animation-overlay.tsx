"use client";

interface AnimationOverlayProps {
  message: string;
}

export function AnimationOverlay({ message }: AnimationOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <h1 className="animate-pulse text-6xl font-bold">{message}</h1>
    </div>
  );
}
