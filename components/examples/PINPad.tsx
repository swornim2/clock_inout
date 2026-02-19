import PINPad from "../PINPad";

export default function PINPadExample() {
  return (
    <div className="p-8 min-h-screen flex items-center justify-center bg-background">
      <PINPad onSubmit={(pin) => console.log("PIN entered:", pin)} />
    </div>
  );
}
