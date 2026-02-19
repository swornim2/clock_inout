import PINEntry from "../PINEntry";

export default function PINEntryExample() {
  return (
    <PINEntry
      employeeName="Sarah Johnson"
      isClockedIn={false}
      onSubmit={(pin) => console.log("PIN submitted:", pin)}
      onBack={() => console.log("Back clicked")}
    />
  );
}
