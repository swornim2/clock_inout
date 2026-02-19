import { useState } from "react";
import AnimatedGreeting from "../AnimatedGreeting";
import { Button } from "@/components/ui/button";

export default function AnimatedGreetingExample() {
  const [show, setShow] = useState(false);
  const [action, setAction] = useState<"clockin" | "clockout">("clockin");

  return (
    <div className="p-8 min-h-screen flex items-center justify-center bg-background">
      <div className="space-y-4">
        <Button onClick={() => { setAction("clockin"); setShow(true); }}>
          Show Clock In Greeting
        </Button>
        <Button onClick={() => { setAction("clockout"); setShow(true); }}>
          Show Clock Out Greeting
        </Button>
        {show && (
          <AnimatedGreeting
            employeeName="Sarah Johnson"
            action={action}
            onComplete={() => setShow(false)}
          />
        )}
      </div>
    </div>
  );
}
