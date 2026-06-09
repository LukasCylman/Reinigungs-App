"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, ClipboardList, Users, FileText,
  CheckSquare, Download, TrendingUp, Sparkles, LogOut
} from "lucide-react";

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/auftraege", label: "Aufträge", icon: ClipboardList },
  { href: "/kunden", label: "Kunden", icon: Users },
  { href: "/rechnungen", label: "Rechnungen", icon: FileText },
  { href: "/checklisten", label: "Checklisten", icon: CheckSquare },
  { href: "/export", label: "Export", icon: Download },
  { href: "/akquise", label: "Akquise", icon: TrendingUp },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const logout = async () => {
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/login");
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-60 bg-blue-900 text-white flex-col shrink-0">
        <div className="p-5 border-b border-blue-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-blue-300" />
            <span className="font-bold text-lg leading-tight">Reinigung<br />Manager</span>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? "bg-blue-700 text-white" : "text-blue-200 hover:bg-blue-800 hover:text-white"}`}>
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-blue-800">
          <button onClick={logout} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-blue-200 hover:bg-blue-800 hover:text-white w-full transition-colors">
            <LogOut className="w-4 h-4 shrink-0" /> Ausloggen
          </button>
          <p className="text-xs text-blue-500 px-3 mt-2">Version 1.0 · Kostenlos</p>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-blue-900 border-t border-blue-800 z-50 flex">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href}
              className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs font-medium transition-colors ${active ? "text-white" : "text-blue-300"}`}>
              <Icon className="w-5 h-5" />
              <span className="text-[10px] leading-tight text-center">{label}</span>
            </Link>
          );
        })}
        <button onClick={logout}
          className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs font-medium text-blue-300">
          <LogOut className="w-5 h-5" />
          <span className="text-[10px]">Logout</span>
        </button>
      </nav>
    </>
  );
}
