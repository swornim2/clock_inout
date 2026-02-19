import ShiftTable from "../ShiftTable";

export default function ShiftTableExample() {
  const mockShifts = [
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
  ];

  return (
    <div className="p-8 bg-background">
      <ShiftTable shifts={mockShifts} weekLabel="Week of Nov 3, 2025" />
    </div>
  );
}
