import EmployeeSelector from "../EmployeeSelector";

export default function EmployeeSelectorExample() {
  const mockEmployees = [
    { id: "1", name: "Sarah Johnson", isClockedIn: true },
    { id: "2", name: "Michael Chen", isClockedIn: false },
    { id: "3", name: "Emma Davis", isClockedIn: false },
    { id: "4", name: "James Wilson", isClockedIn: true },
    { id: "5", name: "Olivia Brown", isClockedIn: false },
    { id: "6", name: "William Garcia", isClockedIn: false },
  ];

  return (
    <EmployeeSelector
      employees={mockEmployees}
      onSelectEmployee={(emp) => console.log("Selected:", emp.name)}
    />
  );
}
