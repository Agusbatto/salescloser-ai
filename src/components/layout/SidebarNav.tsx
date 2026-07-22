"use client";

import { useState } from "react";
import Link from "next/link";

interface NavItem {
  href: string;
  label: string;
}

interface SidebarNavProps {
  appName: string;
  navItems: NavItem[];
  userEmail: string | null;
  signOutAction: () => void | Promise<void>;
}

export function SidebarNav({ appName, navItems, userEmail, signOutAction }: SidebarNavProps) {
  const [collapsed, setCollapsed] = useState(false);

  if (collapsed) {
    return (
      <aside className="flex w-12 shrink-0 flex-col items-center border-r border-gray-200 bg-white py-4">
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          title="Mostrar menú"
          className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
        >
          »
        </button>
      </aside>
    );
  }

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-gray-200 bg-white">
      <div className="flex items-center justify-between px-5 py-4">
        <span className="text-sm font-semibold text-gray-900">{appName}</span>
        <button
          type="button"
          onClick={() => setCollapsed(true)}
          title="Ocultar menú"
          className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-900"
        >
          «
        </button>
      </div>
      <nav className="space-y-0.5 px-3">
        {navItems.map((item) => (
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
        {userEmail && <p className="truncate text-xs text-gray-500">{userEmail}</p>}
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
  );
}
