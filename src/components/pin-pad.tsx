"use client";

import { Button } from "@/components/ui/button";

interface PinPadProps {
  pin: string;
  onPinChange: (pin: string) => void;
  onSubmit: () => void;
}

export function PinPad({ pin, onPinChange, onSubmit }: PinPadProps) {
  const handleNumberClick = (num: number) => {
    if (pin.length < 4) {
      onPinChange(pin + num);
    }
  };

  const handleClear = () => {
    onPinChange("");
  };

  const handleSubmit = () => {
    onSubmit();
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="flex h-16 items-center justify-center space-x-4 rounded-lg border bg-muted px-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={`h-4 w-4 rounded-full transition-all duration-300 ${
              pin.length > i
                ? "scale-125 bg-primary"
                : "bg-muted-foreground/20"
            }`}
          />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <Button
            key={num}
            variant="outline"
            className="h-16 text-2xl"
            onClick={() => handleNumberClick(num)}
          >
            {num}
          </Button>
        ))}
        <Button variant="outline" className="h-16 text-xl" onClick={handleClear}>
          Clear
        </Button>
        <Button
          variant="outline"
          className="h-16 text-2xl"
          onClick={() => handleNumberClick(0)}
        >
          0
        </Button>
        <Button className="h-16 text-xl" onClick={handleSubmit}>
          Enter
        </Button>
      </div>
    </div>
  );
}
