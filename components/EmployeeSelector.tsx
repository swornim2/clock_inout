import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User } from "lucide-react";

interface Employee {
  id: string;
  name: string;
  isClockedIn: boolean;
}

interface EmployeeSelectorProps {
  employees: Employee[];
  onSelectEmployee: (employee: Employee) => void;
}

export default function EmployeeSelector({
  employees,
  onSelectEmployee,
}: EmployeeSelectorProps) {
  return (
    <div className="min-h-screen flex flex-col p-6 bg-background">
      <div className="max-w-6xl mx-auto w-full space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">Employee Clock</h1>
          <p className="text-muted-foreground">Select your name to clock in or out</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {employees.map((employee) => (
            <Card
              key={employee.id}
              className="hover-elevate active-elevate-2 cursor-pointer transition-all"
              onClick={() => onSelectEmployee(employee)}
              data-testid={`card-employee-${employee.id}`}
            >
              <CardContent className="p-6 flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div className="text-center space-y-1">
                  <h3 className="font-semibold text-lg" data-testid={`text-employee-name-${employee.id}`}>
                    {employee.name}
                  </h3>
                  <Badge
                    variant={employee.isClockedIn ? "default" : "secondary"}
                    className="text-xs"
                    data-testid={`badge-status-${employee.id}`}
                  >
                    {employee.isClockedIn ? "Clocked In" : "Clocked Out"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
