import { appConfig } from "@/config/app";
import { createClient } from "@/lib/supabase/server";
import { signOutAction } from "@/app/(auth)/actions";
import { SidebarNav } from "@/components/layout/SidebarNav";
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
      <SidebarNav
        appName={appConfig.name}
        navItems={NAV_ITEMS}
        userEmail={user?.email ?? null}
        signOutAction={signOutAction}
      />
      <main className="flex-1 overflow-x-auto bg-gray-50 px-8 py-8">{children}</main>
      <TasksSidebar />
    </div>
  );
}
