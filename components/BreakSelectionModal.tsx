import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Coffee, Clock } from "lucide-react";

interface BreakSelectionModalProps {
  open: boolean;
  onSelect: (breakType: "paid" | "unpaid" | "none") => void;
}

export default function BreakSelectionModal({
  open,
  onSelect,
}: BreakSelectionModalProps) {
  return (
    <Dialog open={open}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Break Time</DialogTitle>
          <DialogDescription className="text-base">
            Your shift is longer than 6 hours. Did you take a break?
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 pt-4">
          <Button
            size="lg"
            variant="outline"
            className="w-full h-16 text-base justify-start gap-3"
            onClick={() => onSelect("paid")}
            data-testid="button-break-paid"
          >
            <Coffee className="h-5 w-5" />
            <div className="text-left">
              <div className="font-semibold">10 Minute Paid Break</div>
              <div className="text-sm text-muted-foreground">
                Counts towards total hours
              </div>
            </div>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="w-full h-16 text-base justify-start gap-3"
            onClick={() => onSelect("unpaid")}
            data-testid="button-break-unpaid"
          >
            <Clock className="h-5 w-5" />
            <div className="text-left">
              <div className="font-semibold">30 Minute Unpaid Break</div>
              <div className="text-sm text-muted-foreground">
                Deducted from total hours
              </div>
            </div>
          </Button>
          <Button
            size="lg"
            variant="ghost"
            className="w-full"
            onClick={() => onSelect("none")}
            data-testid="button-break-skip"
          >
            Skip - No break taken
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
