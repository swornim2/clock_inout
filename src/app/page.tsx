import { Button } from "@/components/ui/button";
import { Clock, LayoutGrid } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="container mx-auto flex min-h-screen flex-col items-center justify-center space-y-8 text-center">
      <h1 className="text-5xl font-bold tracking-tight">TimeTrack</h1>
      <p className="text-xl text-muted-foreground">
        Employee Time Management System
      </p>
      <div className="flex flex-col gap-4 sm:flex-row">
        <Button asChild size="lg" className="px-16 py-8 text-lg">
          <Link href="/clock">
            <Clock className="mr-2 h-6 w-6" />
            Employee Clock
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="px-16 py-8 text-lg">
          <Link href="/admin">
            <LayoutGrid className="mr-2 h-6 w-6" />
            Owner Dashboard
          </Link>
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        PIN-based clock in/out with automatic break tracking and weekly reports
      </p>
    </main>
  );
}
