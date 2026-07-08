"use client";

import { useLocale } from "next-intl";
import { Users } from "lucide-react";
import { SettingsNav } from "@/components/settings/SettingsNav";

export default function TeamSettingsPage() {
  const es = useLocale() === "es";

  const copy = es
    ? {
        title: "Equipo",
        description: "Miembros del equipo y acceso.",
        comingSoonTitle: "Próximamente",
        comingSoonBody:
          "La invitación y gestión de roles de miembros del equipo estará disponible próximamente. Por ahora, todos los usuarios del espacio de trabajo comparten acceso de administrador.",
      }
    : {
        title: "Team",
        description: "Team members and access.",
        comingSoonTitle: "Coming soon",
        comingSoonBody:
          "Team member invitations and role management are coming soon. For now, all workspace users share admin access.",
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
            <Users className="h-5 w-5 text-[var(--it-muted)]" strokeWidth={1.8} />
          </div>
          <p className="mt-4 text-sm font-medium text-slate-200">{copy.comingSoonTitle}</p>
          <p className="mx-auto mt-1.5 max-w-md text-sm leading-6 text-[var(--it-muted)]">{copy.comingSoonBody}</p>
        </div>
      </div>
    </div>
  );
}
