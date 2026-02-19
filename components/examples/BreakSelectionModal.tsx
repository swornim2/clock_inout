import { useState } from "react";
import BreakSelectionModal from "../BreakSelectionModal";
import { Button } from "@/components/ui/button";

export default function BreakSelectionModalExample() {
  const [open, setOpen] = useState(true);

  return (
    <div className="p-8 min-h-screen flex items-center justify-center bg-background">
      <div className="space-y-4">
        <Button onClick={() => setOpen(true)}>Show Break Modal</Button>
        <BreakSelectionModal
          open={open}
          onSelect={(type) => {
            console.log("Break selected:", type);
            setOpen(false);
          }}
        />
      </div>
    </div>
  );
}
