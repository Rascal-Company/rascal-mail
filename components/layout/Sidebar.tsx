"use client";

import { useState, useEffect, type ComponentType } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
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
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useOrganization } from "@/hooks/useOrganization";
import { createAuthClient } from "@/lib/supabase/client";

type NavItemConfig = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
};

type NavSectionConfig = {
  id: string;
  title: string;
  items: NavItemConfig[];
};

const standaloneItems: NavItemConfig[] = [
  { href: "/dashboard", label: "Etusivu", icon: LayoutDashboard },
];

const navSections: NavSectionConfig[] = [
  {
    id: "email",
    title: "Sähköposti",
    items: [
      { href: "/dashboard/inbox", label: "Saapuneet", icon: Inbox },
      { href: "/dashboard/sent", label: "Lähetetyt", icon: Send },
      { href: "/dashboard/drafts", label: "Luonnokset", icon: FileEdit },
      { href: "/dashboard/spam", label: "Roskaposti", icon: ShieldAlert },
      { href: "/dashboard/trash", label: "Roskakori", icon: Trash2 },
    ],
  },
  {
    id: "campaigns",
    title: "Kampanjat",
    items: [
      { href: "/dashboard/campaigns", label: "Kampanjat", icon: Megaphone },
      { href: "/dashboard/templates", label: "Mallipohjat", icon: FileText },
      { href: "/dashboard/lists", label: "Kontaktilistat", icon: Users },
    ],
  },
];

function SidebarNavItem({
  href,
  label,
  icon: Icon,
  isActive = false,
  isCollapsed,
  external = false,
  onClick,
}: {
  label: string;
  icon: ComponentType<{ className?: string }>;
  isActive?: boolean;
  isCollapsed: boolean;
  href?: string;
  external?: boolean;
  onClick?: () => void;
}) {
  const classes = cn(
    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
    isActive
      ? "bg-rascal-orange text-white shadow-[0_2px_8px_rgba(232,123,78,0.3)]"
      : "text-gray-400 hover:bg-gray-800 hover:text-white",
    isCollapsed && "justify-center",
  );

  const content = (
    <>
      <Icon className="h-5 w-5 shrink-0" />
      {!isCollapsed && <span className="truncate">{label}</span>}
    </>
  );

  let element: React.ReactNode;

  if (onClick) {
    element = (
      <button onClick={onClick} className={cn(classes, "w-full")}>
        {content}
      </button>
    );
  } else if (external && href) {
    element = (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
      >
        {content}
      </a>
    );
  } else if (href) {
    element = (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  if (isCollapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{element}</TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          {label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return <>{element}</>;
}

function SidebarSection({
  section,
  isCollapsed,
  isOpen,
  onToggle,
  pathname,
}: {
  section: NavSectionConfig;
  isCollapsed: boolean;
  isOpen: boolean;
  onToggle: () => void;
  pathname: string;
}) {
  return (
    <div className="mt-3">
      {isCollapsed ? (
        <div className="mx-3 mb-1 border-t border-gray-800" />
      ) : (
        <button
          onClick={onToggle}
          className="flex w-full items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500 hover:text-gray-300"
        >
          <span>{section.title}</span>
          <ChevronDown
            className={cn(
              "h-3 w-3 transition-transform",
              !isOpen && "-rotate-90",
            )}
          />
        </button>
      )}
      {(isCollapsed || isOpen) && (
        <div className="flex flex-col gap-0.5">
          {section.items.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <SidebarNavItem
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                isActive={isActive}
                isCollapsed={isCollapsed}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentOrg } = useOrganization();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(
    () => Object.fromEntries(navSections.map((s) => [s.id, true])),
  );
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--sidebar-width",
      isCollapsed ? "70px" : "250px",
    );
  }, [isCollapsed]);

  useEffect(() => {
    createAuthClient()
      .auth.getUser()
      .then(({ data }) => {
        if (data.user?.email) {
          setUserEmail(data.user.email);
        }
      });
  }, []);

  const handleSignOut = async () => {
    await createAuthClient().auth.signOut();
    router.push("/login");
  };

  const toggleSection = (sectionId: string) => {
    setOpenSections((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const orgInitials = currentOrg?.name
    ? currentOrg.name.substring(0, 2).toUpperCase()
    : "RM";

  const rascalAiUrl =
    process.env.NEXT_PUBLIC_RASCAL_AI_URL ?? "https://app.rascal.fi";

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        onMouseEnter={() => setIsCollapsed(false)}
        onMouseLeave={() => setIsCollapsed(true)}
        className={cn(
          "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-gray-800 bg-gray-900 text-white transition-all duration-300 max-md:hidden",
          isCollapsed ? "w-[70px]" : "w-[250px]",
        )}
      >
        {/* Profile */}
        <div className="border-b border-gray-700 p-3">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex shrink-0 items-center justify-center rounded-xl bg-gray-800 font-bold text-rascal-orange transition-all",
                isCollapsed ? "h-10 w-10 text-sm" : "h-12 w-12 text-base",
              )}
            >
              {orgInitials}
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">
                  {currentOrg?.name ?? "Rascal Mail"}
                </p>
                {userEmail && (
                  <p className="truncate text-xs text-gray-400">{userEmail}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-2">
          <div className="flex flex-col gap-0.5">
            {standaloneItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <SidebarNavItem
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  isActive={isActive}
                  isCollapsed={isCollapsed}
                />
              );
            })}
          </div>

          {navSections.map((section) => (
            <SidebarSection
              key={section.id}
              section={section}
              isCollapsed={isCollapsed}
              isOpen={openSections[section.id] ?? true}
              onToggle={() => toggleSection(section.id)}
              pathname={pathname}
            />
          ))}
        </nav>

        {/* Bottom */}
        <div className="border-t border-gray-800 p-2">
          <div className="flex flex-col gap-0.5">
            <SidebarNavItem
              href={rascalAiUrl}
              label="Rascal AI"
              icon={ExternalLink}
              isCollapsed={isCollapsed}
              external
            />
            <SidebarNavItem
              href="/dashboard/settings"
              label="Asetukset"
              icon={Settings}
              isActive={
                pathname === "/dashboard/settings" ||
                pathname.startsWith("/dashboard/settings/")
              }
              isCollapsed={isCollapsed}
            />
            <SidebarNavItem
              label="Kirjaudu ulos"
              icon={LogOut}
              isCollapsed={isCollapsed}
              onClick={handleSignOut}
            />
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}
