"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Building2,
  ChevronRight,
  CreditCard,
  LogOut,
  Plug,
  ShieldCheck,
  User,
  UserRound,
  Users,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { localePath, toAppLocale, type AppLocale } from "@/lib/i18n/locales";
import { createClient } from "@/lib/supabase";
import { initialsFor } from "@/lib/user-display";

interface AccountMenuProps {
  userEmail?: string;
  userName?: string;
  /** Kept for old call sites; the menu is now a single top-right account control. */
  variant?: "topbar" | "sidebar";
  collapsed?: boolean;
}

const ACCOUNT_MENU_COPY: Record<AppLocale, {
  account: string;
  company: string;
  team: string;
  security: string;
  billing: string;
  integrations: string;
  language: string;
  languageValue: string;
  menu: string;
  admin: string;
}> = {
  es: {
    account: "Cuenta",
    company: "Empresa",
    team: "Equipo",
    security: "Seguridad",
    billing: "Facturación",
    integrations: "Integraciones",
    language: "Idioma",
    languageValue: "Español",
    menu: "Menú de cuenta",
    admin: "Administrador",
  },
  fr: {
    account: "Compte",
    company: "Entreprise",
    team: "Équipe",
    security: "Sécurité",
    billing: "Facturation",
    integrations: "Intégrations",
    language: "Langue",
    languageValue: "Français",
    menu: "Menu du compte",
    admin: "Administrateur",
  },
  en: {
    account: "Account",
    company: "Company",
    team: "Team",
    security: "Security",
    billing: "Billing",
    integrations: "Integrations",
    language: "Language",
    languageValue: "English",
    menu: "Account menu",
    admin: "Admin",
  },
};

export function AccountMenu({ userEmail, userName }: AccountMenuProps) {
  const locale = toAppLocale(useLocale());
  const auth = useTranslations("auth");
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const initials = initialsFor(userName, userEmail);
  const copy = ACCOUNT_MENU_COPY[locale];
  const displayName = userName ?? copy.admin;

  const handleLogout = async () => {
    setLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push(localePath("/login", locale));
    router.refresh();
  };

  const links = [
    { href: "/settings", label: copy.account, icon: User },
    { href: "/settings/company", label: copy.company, icon: Building2 },
    { href: "/settings/team", label: copy.team, icon: Users },
    { href: "/settings/security", label: copy.security, icon: ShieldCheck },
    { href: "/settings/billing", label: copy.billing, icon: CreditCard },
    { href: "/settings/integrations", label: copy.integrations, icon: Plug },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={copy.menu}
          className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-[var(--it-hairline)] bg-[var(--it-surface)] text-[var(--it-text)] transition-colors hover:bg-[var(--it-surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--it-primary)]/35"
        >
          <UserRound className="h-4 w-4" strokeWidth={1.8} />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        side="bottom"
        sideOffset={10}
        className="w-[min(18rem,calc(100vw-2rem))] rounded-xl border-[var(--it-hairline)] bg-[var(--it-surface)] p-0 shadow-[0_16px_42px_rgba(15,23,42,0.12)]"
      >
        <div className="flex items-center gap-3 border-b border-[var(--it-hairline)] px-4 py-3">
          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-[var(--it-hairline)] bg-[var(--it-bg)] text-xs font-semibold text-[var(--it-text)]">
            {initials}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[var(--it-text)]">{displayName}</p>
            {userEmail ? <p className="mt-0.5 truncate text-xs text-[var(--it-muted)]">{userEmail}</p> : null}
          </div>
        </div>

        <div className="py-1.5">
          {links.map((link) => (
            <DropdownMenuItem key={link.href} asChild className="rounded-none px-4 py-2.5 focus:bg-gray-900/[0.035]">
              <Link href={localePath(link.href, locale)} className="flex items-center gap-3 text-sm font-medium text-[var(--it-text)]">
                <link.icon className="h-4 w-4 flex-shrink-0 text-[var(--it-faint)]" />
                <span className="min-w-0 flex-1 truncate">{link.label}</span>
                <ChevronRight className="h-4 w-4 flex-shrink-0 text-[var(--it-faint)]" />
              </Link>
            </DropdownMenuItem>
          ))}
        </div>

        <div className="border-t border-[var(--it-hairline)] px-4 py-3">
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="text-[var(--it-muted)]">{copy.language}</span>
            <span className="font-medium text-[var(--it-text)]">{copy.languageValue}</span>
          </div>
        </div>

        <DropdownMenuSeparator className="m-0 bg-[var(--it-hairline)]" />

        <DropdownMenuItem
          onClick={handleLogout}
          disabled={loggingOut}
          className="cursor-pointer justify-between rounded-none px-4 py-3 text-sm font-semibold text-[var(--it-text)] focus:bg-red-50 focus:text-[#b91c1c]"
        >
          <span>{loggingOut ? auth("signingOut") : auth("signOut")}</span>
          <LogOut className="h-4 w-4" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
