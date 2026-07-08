"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { Building2, CreditCard, Plug, ShieldCheck, User, Users } from "lucide-react";
import { localePath, stripLocalePrefix, toAppLocale } from "@/lib/i18n/locales";
import { cn } from "@/lib/utils";

const items = [
  { href: "/settings", icon: User, en: "Account", es: "Cuenta" },
  { href: "/settings/company", icon: Building2, en: "Company", es: "Empresa" },
  { href: "/settings/team", icon: Users, en: "Team", es: "Equipo" },
  { href: "/settings/security", icon: ShieldCheck, en: "Security", es: "Seguridad" },
  { href: "/settings/billing", icon: CreditCard, en: "Billing", es: "Facturación" },
  { href: "/settings/integrations", icon: Plug, en: "Integrations", es: "Integraciones" },
] as const;

export function SettingsNav() {
  const pathname = usePathname();
  const locale = toAppLocale(useLocale());
  const es = locale === "es";
  const logicalPath = stripLocalePrefix(pathname);

  return (
    <aside className="sticky top-24 hidden rounded-lg border border-[var(--it-hairline)] bg-[var(--it-surface)] p-2 lg:block">
      <p className="px-2.5 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--it-faint)]">
        {es ? "Configuración" : "Settings"}
      </p>
      <nav className="space-y-1">
        {items.map((item) => {
          const active = item.href === "/settings" ? logicalPath === "/settings" : logicalPath.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={localePath(item.href, locale)}
              className={cn(
                "group flex h-10 items-center gap-2.5 rounded-md border-l-2 px-2.5 text-[13px] font-medium transition-colors",
                active
                  ? "border-[var(--it-primary)] bg-[var(--it-primary-soft)] text-white"
                  : "border-transparent text-[var(--it-muted)] hover:bg-white/[0.03] hover:text-slate-100"
              )}
            >
              <item.icon
                className={cn("h-4 w-4 flex-shrink-0", active ? "text-[var(--it-primary-hover)]" : "")}
                strokeWidth={1.8}
              />
              <span>{es ? item.es : item.en}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
