import AddEmployeeForm from "../AddEmployeeForm";

export default function AddEmployeeFormExample() {
  return (
    <div className="p-8 min-h-screen bg-background">
      <AddEmployeeForm
        onSubmit={(employee) => console.log("Employee added:", employee)}
      />
    </div>
  );
}
