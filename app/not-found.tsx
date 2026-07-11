import Link from "next/link";
import { getLocale } from "next-intl/server";
import { BrandLockup } from "@/components/brand/BrandLogo";
import { localePath, toAppLocale } from "@/lib/i18n/locales";

/** Branded 404 — calm, Spanish-first, one way back. */
export default async function NotFound() {
  const locale = toAppLocale(await getLocale());
  const es = locale === "es";

  const copy = es
    ? {
        code: "404",
        title: "Página no encontrada",
        body: "La página que busca no existe o se ha movido. Si llegó aquí desde un enlace de evaluación, es posible que haya caducado.",
        home: "Ir al inicio",
        dashboard: "Ir al panel",
      }
    : {
        code: "404",
        title: "Page not found",
        body: "The page you are looking for does not exist or has moved. If you arrived from an assessment link, it may have expired.",
        home: "Go to home",
        dashboard: "Go to dashboard",
      };

  return (
    <main className="flex min-h-screen flex-col bg-[var(--it-bg)]">
      <div className="px-6 pt-8">
        <BrandLockup subtitle={es ? "Plataforma de evaluación" : "Assessment Platform"} markClassName="h-9 w-9 rounded-lg" />
      </div>
      <div className="flex flex-1 items-center justify-center px-6 pb-24">
        <div className="max-w-md">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--it-faint)]">{copy.code}</p>
          <h1 className="font-editorial mt-3 text-3xl font-medium text-[var(--it-text)]">{copy.title}</h1>
          <p className="mt-3 text-sm leading-6 text-[var(--it-muted)]">{copy.body}</p>
          <div className="mt-7 flex items-center gap-3">
            <Link
              href={localePath("/dashboard", locale)}
              className="enterprise-button inline-flex items-center rounded-lg px-4 py-2.5 text-sm font-semibold"
            >
              {copy.dashboard}
            </Link>
            <Link
              href={localePath("/", locale)}
              className="enterprise-button-secondary inline-flex items-center rounded-lg px-4 py-2.5 text-sm font-medium"
            >
              {copy.home}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
