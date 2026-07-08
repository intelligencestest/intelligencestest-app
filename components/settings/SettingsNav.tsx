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
    <aside className="enterprise-card sticky top-24 hidden rounded-xl p-3 lg:block">
      <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--it-faint)]">
        {es ? "Configuración" : "Settings"}
      </p>
      <nav className="mt-1 space-y-1">
        {items.map((item) => {
          const active = item.href === "/settings" ? logicalPath === "/settings" : logicalPath.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={localePath(item.href, locale)}
              className={cn(
                "group flex items-center gap-2.5 rounded-lg border-l-2 px-3 py-2.5 text-[13px] font-medium transition-colors",
                active
                  ? "border-[var(--it-primary)] bg-white/[0.04] text-white"
                  : "border-transparent text-[var(--it-muted)] hover:bg-white/[0.02] hover:text-slate-100"
              )}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" strokeWidth={1.8} />
              <span>{es ? item.es : item.en}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
