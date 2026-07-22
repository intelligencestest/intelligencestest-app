"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BarChart3,
  ClipboardCheck,
  FolderKanban,
  Inbox,
  LayoutDashboard,
  Menu,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { BrandLockup, BrandLogoMark } from "@/components/brand/BrandLogo";
import { localePath, stripLocalePrefix, toAppLocale } from "@/lib/i18n/locales";
import { cn } from "@/lib/utils";

type NavItem = { href: string; labelKey: string; icon: LucideIcon };

/** Navigation grouped into named areas of work — the chrome reads as an
    operating system, not a flat list of pages (design-language.md §5).
    Group labels are presentation copy; kicker: null renders no heading. */
const navGroups: { kicker: { en: string; es: string; fr: string } | null; items: NavItem[] }[] = [
  {
    kicker: null,
    items: [
      { href: "/dashboard", labelKey: "dashboard", icon: LayoutDashboard },
      { href: "/inbox", labelKey: "inbox", icon: Inbox },
    ],
  },
  {
    kicker: { en: "Pipeline", es: "Proceso", fr: "Pipeline" },
    items: [
      { href: "/projects", labelKey: "projects", icon: FolderKanban },
      { href: "/candidates", labelKey: "candidates", icon: Users },
      { href: "/assessments", labelKey: "assessments", icon: ClipboardCheck },
    ],
  },
  {
    kicker: { en: "Insight", es: "Análisis", fr: "Analyse" },
    items: [{ href: "/reports", labelKey: "reports", icon: BarChart3 }],
  },
];

interface SidebarProps {
  /** Candidates waiting for review — the Inbox workload badge. */
  reviewCount?: number;
}

const SUBTITLE: Record<ReturnType<typeof toAppLocale>, string> = {
  en: "Assessment OS",
  es: "Sistema de evaluación",
  fr: "Système d'évaluation",
};

interface SidebarContentProps {
  compact: boolean;
  isActive: (href: string) => boolean;
  locale: ReturnType<typeof toAppLocale>;
  nav: (key: string) => string;
  onNavigate: () => void;
  reviewCount: number;
}

function SidebarContent({ compact, isActive, locale, nav, onNavigate, reviewCount }: SidebarContentProps) {
  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className={cn("flex items-center border-b enterprise-divider py-5", compact ? "justify-center px-2" : "gap-3 px-6")}>
        {compact ? (
          <BrandLogoMark className="h-9 w-9 rounded-lg" />
        ) : (
          <BrandLockup
            subtitle={SUBTITLE[locale]}
            markClassName="h-9 w-9 rounded-lg"
            titleClassName="text-[13px] leading-tight"
            subtitleClassName="text-[11px] leading-tight text-[var(--it-faint)]"
          />
        )}
      </div>

      {/* Navigation — grouped areas of work */}
      <nav className={cn("flex-1 py-4", compact ? "px-2" : "px-3")}>
        {navGroups.map((group, gi) => (
          <div key={gi} className={cn(gi > 0 && (compact ? "mt-3" : "mt-5"))}>
            {group.kicker && !compact && (
              <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.09em] text-[var(--it-faint)]">
                {group.kicker[locale]}
              </p>
            )}
            <div className="space-y-1">
            {group.items.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={localePath(item.href, locale)}
                  onClick={onNavigate}
                  title={compact ? nav(item.labelKey) : undefined}
                  className={cn(
                    "group relative flex items-center rounded-md text-[13px] font-medium tracking-[0.005em] transition-colors duration-150",
                    compact ? "h-11 justify-center px-0 py-0" : "gap-3 px-3 py-2",
                    active
                      ? "bg-gray-900/[0.055] text-[var(--it-text)]"
                      : "text-[var(--it-muted)] hover:bg-gray-900/[0.03] hover:text-[var(--it-text)]"
                  )}
                >
                  <item.icon
                    className={cn("h-[18px] w-[18px] flex-shrink-0 transition-colors", active ? "text-[var(--it-text)]" : "text-[var(--it-faint)] group-hover:text-[var(--it-muted)]")}
                    strokeWidth={1.8}
                  />
                  <span className={compact ? "sr-only" : "min-w-0 flex-1 truncate"}>{nav(item.labelKey)}</span>
                  {item.href === "/inbox" && reviewCount > 0 && (
                    <span
                      className={cn(
                        "rounded-full border text-[11px] font-semibold tabular-nums",
                        compact ? "absolute right-0.5 top-0.5 min-w-5 px-1 py-0 text-center" : "px-2 py-0.5",
                        active
                          ? "border-gray-900/10 bg-gray-900/[0.06] text-[var(--it-text)]"
                          : "border-[var(--it-border)] bg-[var(--it-bg)] text-[var(--it-muted)] group-hover:text-[var(--it-text)]"
                      )}
                    >
                      {reviewCount}
                    </span>
                  )}
                </Link>
              );
            })}
            </div>
          </div>
        ))}
      </nav>
    </div>
  );
}

export default function Sidebar({ reviewCount = 0 }: SidebarProps) {
  const pathname = usePathname();
  const nav = useTranslations("nav");
  const locale = toAppLocale(useLocale());
  const [mobileOpen, setMobileOpen] = useState(false);

  // Compare against the logical path so /es/projects highlights the same item
  // as /projects. Links themselves keep the /es prefix for Spanish workspaces.
  const logicalPath = stripLocalePrefix(pathname);
  const isActive = (href: string) => {
    if (href === "/dashboard") return logicalPath === "/dashboard";
    return logicalPath.startsWith(href);
  };
  const compact = logicalPath.startsWith("/settings/billing");

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
          className="lg:hidden print:hidden fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`lg:hidden print:hidden fixed top-0 left-0 z-40 h-full w-64 bg-[var(--it-sidebar)] border-r enterprise-divider transform transition-transform duration-200 shadow-xl ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent
          compact={false}
          isActive={isActive}
          locale={locale}
          nav={nav}
          onNavigate={() => setMobileOpen(false)}
          reviewCount={reviewCount}
        />
      </aside>

      <aside
        className={cn(
          "hidden h-full flex-shrink-0 flex-col border-r enterprise-divider bg-[var(--it-sidebar)] transition-[width] duration-200 lg:flex print:hidden",
          compact ? "w-20" : "w-64"
        )}
      >
        <SidebarContent
          compact={compact}
          isActive={isActive}
          locale={locale}
          nav={nav}
          onNavigate={() => setMobileOpen(false)}
          reviewCount={reviewCount}
        />
      </aside>
    </>
  );
}
