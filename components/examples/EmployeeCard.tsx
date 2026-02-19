import EmployeeCard from "../EmployeeCard";

export default function EmployeeCardExample() {
  return (
    <div className="p-8 bg-background">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl">
        <EmployeeCard
          id="1"
          name="Sarah Johnson"
          hoursThisWeek={38.5}
          isClockedIn={true}
          onViewHistory={() => console.log("View history")}
        />
        <EmployeeCard
          id="2"
          name="Michael Chen"
          hoursThisWeek={42.0}
          isClockedIn={false}
          onViewHistory={() => console.log("View history")}
        />
        <EmployeeCard
          id="3"
          name="Emma Davis"
          hoursThisWeek={35.5}
          isClockedIn={false}
          onViewHistory={() => console.log("View history")}
        />
      </div>
    </div>
  );
}
