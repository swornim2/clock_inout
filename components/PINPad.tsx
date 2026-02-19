import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface PINPadProps {
  onSubmit: (pin: string) => void;
  maxLength?: number;
}

export default function PINPad({ onSubmit, maxLength = 4 }: PINPadProps) {
  const [pin, setPin] = useState("");

  const handleNumber = (num: string) => {
    if (pin.length < maxLength) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === maxLength) {
        setTimeout(() => onSubmit(newPin), 100);
      }
    }
  };

  const handleClear = () => {
    setPin("");
  };

  const handleSubmit = () => {
    if (pin.length === maxLength) {
      onSubmit(pin);
    }
  };

  return (
    <div className="w-full max-w-xs mx-auto space-y-6">
      <Card className="p-6">
        <div className="flex justify-center items-center h-16 font-mono text-2xl">
          {Array.from({ length: maxLength }).map((_, i) => (
            <span key={i} className="mx-1">
              {i < pin.length ? "●" : "○"}
            </span>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <Button
            key={num}
            size="lg"
            variant="outline"
            className="h-16 text-xl font-semibold hover-elevate active-elevate-2"
            onClick={() => handleNumber(num.toString())}
            data-testid={`button-pin-${num}`}
          >
            {num}
          </Button>
        ))}
        <Button
          size="lg"
          variant="outline"
          className="h-16 text-base font-semibold hover-elevate active-elevate-2"
          onClick={handleClear}
          data-testid="button-pin-clear"
        >
          Clear
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="h-16 text-xl font-semibold hover-elevate active-elevate-2"
          onClick={() => handleNumber("0")}
          data-testid="button-pin-0"
        >
          0
        </Button>
        <Button
          size="lg"
          variant="default"
          className="h-16 text-base font-semibold"
          onClick={handleSubmit}
          disabled={pin.length !== maxLength}
          data-testid="button-pin-submit"
        >
          Enter
        </Button>
      </div>
    </div>
  );
}
