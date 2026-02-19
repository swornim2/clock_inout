import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Lock } from "lucide-react";

interface AdminPINEntryProps {
  onSuccess: () => void;
  onBack: () => void;
}

export default function AdminPINEntry({ onSuccess, onBack }: AdminPINEntryProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  const handleNumber = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === 4) {
        setTimeout(() => validatePin(newPin), 100);
      }
    }
  };

  const validatePin = (enteredPin: string) => {
    if (enteredPin === "2025") {
      onSuccess();
    } else {
      setError(true);
      setPin("");
      setTimeout(() => setError(false), 2000);
    }
  };

  const handleClear = () => {
    setPin("");
    setError(false);
  };

  const handleSubmit = () => {
    if (pin.length === 4) {
      validatePin(pin);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md space-y-8">
        <Button
          variant="ghost"
          onClick={onBack}
          className="gap-2"
          data-testid="button-back"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Button>

        <Card className="p-8">
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Lock className="h-10 w-10 text-primary" />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold">Admin Access</h2>
              <p className="text-muted-foreground mt-1">Enter admin PIN to continue</p>
            </div>
          </div>
        </Card>

        <Card className={`p-6 ${error ? "border-destructive" : ""}`}>
          <div className="flex justify-center items-center h-16 font-mono text-2xl">
            {Array.from({ length: 4 }).map((_, i) => (
              <span key={i} className="mx-1">
                {i < pin.length ? "●" : "○"}
              </span>
            ))}
          </div>
          {error && (
            <p className="text-center text-destructive text-sm mt-2" data-testid="text-error">
              Incorrect PIN. Please try again.
            </p>
          )}
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
            disabled={pin.length !== 4}
            data-testid="button-pin-submit"
          >
            Enter
          </Button>
        </div>
      </div>
    </div>
  );
}
