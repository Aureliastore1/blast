"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Megaphone,
  Users,
  Upload,
  Image as ImageIcon,
  FileText,
  History,
  BarChart3,
  Settings,
  UserCircle,
  LogOut,
  Zap,
} from "lucide-react";
import { LogoFull } from "@/components/ui/Logo";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { apiClient, ensureCsrfToken } from "@/lib/apiClient";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/campaigns", label: "Campaign", icon: Megaphone },
  { href: "/contacts", label: "Contacts", icon: Users },
  { href: "/import", label: "Import Number", icon: Upload },
  { href: "/media", label: "Media", icon: ImageIcon },
  { href: "/templates", label: "Template", icon: FileText },
  { href: "/history", label: "History", icon: History },
  { href: "/report", label: "Report", icon: BarChart3 },
];

const BOTTOM_ITEMS = [
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/profile", label: "Profile", icon: UserCircle },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);

  async function handleLogout() {
    try {
      const csrf = await ensureCsrfToken();
      await apiClient.post("/auth/logout", {}, { headers: { "X-CSRF-Token": csrf } });
    } catch {
      // ignore — clear local session regardless
    }
    logout();
    router.push("/login");
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-white/[0.06] bg-base-950/80 backdrop-blur-xl lg:flex">
      <div className="flex h-16 items-center px-5">
        <LogoFull />
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-white/[0.07] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
                  : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
              )}
            >
              <Icon
                className={cn(
                  "h-[18px] w-[18px] transition-colors",
                  active ? "text-accent-cyan" : "text-slate-500 group-hover:text-slate-300"
                )}
              />
              {item.label}
              {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-accent-cyan shadow-glow" />}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/[0.06] p-3">
        <Link
          href="/whatsapp"
          className="mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 transition-all hover:bg-white/[0.04] hover:text-slate-200"
        >
          <Zap className="h-[18px] w-[18px] text-slate-500" />
          Koneksi WhatsApp
        </Link>
        {BOTTOM_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                active ? "bg-white/[0.07] text-white" : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
              )}
            >
              <Icon className="h-[18px] w-[18px] text-slate-500" />
              {item.label}
            </Link>
          );
        })}
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-400/80 transition-all hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut className="h-[18px] w-[18px]" />
          Logout
        </button>
      </div>
    </aside>
  );
}
