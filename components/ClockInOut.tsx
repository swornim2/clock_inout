import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import PINPad from "./PINPad";
import BreakSelectionModal from "./BreakSelectionModal";
import { Clock, LogOut } from "lucide-react";
import { format } from "date-fns";

interface ClockInOutProps {
  employeeName?: string;
  isClockedIn?: boolean;
  lastAction?: Date;
  onPinSubmit?: (pin: string) => void;
  onLogout?: () => void;
}

export default function ClockInOut({
  employeeName,
  isClockedIn = false,
  lastAction,
  onPinSubmit,
  onLogout,
}: ClockInOutProps) {
  const [showBreakModal, setShowBreakModal] = useState(false);

  const handlePinSubmit = (pin: string) => {
    console.log("PIN submitted:", pin);
    if (onPinSubmit) {
      onPinSubmit(pin);
    }
    if (isClockedIn) {
      setShowBreakModal(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md space-y-6">
        {employeeName && (
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold" data-testid="text-employee-name">
                {employeeName}
              </h2>
              <p className="text-sm text-muted-foreground">Employee</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onLogout}
              data-testid="button-logout"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        )}

        <Card className="p-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Clock className="h-6 w-6 text-muted-foreground" />
              <h3 className="text-xl font-semibold">Current Status</h3>
            </div>
            <Badge
              variant={isClockedIn ? "default" : "secondary"}
              className="text-base px-4 py-2"
              data-testid="badge-clock-status"
            >
              {isClockedIn ? "Clocked In" : "Clocked Out"}
            </Badge>
            {lastAction && (
              <p className="text-sm text-muted-foreground font-mono">
                Last action: {format(lastAction, "MMM d, h:mm a")}
              </p>
            )}
          </div>
        </Card>

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">
            {isClockedIn ? "Clock Out" : "Clock In"}
          </h1>
          <p className="text-muted-foreground">Enter your 4-digit PIN</p>
        </div>

        <PINPad onSubmit={handlePinSubmit} />

        <BreakSelectionModal
          open={showBreakModal}
          onSelect={(breakType) => {
            console.log("Break type selected:", breakType);
            setShowBreakModal(false);
          }}
        />
      </div>
    </div>
  );
}
