"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { localePath, toAppLocale } from "@/lib/i18n/locales";

/**
 * Integrations settings. No fake connectors and no "coming soon" vagueness:
 * integrations are on the roadmap, prioritized by customer demand, and the
 * screen says exactly that — plus what already works today (PDF export).
 */
export default function IntegrationsSettingsPage() {
  const locale = toAppLocale(useLocale());
  const es = locale === "es";

  const copy = es
    ? {
        title: "Integraciones",
        description: "Conexiones con su ecosistema de selección.",
        roadmapTitle: "En la hoja de ruta",
        roadmapBody:
          "Las integraciones con ATS y otras herramientas de selección están en desarrollo y se priorizan según la demanda de los clientes. Cuéntenos qué sistema usa su equipo y lo tendremos en cuenta.",
        requestCta: "Solicitar una integración",
        todayTitle: "Disponible hoy",
        todayBody:
          "Los informes ejecutivos se exportan en PDF y pueden compartirse o archivarse en cualquier sistema. Los candidatos reciben enlaces directos, sin necesidad de integración.",
      }
    : {
        title: "Integrations",
        description: "Connections to your hiring ecosystem.",
        roadmapTitle: "On the roadmap",
        roadmapBody:
          "ATS and other hiring-tool integrations are in development, prioritized by customer demand. Tell us which system your team uses and we will take it into account.",
        requestCta: "Request an integration",
        todayTitle: "Available today",
        todayBody:
          "Executive reports export to PDF and can be shared or archived in any system. Candidates receive direct links — no integration required.",
      };

  return (
    <div className="mx-auto max-w-[1200px]">
      <div>
        <h1 className="text-[30px] font-semibold leading-[38px] tracking-[-0.01em] text-[var(--it-text)]">{copy.title}</h1>
        <p className="mt-2 text-sm text-[var(--it-muted)]">{copy.description}</p>
      </div>

      <div className="mt-8 border-t border-[var(--it-hairline)] pt-4">
        <p className="text-sm font-semibold text-[var(--it-text)]">{copy.roadmapTitle}</p>
        <p className="mt-1.5 max-w-2xl text-sm leading-6 text-[var(--it-muted)]">{copy.roadmapBody}</p>
        <Link
          href={localePath("/contact", locale)}
          className="enterprise-button-secondary mt-4 inline-flex items-center rounded-lg px-4 py-2.5 text-sm font-medium"
        >
          {copy.requestCta}
        </Link>
      </div>

      <div className="mt-10 border-t border-[var(--it-hairline)] pt-4">
        <p className="text-sm font-semibold text-[var(--it-text)]">{copy.todayTitle}</p>
        <p className="mt-1.5 max-w-2xl text-sm leading-6 text-[var(--it-muted)]">{copy.todayBody}</p>
      </div>
    </div>
  );
}
