"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Car, Calendar, MessageSquare, LogOut } from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/leads", label: "Leads", icon: Users },
  { href: "/dashboard/vehicles", label: "Véhicules", icon: Car },
  { href: "/dashboard/appointments", label: "Rendez-vous", icon: Calendar },
  { href: "/dashboard/conversations", label: "Conversations", icon: MessageSquare },
];

export function Sidebar() {
  const pathname = usePathname();

  const handleLogout = () => {
    document.cookie = "crm_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    window.location.href = "/login";
  };

  return (
    <aside className="w-64 bg-[#0d0d0d] min-h-screen flex flex-col border-r border-gray-800">
      {/* Logo */}
      <div className="p-6 pb-8">
        <svg width="80" height="32" viewBox="0 0 80 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <text x="5" y="26" fontFamily="Jost, sans-serif" fontSize="28" fontWeight="700" fill="white" letterSpacing="-1">neo</text>
        </svg>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-[#dc2626] text-white"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors w-full"
        >
          <LogOut className="w-5 h-5" />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
