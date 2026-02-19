import { db } from "@/lib/db";
import { employees } from "@/lib/db/schema";
import { AddEmployeeForm } from "@/components/add-employee-form";

export default async function EmployeesPage() {
  const allEmployees = await db.select().from(employees);

  return (
    <div>
      <h1 className="text-2xl font-bold">Manage Employees</h1>
      <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
        <div>
          <h2 className="text-xl font-semibold">Add New Employee</h2>
          <AddEmployeeForm />
        </div>
        <div>
          <h2 className="text-xl font-semibold">All Employees</h2>
          <div className="mt-4 rounded-md border">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b">
                  <th className="p-4">Name</th>
                  <th className="p-4">PIN</th>
                </tr>
              </thead>
              <tbody>
                {allEmployees.map((employee) => (
                  <tr key={employee.id} className="border-b">
                    <td className="p-4">{employee.name}</td>
                    <td className="p-4">{employee.pin}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
