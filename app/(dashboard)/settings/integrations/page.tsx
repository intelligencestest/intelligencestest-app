"use client";

import { useLocale } from "next-intl";
import { Plug } from "lucide-react";
import { SettingsNav } from "@/components/settings/SettingsNav";

export default function IntegrationsSettingsPage() {
  const es = useLocale() === "es";

  const copy = es
    ? {
        title: "Integraciones",
        description: "Conexiones con otras herramientas.",
        comingSoonTitle: "Próximamente",
        comingSoonBody:
          "Las integraciones con ATS, Slack y otras herramientas de selección estarán disponibles próximamente.",
      }
    : {
        title: "Integrations",
        description: "Connections to other tools.",
        comingSoonTitle: "Coming soon",
        comingSoonBody: "Integrations with ATS, Slack, and other hiring tools are coming soon.",
      };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-[-0.01em] text-white">{copy.title}</h1>
        <p className="mt-1 text-sm text-[var(--it-muted)]">{copy.description}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:items-start">
        <SettingsNav />

        <div className="enterprise-card rounded-xl p-10 text-center">
          <div className="enterprise-panel mx-auto flex h-12 w-12 items-center justify-center rounded-full">
            <Plug className="h-5 w-5 text-[var(--it-muted)]" strokeWidth={1.8} />
          </div>
          <p className="mt-4 text-sm font-medium text-slate-200">{copy.comingSoonTitle}</p>
          <p className="mx-auto mt-1.5 max-w-md text-sm leading-6 text-[var(--it-muted)]">{copy.comingSoonBody}</p>
        </div>
      </div>
    </div>
  );
}
