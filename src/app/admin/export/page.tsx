import { getAllEmployees } from "@/app/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileText } from "lucide-react";

export default async function ExportPage() {
  const allEmployees = await getAllEmployees();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Export CSV</h1>
        <p className="text-sm text-gray-500 mt-1">Download time logs as a CSV file</p>
      </div>

      <div className="max-w-lg">
        <Card className="border-gray-200 shadow-none">
          <CardHeader className="px-5 pt-5 pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Filter Export
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <form
              action="/api/admin/export"
              method="GET"
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-gray-500 font-medium">From date</label>
                  <input
                    type="date"
                    name="from"
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-gray-500 font-medium">To date</label>
                  <input
                    type="date"
                    name="to"
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-500 font-medium">Employee (optional)</label>
                <select
                  name="employeeId"
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white"
                >
                  <option value="">All employees</option>
                  {allEmployees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="flex items-center gap-2 w-full justify-center px-4 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download CSV
              </button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-4 rounded-lg bg-gray-50 border border-gray-100 px-4 py-3">
          <p className="text-xs text-gray-500 font-medium mb-1">CSV includes:</p>
          <p className="text-xs text-gray-400">
            Employee · Date · Clock In · Clock Out · Break Type · Break Mins · Hours Worked
          </p>
        </div>
      </div>
    </div>
  );
}
