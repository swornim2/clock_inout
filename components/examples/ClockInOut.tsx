import { useState } from "react";
import ClockInOut from "../ClockInOut";

export default function ClockInOutExample() {
  const [isClockedIn, setIsClockedIn] = useState(false);

  return (
    <ClockInOut
      employeeName="Sarah Johnson"
      isClockedIn={isClockedIn}
      lastAction={new Date()}
      onPinSubmit={(pin) => {
        console.log("PIN:", pin);
        setIsClockedIn(!isClockedIn);
      }}
      onLogout={() => console.log("Logout")}
    />
  );
}
