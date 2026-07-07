"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Bell, ChevronDown, ChevronRight, CreditCard, LogOut, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { localePath, toAppLocale } from "@/lib/i18n/locales";
import { createClient } from "@/lib/supabase";
import { initialsFor } from "@/lib/user-display";
import { cn } from "@/lib/utils";

interface AccountMenuProps {
  userEmail?: string;
  userName?: string;
  /** "topbar" — avatar pill with chevron. "sidebar" — full profile row (used in the sidebar footer). */
  variant?: "topbar" | "sidebar";
  /** Sidebar variant only: hide the name/email text when the rail is collapsed to icons. */
  collapsed?: boolean;
}

export function AccountMenu({ userEmail, userName, variant = "topbar", collapsed = false }: AccountMenuProps) {
  const locale = toAppLocale(useLocale());
  const auth = useTranslations("auth");
  const router = useRouter();
  const es = locale === "es";
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
    { href: "/settings", label: copy.account, icon: User },
    { href: "/settings/billing", label: copy.billing, icon: CreditCard },
    { href: "/settings#notifications", label: copy.notifications, icon: Bell },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {variant === "sidebar" ? (
          <button
            type="button"
            aria-label={copy.menu}
            className={cn(
              "group flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors hover:bg-white/[0.025] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--it-primary)]",
              collapsed && "justify-center"
            )}
          >
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-[var(--it-border)] bg-white/[0.03] text-[11px] font-semibold text-slate-200">
              {initials}
            </span>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-slate-200">{displayName}</p>
                {userEmail && <p className="truncate text-[11px] text-[var(--it-faint)]">{userEmail}</p>}
              </div>
            )}
          </button>
        ) : (
          <button
            type="button"
            aria-label={copy.menu}
            className="group inline-flex cursor-pointer items-center gap-2 rounded-full border border-[var(--it-border)] bg-[var(--it-surface)]/92 p-1.5 text-left shadow-[0_18px_45px_rgba(0,0,0,0.2)] transition-colors hover:border-[#2f3a62] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--it-primary)]/50"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#2f3a62] bg-[#11182b] text-xs font-semibold text-slate-100">
              {initials}
            </span>
            <ChevronDown className="h-4 w-4 text-[var(--it-faint)] transition-transform group-data-[state=open]:rotate-180" />
          </button>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align={variant === "sidebar" ? "start" : "end"}
        side={variant === "sidebar" ? "right" : "bottom"}
        sideOffset={variant === "sidebar" ? 8 : 12}
        className="w-[min(21rem,calc(100vw-2rem))] rounded-2xl p-0"
      >
        <div className="-mx-px -mt-px border-b border-[var(--it-border-soft)] px-4 py-4">
          <p className="truncate text-sm font-semibold text-white">{displayName}</p>
          <p className="mt-0.5 truncate text-xs text-[var(--it-muted)]">{userEmail}</p>
        </div>

        <div className="py-2">
          {links.map((link) => (
            <DropdownMenuItem key={link.href} asChild className="rounded-none px-4 py-3 focus:bg-white/[0.035]">
              <Link href={localePath(link.href, locale)} className="flex items-center gap-3 text-sm font-medium text-slate-300">
                <link.icon className="h-4 w-4 flex-shrink-0 text-[var(--it-faint)]" />
                <span className="min-w-0 flex-1 truncate">{link.label}</span>
                <ChevronRight className="h-4 w-4 flex-shrink-0 text-[var(--it-faint)]" />
              </Link>
            </DropdownMenuItem>
          ))}
        </div>

        <div className="border-t border-[var(--it-border-soft)] px-4 py-3">
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="text-[var(--it-muted)]">{copy.language}</span>
            <span className="font-medium text-slate-200">{copy.languageValue}</span>
          </div>
        </div>

        <DropdownMenuSeparator className="m-0 bg-[var(--it-border-soft)]" />

        <DropdownMenuItem
          onClick={handleLogout}
          disabled={loggingOut}
          className="cursor-pointer justify-between rounded-none px-4 py-3 text-sm font-semibold text-slate-300 focus:bg-red-500/10 focus:text-red-200"
        >
          <span>{loggingOut ? auth("signingOut") : auth("signOut")}</span>
          <LogOut className="h-4 w-4" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
