"use client";

import { useLocale } from "next-intl";
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
    <div className="mx-auto max-w-[1200px]">
      <div>
        <h1 className="text-[28px] font-semibold leading-[34px] tracking-[-0.01em] text-white">{copy.title}</h1>
        <p className="mt-2 text-sm text-[var(--it-muted)]">{copy.description}</p>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)] lg:items-start">
        <SettingsNav />

        <div className="border-t border-[var(--it-hairline)] pt-4">
          <p className="text-sm font-medium text-slate-200">{copy.comingSoonTitle}</p>
          <p className="mt-1.5 max-w-md text-sm leading-6 text-[var(--it-muted)]">{copy.comingSoonBody}</p>
        </div>
      </div>
    </div>
  );
}
