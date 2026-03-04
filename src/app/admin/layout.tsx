import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { logout } from "@/app/auth-actions";
import {
  LayoutDashboard,
  Clock,
  Users,
  Download,
  LogOut,
  Timer,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/time-logs", label: "Time Logs", icon: Clock },
  { href: "/admin/employees", label: "Employees", icon: Users },
  { href: "/admin/export", label: "Export CSV", icon: Download },
];

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
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-60 shrink-0 border-r border-gray-200 bg-white flex flex-col">
        <div className="flex items-center gap-2 px-5 py-5 border-b border-gray-100">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-900">
            <Timer className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-gray-900 text-sm">
            TimeTrack Admin
          </span>
        </div>
        <nav className="flex flex-col gap-1 p-3 flex-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-100">
          <form action={logout}>
            <button
              type="submit"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors w-full"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              Logout
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 p-8 min-w-0">{children}</main>
    </div>
  );
}
