"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { localePath, toAppLocale } from "@/lib/i18n/locales";
import { createClient } from "@/lib/supabase";
import { initialsFor } from "@/lib/user-display";

interface AccountMenuProps {
  userEmail?: string;
  userName?: string;
}

export function AccountMenu({ userEmail, userName }: AccountMenuProps) {
  const locale = toAppLocale(useLocale());
  const auth = useTranslations("auth");
  const router = useRouter();
  const es = locale === "es";
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const initials = initialsFor(userName, userEmail);
  const displayName = userName ?? (es ? "Administrador" : "Admin");

  const copy = es
    ? {
        account: "Información de cuenta",
        billing: "Plan y facturación",
        notifications: "Notificaciones",
        language: "Idioma",
        languageValue: "Español",
        menu: "Menú de cuenta",
      }
    : {
        account: "Account information",
        billing: "Plan and billing",
        notifications: "Notifications",
        language: "Language",
        languageValue: "English",
        menu: "Account menu",
      };

  const handleLogout = async () => {
    setLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push(localePath("/login", locale));
    router.refresh();
  };

  const links = [
    { href: "/settings", label: copy.account },
    { href: "/settings/billing", label: copy.billing },
    { href: "/settings#notifications", label: copy.notifications },
  ];

  return (
    <div className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="group inline-flex cursor-pointer items-center gap-2 rounded-full border border-[var(--it-border)] bg-[var(--it-card)]/92 p-1.5 text-left shadow-[0_18px_45px_rgba(0,0,0,0.2)] transition-colors hover:border-[#2f3a62] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/50"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#2f3a62] bg-[#11182b] text-xs font-semibold text-slate-100">
          {initials}
        </span>
        <svg className={`h-4 w-4 text-[var(--it-faint)] transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label={es ? "Cerrar menú de cuenta" : "Close account menu"}
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div
            role="menu"
            aria-label={copy.menu}
            className="absolute right-0 top-[calc(100%+0.75rem)] z-50 w-[min(21rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-[var(--it-border)] bg-[#0D1020] shadow-[0_28px_70px_rgba(0,0,0,0.42)]"
          >
            <div className="border-b border-[var(--it-border)] px-4 py-4">
              <p className="truncate text-sm font-semibold text-white">{displayName}</p>
              <p className="mt-0.5 truncate text-xs text-[var(--it-muted)]">{userEmail}</p>
            </div>

            <div className="py-2">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={localePath(link.href, locale)}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className="flex cursor-pointer items-center justify-between gap-4 px-4 py-3 text-sm font-medium text-slate-300 transition-colors hover:bg-white/[0.035] hover:text-white"
                >
                  <span>{link.label}</span>
                  <svg className="h-4 w-4 text-[var(--it-faint)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="m9 6 6 6-6 6" />
                  </svg>
                </Link>
              ))}
            </div>

            <div className="border-t border-[var(--it-border)] px-4 py-3">
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-[var(--it-muted)]">{copy.language}</span>
                <span className="font-medium text-slate-200">{copy.languageValue}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              role="menuitem"
              className="flex w-full cursor-pointer items-center justify-between border-t border-[var(--it-border)] px-4 py-3 text-left text-sm font-semibold text-slate-300 transition-colors hover:bg-red-500/10 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span>{loggingOut ? auth("signingOut") : auth("signOut")}</span>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v1" />
              </svg>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
