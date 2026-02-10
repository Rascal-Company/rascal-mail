"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  LayoutDashboard,
  Inbox,
  Send,
  FileEdit,
  ShieldAlert,
  Trash2,
  Megaphone,
  FileText,
  Users,
  Settings,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useOrganization } from "@/hooks/useOrganization";
import { createAuthClient } from "@/lib/supabase/client";

const navItems = [
  { href: "/dashboard", label: "Etusivu", icon: LayoutDashboard },
  { href: "/dashboard/inbox", label: "Saapuneet", icon: Inbox },
  { href: "/dashboard/sent", label: "Lähetetyt", icon: Send },
  { href: "/dashboard/drafts", label: "Luonnokset", icon: FileEdit },
  { href: "/dashboard/spam", label: "Roskaposti", icon: ShieldAlert },
  { href: "/dashboard/trash", label: "Roskakori", icon: Trash2 },
  { href: "/dashboard/campaigns", label: "Kampanjat", icon: Megaphone },
  { href: "/dashboard/templates", label: "Mallipohjat", icon: FileText },
  { href: "/dashboard/lists", label: "Kontaktilistat", icon: Users },
];

export function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { currentOrg } = useOrganization();

  const handleSignOut = async () => {
    await createAuthClient().auth.signOut();
    router.push("/login");
  };

  const orgInitials = currentOrg?.name
    ? currentOrg.name.substring(0, 2).toUpperCase()
    : "RM";

  const rascalAiUrl =
    process.env.NEXT_PUBLIC_RASCAL_AI_URL ?? "https://app.rascal.fi";

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed right-4 top-4 z-50 rounded-lg bg-gray-900 p-2 text-white shadow-lg md:hidden"
        aria-label="Avaa valikko"
      >
        <Menu className="h-6 w-6" />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={cn(
          "fixed right-0 top-0 z-[60] flex h-screen w-[280px] flex-col bg-gray-900 text-white transition-transform duration-300 md:hidden",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-800 text-sm font-bold text-rascal-orange">
              {orgInitials}
            </div>
            <p className="truncate text-sm font-semibold">
              {currentOrg?.name ?? "Rascal Mail"}
            </p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-white"
            aria-label="Sulje valikko"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3">
          <div className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-rascal-orange text-white"
                      : "text-gray-400 hover:bg-gray-800 hover:text-white",
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-gray-800 p-3">
          <div className="flex flex-col gap-1">
            <a
              href={rascalAiUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
            >
              <ExternalLink className="h-5 w-5 shrink-0" />
              <span>Rascal AI</span>
            </a>
            <Link
              href="/dashboard/settings"
              onClick={() => setIsOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                pathname.startsWith("/dashboard/settings")
                  ? "bg-rascal-orange text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white",
              )}
            >
              <Settings className="h-5 w-5 shrink-0" />
              <span>Asetukset</span>
            </Link>
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
            >
              <LogOut className="h-5 w-5 shrink-0" />
              <span>Kirjaudu ulos</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
