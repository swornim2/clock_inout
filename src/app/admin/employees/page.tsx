import { getAllEmployees } from "@/app/actions";
import { AddEmployeeForm } from "@/components/add-employee-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import Link from "next/link";
import { ChevronRight, UserPlus } from "lucide-react";

export default async function EmployeesPage() {
  const allEmployees = await getAllEmployees();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
        <p className="text-sm text-gray-500 mt-1">
          {allEmployees.length} team member
          {allEmployees.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="border-gray-200 shadow-none overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Name
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                      PIN
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Member Since
                    </th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {allEmployees.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="text-center py-12 text-gray-400"
                      >
                        No employees yet — add one on the right
                      </td>
                    </tr>
                  ) : (
                    allEmployees.map((emp) => (
                      <tr
                        key={emp.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-5 py-3.5 font-medium text-gray-800">
                          {emp.name}
                        </td>
                        <td className="px-5 py-3.5 font-mono text-gray-500">
                          {emp.pin}
                        </td>
                        <td className="px-5 py-3.5 text-gray-500">
                          {format(new Date(emp.createdAt), "MMM d, yyyy")}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <Link
                            href={`/admin/employees/${emp.id}`}
                            className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 transition-colors"
                          >
                            View <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div>
          <Card className="border-gray-200 shadow-none">
            <CardHeader className="px-5 pt-5 pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Add Employee
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <AddEmployeeForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
