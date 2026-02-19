import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { logout } from "@/app/auth-actions";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = cookies().get("admin-session")?.value;
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r bg-secondary/40 p-4 flex flex-col">
        <h2 className="text-lg font-semibold">Admin Menu</h2>
        <nav className="mt-4 flex flex-col space-y-2">
          <Link href="/admin/employees" className="hover:underline">Employees</Link>
          <Link href="/admin/reports" className="hover:underline">Time Reports</Link>
        </nav>
        <form action={logout} className="mt-auto">
          <button type="submit" className="w-full text-left hover:underline">Logout</button>
        </form>
      </aside>
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}

