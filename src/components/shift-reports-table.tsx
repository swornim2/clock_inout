"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";

export function ShiftReportsTable({ reports }: { reports: any[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const week = searchParams.get("week") || "current";

  const handleWeekChange = (value: string) => {
    router.push(`/admin?week=${value}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Select value={week} onValueChange={handleWeekChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select a week" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="current">Current Week</SelectItem>
            <SelectItem value="last">Last Week</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline">Export CSV</Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Clock In</TableHead>
              <TableHead>Clock Out</TableHead>
              <TableHead>Break</TableHead>
              <TableHead>Hours</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.map((report: any) => (
              <TableRow key={report.id}>
                <TableCell>{report.employee.name}</TableCell>
                <TableCell>{format(new Date(report.clockIn), "EEE, MMM d")}</TableCell>
                <TableCell>{format(new Date(report.clockIn), "h:mm a")}</TableCell>
                <TableCell>{report.clockOut ? format(new Date(report.clockOut), "h:mm a") : "-"}</TableCell>
                <TableCell>{report.breakMinutes ? `${report.breakMinutes}m ${report.breakType}` : "None"}</TableCell>
                <TableCell>{report.totalHours?.toFixed(1)}h</TableCell>
                <TableCell>Paid</TableCell>
                <TableCell>Edit</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
