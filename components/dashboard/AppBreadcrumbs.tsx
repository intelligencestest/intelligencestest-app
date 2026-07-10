"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { localePath, stripLocalePrefix, toAppLocale, type AppLocale } from "@/lib/i18n/locales";
import { cn } from "@/lib/utils";

type Crumb = {
  href?: string;
  label: string;
};

const labels: Record<AppLocale, Record<string, string>> = {
  en: {
    dashboard: "Dashboard",
    inbox: "Inbox",
    projects: "Projects",
    candidates: "Candidates",
    assessments: "Assessments",
    reports: "Reports",
    settings: "Settings",
    account: "Account",
    company: "Company",
    team: "Team",
    security: "Security",
    billing: "Billing",
    subscriptions: "Subscriptions",
    integrations: "Integrations",
    admin: "Admin",
  },
  es: {
    dashboard: "Panel",
    inbox: "Bandeja",
    projects: "Proyectos",
    candidates: "Candidatos",
    assessments: "Evaluaciones",
    reports: "Informes",
    settings: "Configuración",
    account: "Cuenta",
    company: "Empresa",
    team: "Equipo",
    security: "Seguridad",
    billing: "Facturación",
    subscriptions: "Suscripciones",
    integrations: "Integraciones",
    admin: "Admin",
  },
};

function humanize(segment: string) {
  return segment
    .split("-")
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function crumbsForPath(logicalPath: string, locale: AppLocale): Crumb[] {
  const copy = labels[locale];
  const segments = logicalPath.split("/").filter(Boolean);
  const [first, second] = segments;

  if (!first || first === "dashboard") {
    return [{ label: copy.dashboard }];
  }

  if (first === "settings") {
    if (second === "billing") {
      return [
        { href: "/settings/billing", label: copy.billing },
        { label: copy.subscriptions },
      ];
    }

    const settingsLabel = second ? copy[second] ?? humanize(second) : copy.account;
    return [
      { href: "/settings", label: copy.settings },
      { label: settingsLabel },
    ];
  }

  const primaryLabel = copy[first] ?? humanize(first);
  if (!second) return [{ label: primaryLabel }];

  return [
    { href: `/${first}`, label: primaryLabel },
    { label: copy[second] ?? humanize(second) },
  ];
}

export function AppBreadcrumbs() {
  const locale = toAppLocale(useLocale());
  const pathname = usePathname();
  const crumbs = crumbsForPath(stripLocalePrefix(pathname), locale);
  const homeHref = localePath("/dashboard", locale);

  return (
    <nav aria-label={locale === "es" ? "Ruta" : "Breadcrumb"} className="min-w-0">
      <ol className="flex min-w-0 items-center gap-2 text-[13px]">
        <li className="flex items-center">
          <Link
            href={homeHref}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[var(--it-muted)] transition-colors hover:bg-gray-900/[0.035] hover:text-[var(--it-text)]"
            aria-label={locale === "es" ? "Panel" : "Dashboard"}
          >
            <Home className="h-4 w-4" strokeWidth={1.8} />
          </Link>
        </li>
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          return (
            <li key={`${crumb.label}-${index}`} className="flex min-w-0 items-center gap-2">
              <ChevronRight className="h-4 w-4 flex-shrink-0 text-[var(--it-faint)]" strokeWidth={1.8} />
              {crumb.href && !isLast ? (
                <Link
                  href={localePath(crumb.href, locale)}
                  className="truncate font-medium text-[var(--it-muted)] transition-colors hover:text-[var(--it-text)]"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className={cn("truncate font-semibold", isLast ? "text-[var(--it-text)]" : "text-[var(--it-muted)]")}>
                  {crumb.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
