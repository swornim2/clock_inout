import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User } from "lucide-react";

interface PINEntryProps {
  employeeName: string;
  isClockedIn: boolean;
  onSubmit: (pin: string) => void;
  onBack: () => void;
}

export default function PINEntry({
  employeeName,
  isClockedIn,
  onSubmit,
  onBack,
}: PINEntryProps) {
  const [pin, setPin] = useState("");

  const handleNumber = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === 4) {
        setTimeout(() => onSubmit(newPin), 100);
      }
    }
  };

  const handleClear = () => {
    setPin("");
  };

  const handleSubmit = () => {
    if (pin.length === 4) {
      onSubmit(pin);
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
          Back to employee list
        </Button>

        <Card className="p-6">
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-10 w-10 text-primary" />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold" data-testid="text-employee-name">
                {employeeName}
              </h2>
              <Badge
                variant={isClockedIn ? "default" : "secondary"}
                className="mt-2"
                data-testid="badge-current-status"
              >
                Currently {isClockedIn ? "Clocked In" : "Clocked Out"}
              </Badge>
            </div>
          </div>
        </Card>

        <div className="text-center space-y-2">
          <h3 className="text-2xl font-semibold">
            Enter Your PIN to {isClockedIn ? "Clock Out" : "Clock In"}
          </h3>
          <p className="text-muted-foreground">4-digit PIN</p>
        </div>

        <Card className="p-6">
          <div className="flex justify-center items-center h-16 font-mono text-2xl">
            {Array.from({ length: 4 }).map((_, i) => (
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
