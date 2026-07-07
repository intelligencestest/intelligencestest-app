"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { localePath, stripLocalePrefix, toAppLocale } from "@/lib/i18n/locales";

const navItems = [
  {
    href: "/dashboard",
    labelKey: "dashboard",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 3h7v7H3zM13 3h8v7h-8zM3 13h7v8H3zM13 13h8v8h-8z" />
      </svg>
    ),
  },
  {
    href: "/inbox",
    labelKey: "inbox",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.25 13.5h3.86a2.25 2.25 0 0 1 2.012 1.244l.256.512a2.25 2.25 0 0 0 2.013 1.244h3.218a2.25 2.25 0 0 0 2.013-1.244l.256-.512a2.25 2.25 0 0 1 2.013-1.244h3.859M2.25 13.5V6.75A2.25 2.25 0 0 1 4.5 4.5h15a2.25 2.25 0 0 1 2.25 2.25v6.75m-19.5 0v4.5A2.25 2.25 0 0 0 4.5 20.25h15a2.25 2.25 0 0 0 2.25-2.25v-4.5" />
      </svg>
    ),
  },
  {
    href: "/projects",
    labelKey: "projects",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zm0 0V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
      </svg>
    ),
  },
  {
    href: "/candidates",
    labelKey: "candidates",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  {
    href: "/assessments",
    labelKey: "assessments",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    href: "/reports",
    labelKey: "reports",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2" />
      </svg>
    ),
  },
  {
    href: "/settings",
    labelKey: "settings",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

interface SidebarProps {
  /** Candidates waiting for review — the Inbox workload badge. */
  reviewCount?: number;
}

export default function Sidebar({ reviewCount = 0 }: SidebarProps) {
  const pathname = usePathname();
  const nav = useTranslations("nav");
  const locale = toAppLocale(useLocale());
  const es = locale === "es";
  const [mobileOpen, setMobileOpen] = useState(false);

  // Compare against the logical path so /es/projects highlights the same item
  // as /projects. Links themselves keep the /es prefix for Spanish workspaces.
  const logicalPath = stripLocalePrefix(pathname);
  const isActive = (href: string) => {
    if (href === "/dashboard") return logicalPath === "/dashboard";
    return logicalPath.startsWith(href);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b enterprise-divider">
        <div className="w-9 h-9 rounded-lg bg-[var(--it-primary)] border border-white/10 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-white" fill="none" stroke="white" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3 4 7.2 12 11.4l8-4.2L12 3Z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m4 12.8 8 4.2 8-4.2M4 17.8l8 4.2 8-4.2" />
          </svg>
        </div>
        <div>
          <div className="text-sm font-semibold text-white leading-tight">Intelligences Test</div>
          <div className="text-xs text-[var(--it-faint)] leading-tight">{es ? "Sistema de evaluación" : "Assessment OS"}</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1.5">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={localePath(item.href, locale)}
              onClick={() => setMobileOpen(false)}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                active
                  ? "bg-white/[0.045] text-white border border-[var(--it-border)]"
                  : "border border-transparent text-[var(--it-muted)] hover:text-slate-100 hover:bg-white/[0.025]"
              }`}
            >
              <span className={`transition-colors ${active ? "text-[#b7c5e6]" : "text-[var(--it-faint)] group-hover:text-slate-300"}`}>{item.icon}</span>
              <span className="min-w-0 flex-1 truncate">{nav(item.labelKey)}</span>
              {item.href === "/inbox" && reviewCount > 0 && (
                <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold tabular-nums ${
                  active
                    ? "border-white/10 bg-white/[0.06] text-slate-100"
                    : "border-[var(--it-border)] bg-[var(--it-bg)] text-[var(--it-muted)] group-hover:text-slate-200"
                }`}>
                  {reviewCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t enterprise-divider px-6 py-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--it-faint)]">
          {es ? "Espacio de trabajo" : "Workspace"}
        </p>
      </div>
    </div>
  );

  return (
    <>
      <button
        className="lg:hidden print:hidden fixed top-4 left-4 z-50 p-2 rounded-lg enterprise-card text-slate-400 cursor-pointer"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {mobileOpen
            ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          }
        </svg>
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

      <aside className="hidden lg:flex print:hidden flex-col w-64 flex-shrink-0 h-full bg-[var(--it-sidebar)] border-r enterprise-divider">
        <SidebarContent />
      </aside>
    </>
  );
}
