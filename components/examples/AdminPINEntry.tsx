import AdminPINEntry from "../AdminPINEntry";

export default function AdminPINEntryExample() {
  return (
    <AdminPINEntry
      onSuccess={() => console.log("Admin access granted")}
      onBack={() => console.log("Back clicked")}
    />
  );
}
