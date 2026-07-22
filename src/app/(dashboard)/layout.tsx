import Link from "next/link";
import { appConfig } from "@/config/app";
import { createClient } from "@/lib/supabase/server";
import { signOutAction } from "@/app/(auth)/actions";
import { TasksSidebar } from "@/components/features/tasks/TasksSidebar";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/contacts", label: "Clientes" },
  { href: "/coach", label: "Coach IA" },
  { href: "/libro", label: "Libro de ventas" },
  { href: "/settings", label: "Configuración" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-64 shrink-0 flex-col border-r border-gray-200 bg-white">
        <div className="px-5 py-4">
          <span className="text-sm font-semibold text-gray-900">{appConfig.name}</span>
        </div>
        <nav className="space-y-0.5 px-3">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto space-y-2 border-t border-gray-200 p-4">
          {user?.email && <p className="truncate text-xs text-gray-500">{user.email}</p>}
          <form action={signOutAction}>
            <button
              type="submit"
              className="w-full rounded-md px-3 py-2 text-left text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 overflow-x-auto bg-gray-50 px-8 py-8">{children}</main>
      <TasksSidebar />
    </div>
  );
}
