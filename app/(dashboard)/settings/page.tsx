"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { SettingsNav } from "@/components/settings/SettingsNav";

type ProfileState = {
  name: string;
  email: string;
  company: string;
  industry: string;
  logo_url: string;
  role: string;
};

export default function SettingsPage() {
  const t = useTranslations("settings");
  const es = useLocale() === "es";

  const copy = es
    ? {
        profile: "Perfil de la cuenta",
        fullName: "Nombre completo",
        accountEmail: "Correo de acceso",
        accountRole: "Rol",
        notifications: "Preferencias de notificación",
        notificationItems: [
          { key: "candidateCompleted" as const, label: "El candidato completa una evaluación", desc: "Reciba una notificación cuando un candidato finalice su evaluación" },
          { key: "candidateInvited" as const, label: "El candidato abre la invitación", desc: "Notificación cuando un candidato abre su enlace de invitación" },
          { key: "reportReady" as const, label: "El informe está listo", desc: "Aviso cuando se genera un informe de proyecto y está listo para revisar" },
          { key: "weeklyDigest" as const, label: "Resumen semanal", desc: "Resumen de la actividad de evaluación enviado cada lunes" },
        ],
        saveChanges: "Guardar cambios",
      }
    : {
        profile: "Account profile",
        fullName: "Full name",
        accountEmail: "Login email",
        accountRole: "Role",
        notifications: "Notification preferences",
        notificationItems: [
          { key: "candidateCompleted" as const, label: "Candidate completes assessment", desc: "Get notified when a candidate finishes their assessment" },
          { key: "candidateInvited" as const, label: "Candidate accepts invitation", desc: "Notification when a candidate opens their invitation link" },
          { key: "reportReady" as const, label: "Report is ready", desc: "Alert when a project report is generated and ready to review" },
          { key: "weeklyDigest" as const, label: "Weekly digest", desc: "A summary of all assessment activity sent every Monday" },
        ],
        saveChanges: "Save changes",
      };

  const [saved, setSaved] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [notifications, setNotifications] = useState({
    candidateCompleted: true,
    candidateInvited: false,
    reportReady: true,
    weeklyDigest: true,
  });
  const [profile, setProfile] = useState<ProfileState>({
    name: "",
    email: "",
    company: "",
    industry: "",
    logo_url: "",
    role: "admin",
  });

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      try {
        const res = await fetch("/api/settings/profile");
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted) return;
        setProfile({
          name: data.full_name ?? "",
          email: data.email ?? "",
          company: data.company_name ?? "",
          industry: data.industry ?? "",
          logo_url: data.logo_url ?? "",
          role: data.role ?? "admin",
        });
      } finally {
        if (mounted) setProfileLoading(false);
      }
    }

    loadProfile();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSave = async () => {
    setProfileSaving(true);
    setProfileMessage(null);

    try {
      const res = await fetch("/api/settings/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: profile.name,
          // Company fields live on /settings/company but the API requires both
          // together — resend the loaded values unchanged.
          company_name: profile.company,
          industry: profile.industry,
          logo_url: profile.logo_url,
        }),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.error || t("languageError"));
      }

      setSaved(true);
      setProfileMessage({ type: "success", text: t("saved") });
      setTimeout(() => setSaved(false), 2500);
      setTimeout(() => setProfileMessage(null), 2600);
    } catch (error) {
      setProfileMessage({ type: "error", text: error instanceof Error ? error.message : t("languageError") });
    } finally {
      setProfileSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-[-0.01em] text-white">{t("title")}</h1>
        <p className="mt-1 text-sm text-[var(--it-muted)]">{t("description")}</p>
      </div>

      {saved && (
        <div className="flex items-center gap-2 rounded-lg border border-[var(--it-success)]/30 bg-[rgba(63,143,107,0.08)] p-3 text-sm text-[#91c7ad]">
          <Check className="h-4 w-4 flex-shrink-0" strokeWidth={2} />
          {t("saved")}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:items-start">
        <SettingsNav />

        <div className="space-y-6">
          {/* Language — fixed at signup */}
          <div className="enterprise-card rounded-xl p-6">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-base font-semibold text-white">{t("languageTitle")}</h2>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-[var(--it-muted)]">{t("languageLocked")}</p>
              </div>
              <span className="enterprise-chip-info inline-flex flex-shrink-0 items-center rounded-full px-3 py-1.5 text-sm font-semibold">
                {es ? "Español" : "English"}
              </span>
            </div>
          </div>

          {/* Profile */}
          <div className="enterprise-card rounded-xl p-6 space-y-6">
            <div className="border-b enterprise-divider pb-4">
              <h2 className="text-base font-semibold text-white">{copy.profile}</h2>
            </div>

            <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
              <div className="enterprise-panel rounded-xl p-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-[var(--it-primary)]/40 bg-[var(--it-primary-soft)] text-xl font-bold text-[#9fb3e5]">
                  {profile.name ? profile.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() : "?"}
                </div>
                <div className="mt-5 space-y-3 text-sm">
                  <div>
                    <p className="text-xs text-[var(--it-faint)]">{copy.accountEmail}</p>
                    <p className="mt-1 break-all font-medium text-slate-200">{profile.email || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--it-faint)]">{copy.accountRole}</p>
                    <p className="mt-1 font-medium capitalize text-slate-200">{profile.role || "admin"}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">{copy.fullName}</label>
                  <input
                    disabled={profileLoading}
                    value={profile.name}
                    onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                    className="w-full rounded-lg border border-[var(--it-border)] bg-[var(--it-bg)] px-4 py-3 text-sm text-slate-100 placeholder-[var(--it-faint)] transition-colors focus:border-[var(--it-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--it-primary)] disabled:cursor-wait disabled:opacity-60"
                  />
                </div>

                {profileMessage && (
                  <div
                    className={`rounded-xl border px-3 py-2 text-xs font-medium ${
                      profileMessage.type === "success"
                        ? "border-[var(--it-success)]/30 bg-[rgba(63,143,107,0.08)] text-[#91c7ad]"
                        : "border-[var(--it-danger)]/30 bg-[rgba(185,82,76,0.08)] text-[#d99792]"
                    }`}
                  >
                    {profileMessage.text}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div id="notifications" className="scroll-mt-28 enterprise-card rounded-xl p-6 space-y-4">
            <h2 className="border-b enterprise-divider pb-3 text-base font-semibold text-white">{copy.notifications}</h2>
            {copy.notificationItems.map((item) => (
              <div key={item.key} className="flex items-start justify-between gap-4 border-b enterprise-divider py-3 last:border-0 last:pb-0">
                <div>
                  <p className="text-sm font-medium text-slate-200">{item.label}</p>
                  <p className="mt-0.5 text-xs text-[var(--it-muted)]">{item.desc}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setNotifications((n) => ({ ...n, [item.key]: !n[item.key] }))}
                  className={`relative h-6 w-11 flex-shrink-0 rounded-full transition-colors ${
                    notifications[item.key] ? "bg-[var(--it-primary)]" : "bg-[var(--it-border)]"
                  }`}
                >
                  <div
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${
                      notifications[item.key] ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={profileSaving}
              className="enterprise-button rounded-lg px-6 py-2.5 text-sm font-semibold disabled:cursor-wait disabled:opacity-70"
            >
              {profileSaving ? t("savingLanguage") : copy.saveChanges}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
