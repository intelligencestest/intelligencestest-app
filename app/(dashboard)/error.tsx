"use client";

import { useLocale } from "next-intl";
import Link from "next/link";

/**
 * Error boundary for the authenticated app. Calm, honest, recoverable:
 * one sentence, a retry, and a support path — no stack traces, no drama.
 */
export default function DashboardError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const es = useLocale() === "es";
  const copy = es
    ? {
        title: "No se ha podido cargar esta pantalla.",
        body: "Ha ocurrido un error inesperado. Puede reintentarlo; si persiste, nuestro equipo puede ayudarle.",
        retry: "Reintentar",
        support: "Contactar con soporte",
      }
    : {
        title: "This screen could not be loaded.",
        body: "An unexpected error occurred. You can retry; if it persists, our team can help.",
        retry: "Retry",
        support: "Contact support",
      };

  return (
    <div className="mx-auto max-w-[1200px] py-8">
      <p className="text-lg font-semibold text-[var(--it-text)]">{copy.title}</p>
      <p className="mt-2 max-w-md text-sm leading-6 text-[var(--it-muted)]">{copy.body}</p>
      <div className="mt-6 flex items-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="enterprise-button cursor-pointer rounded-lg px-4 py-2.5 text-sm font-semibold"
        >
          {copy.retry}
        </button>
        <Link
          href={es ? "/es/contact" : "/contact"}
          className="enterprise-button-secondary rounded-lg px-4 py-2.5 text-sm font-medium"
        >
          {copy.support}
        </Link>
      </div>
    </div>
  );
}
