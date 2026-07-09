"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BarChart3,
  ChevronsLeft,
  ChevronsRight,
  ClipboardCheck,
  FolderKanban,
  Inbox,
  LayoutDashboard,
  Menu,
  Settings,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { AccountMenu } from "@/components/dashboard/AccountMenu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { localePath, stripLocalePrefix, toAppLocale } from "@/lib/i18n/locales";
import { cn } from "@/lib/utils";

const COLLAPSE_KEY = "it-sidebar-collapsed";

const navItems: { href: string; labelKey: string; icon: LucideIcon }[] = [
  { href: "/dashboard", labelKey: "dashboard", icon: LayoutDashboard },
  { href: "/inbox", labelKey: "inbox", icon: Inbox },
  { href: "/projects", labelKey: "projects", icon: FolderKanban },
  { href: "/candidates", labelKey: "candidates", icon: Users },
  { href: "/assessments", labelKey: "assessments", icon: ClipboardCheck },
  { href: "/reports", labelKey: "reports", icon: BarChart3 },
  { href: "/settings", labelKey: "settings", icon: Settings },
];

interface SidebarProps {
  /** Candidates waiting for review — the Inbox workload badge. */
  reviewCount?: number;
  userName?: string;
  userEmail?: string;
}

export default function Sidebar({ reviewCount = 0, userName, userEmail }: SidebarProps) {
  const pathname = usePathname();
  const nav = useTranslations("nav");
  const locale = toAppLocale(useLocale());
  const es = locale === "es";
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Read the persisted collapse state after mount to avoid an SSR/client markup
  // mismatch (localStorage isn't available on the server).
  useEffect(() => {
    setCollapsed(window.localStorage.getItem(COLLAPSE_KEY) === "1");
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      window.localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      return next;
    });
  };

  // Compare against the logical path so /es/projects highlights the same item
  // as /projects. Links themselves keep the /es prefix for Spanish workspaces.
  const logicalPath = stripLocalePrefix(pathname);
  const isActive = (href: string) => {
    if (href === "/dashboard") return logicalPath === "/dashboard";
    return logicalPath.startsWith(href);
  };

  const SidebarContent = ({ collapsible = false }: { collapsible?: boolean }) => {
    const isCollapsed = collapsible && collapsed;
    return (
      <TooltipProvider delayDuration={200}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className={cn("flex items-center gap-3 border-b enterprise-divider py-5", isCollapsed ? "justify-center px-3" : "px-6")}>
            <div className="w-9 h-9 rounded-lg bg-[var(--it-primary)] border border-white/10 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="white" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3 4 7.2 12 11.4l8-4.2L12 3Z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m4 12.8 8 4.2 8-4.2M4 17.8l8 4.2 8-4.2" />
              </svg>
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <div className="truncate text-[13px] font-semibold leading-tight text-white">Intelligences Test</div>
                <div className="truncate text-[11px] leading-tight text-[var(--it-faint)]">{es ? "Sistema de evaluación" : "Assessment OS"}</div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            {navItems.map((item) => {
              const active = isActive(item.href);
              const link = (
                <Link
                  key={item.href}
                  href={localePath(item.href, locale)}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "group flex items-center gap-3 rounded-md px-3 py-2 text-[13px] font-medium tracking-[0.005em] transition-colors duration-150",
                    isCollapsed && "justify-center",
                    active
                      ? "bg-white/[0.055] text-white"
                      : "text-[var(--it-muted)] hover:bg-white/[0.03] hover:text-slate-100"
                  )}
                >
                  <item.icon
                    className={cn("h-[18px] w-[18px] flex-shrink-0 transition-colors", active ? "text-slate-100" : "text-[var(--it-faint)] group-hover:text-slate-300")}
                    strokeWidth={1.8}
                  />
                  {!isCollapsed && (
                    <>
                      <span className="min-w-0 flex-1 truncate">{nav(item.labelKey)}</span>
                      {item.href === "/inbox" && reviewCount > 0 && (
                        <span
                          className={cn(
                            "rounded-full border px-2 py-0.5 text-[11px] font-semibold tabular-nums",
                            active
                              ? "border-white/10 bg-white/[0.06] text-slate-100"
                              : "border-[var(--it-border)] bg-[var(--it-bg)] text-[var(--it-muted)] group-hover:text-slate-200"
                          )}
                        >
                          {reviewCount}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              );

              if (!isCollapsed) return link;

              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{link}</TooltipTrigger>
                  <TooltipContent side="right" sideOffset={12}>
                    {nav(item.labelKey)}
                    {item.href === "/inbox" && reviewCount > 0 ? ` (${reviewCount})` : ""}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </nav>

          {/* Collapse toggle — desktop rail only */}
          {collapsible && (
            <button
              type="button"
              onClick={toggleCollapsed}
              title={isCollapsed ? (es ? "Expandir" : "Expand") : es ? "Contraer" : "Collapse"}
              className={cn(
                "mx-3 mb-2 flex items-center gap-2 rounded-lg px-2.5 py-2 text-[12px] font-medium text-[var(--it-faint)] transition-colors hover:bg-white/[0.02] hover:text-slate-300 cursor-pointer",
                isCollapsed && "justify-center"
              )}
            >
              {isCollapsed ? <ChevronsRight className="h-4 w-4 flex-shrink-0" strokeWidth={1.8} /> : <ChevronsLeft className="h-4 w-4 flex-shrink-0" strokeWidth={1.8} />}
              {!isCollapsed && <span>{es ? "Contraer" : "Collapse"}</span>}
            </button>
          )}

          {/* Footer — profile card, opens the shared account menu */}
          <div className="border-t enterprise-divider px-3 py-3">
            <AccountMenu variant="sidebar" collapsed={isCollapsed} userName={userName} userEmail={userEmail} />
          </div>
        </div>
      </TooltipProvider>
    );
  };

  return (
    <>
      <button
        className="lg:hidden print:hidden fixed top-4 left-4 z-50 p-2 rounded-lg enterprise-card text-slate-400 cursor-pointer"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="w-5 h-5" strokeWidth={2} /> : <Menu className="w-5 h-5" strokeWidth={2} />}
      </button>

      {mobileOpen && (
        <div
          className="lg:hidden print:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`lg:hidden print:hidden fixed top-0 left-0 z-40 h-full w-64 bg-[var(--it-sidebar)] border-r enterprise-divider transform transition-transform duration-200 shadow-2xl ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent />
      </aside>

      <aside
        className={cn(
          "hidden lg:flex print:hidden flex-col flex-shrink-0 h-full bg-[var(--it-sidebar)] border-r enterprise-divider transition-[width] duration-200 ease-out motion-reduce:transition-none",
          collapsed ? "w-[76px]" : "w-64"
        )}
      >
        <SidebarContent collapsible />
      </aside>
    </>
  );
}
