import { useState } from "react";
import DashboardStats from "./DashboardStats";
import ShiftTable from "./ShiftTable";
import EmployeeCard from "./EmployeeCard";
import AddEmployeeForm from "./AddEmployeeForm";
import EditShiftDialog from "./EditShiftDialog";
import EmployeeHistoryDialog from "./EmployeeHistoryDialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function OwnerDashboard() {
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState("current");
  const [editingShift, setEditingShift] = useState<any>(null);
  const [viewingHistory, setViewingHistory] = useState<{ employeeId: string; name: string } | null>(null);

  const mockEmployees = [
    { id: "1", name: "Sarah Johnson", hoursThisWeek: 38.5, isClockedIn: true },
    { id: "2", name: "Michael Chen", hoursThisWeek: 42.0, isClockedIn: false },
    { id: "3", name: "Emma Davis", hoursThisWeek: 35.5, isClockedIn: false },
    { id: "4", name: "James Wilson", hoursThisWeek: 40.0, isClockedIn: true },
  ];

  const [mockShifts, setMockShifts] = useState([
    {
      id: "1",
      employeeName: "Sarah Johnson",
      date: new Date(2025, 10, 3),
      clockIn: new Date(2025, 10, 3, 9, 0),
      clockOut: new Date(2025, 10, 3, 17, 30),
      breakType: "unpaid" as const,
      totalHours: 8.0,
      isPaid: true,
    },
    {
      id: "2",
      employeeName: "Michael Chen",
      date: new Date(2025, 10, 3),
      clockIn: new Date(2025, 10, 3, 8, 30),
      clockOut: new Date(2025, 10, 3, 16, 0),
      breakType: "paid" as const,
      totalHours: 7.5,
      isPaid: false,
    },
    {
      id: "3",
      employeeName: "Emma Davis",
      date: new Date(2025, 10, 2),
      clockIn: new Date(2025, 10, 2, 10, 0),
      clockOut: new Date(2025, 10, 2, 14, 0),
      breakType: null,
      totalHours: 4.0,
      isPaid: true,
    },
    {
      id: "4",
      employeeName: "James Wilson",
      date: new Date(2025, 10, 1),
      clockIn: new Date(2025, 10, 1, 7, 30),
      clockOut: new Date(2025, 10, 1, 15, 30),
      breakType: "unpaid" as const,
      totalHours: 7.5,
      isPaid: false,
    },
  ]);

  const handleSaveShift = (id: string, totalHours: number, isPaid: boolean) => {
    setMockShifts(shifts =>
      shifts.map(shift =>
        shift.id === id ? { ...shift, totalHours, isPaid } : shift
      )
    );
    console.log("Shift updated:", { id, totalHours, isPaid });
  };

  const handleViewHistory = (employeeId: string, employeeName: string) => {
    setViewingHistory({ employeeId, name: employeeName });
  };

  const getEmployeeShifts = (employeeName: string) => {
    return mockShifts.filter(shift => shift.employeeName === employeeName);
  };

  const getEmployeeWeeklyTotal = (employeeName: string) => {
    return mockShifts
      .filter(shift => shift.employeeName === employeeName)
      .reduce((total, shift) => total + (shift.totalHours || 0), 0);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Manage your team's time tracking
            </p>
          </div>
          <Button onClick={() => setShowAddEmployee(true)} data-testid="button-add-employee">
            <Plus className="h-4 w-4 mr-2" />
            Add Employee
          </Button>
        </div>

        <DashboardStats
          totalEmployees={12}
          clockedIn={5}
          hoursToday={38.5}
          hoursThisWeek={287.5}
        />

        <Tabs defaultValue="reports" className="space-y-6">
          <TabsList>
            <TabsTrigger value="reports" data-testid="tab-reports">
              Shift Reports
            </TabsTrigger>
            <TabsTrigger value="employees" data-testid="tab-employees">
              Employees
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reports" className="space-y-6">
            <div className="flex items-center justify-between">
              <Select value={selectedWeek} onValueChange={setSelectedWeek}>
                <SelectTrigger className="w-[240px]" data-testid="select-week">
                  <SelectValue placeholder="Select week" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">Current Week</SelectItem>
                  <SelectItem value="last">Last Week</SelectItem>
                  <SelectItem value="twoweeks">2 Weeks Ago</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" data-testid="button-export">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
            <ShiftTable 
              shifts={mockShifts} 
              weekLabel="Week of Nov 3, 2025" 
              onEditShift={setEditingShift}
            />
          </TabsContent>

          <TabsContent value="employees" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockEmployees.map((emp) => (
                <EmployeeCard
                  key={emp.id}
                  {...emp}
                  onViewHistory={() => handleViewHistory(emp.id, emp.name)}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <Dialog open={showAddEmployee} onOpenChange={setShowAddEmployee}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Employee</DialogTitle>
            </DialogHeader>
            <AddEmployeeForm
              onSubmit={(employee) => {
                console.log("Employee added:", employee);
                setShowAddEmployee(false);
              }}
            />
          </DialogContent>
        </Dialog>

        {editingShift && (
          <EditShiftDialog
            open={!!editingShift}
            onClose={() => setEditingShift(null)}
            shift={editingShift}
            onSave={handleSaveShift}
          />
        )}

        {viewingHistory && (
          <EmployeeHistoryDialog
            open={!!viewingHistory}
            onClose={() => setViewingHistory(null)}
            employeeName={viewingHistory.name}
            shifts={getEmployeeShifts(viewingHistory.name)}
            weeklyTotal={getEmployeeWeeklyTotal(viewingHistory.name)}
          />
        )}
      </div>
    </div>
  );
}
