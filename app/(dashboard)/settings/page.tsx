"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";

type AppLocale = "en" | "es";
type ProfileState = {
  name: string;
  email: string;
  company: string;
  industry: string;
  logo_url: string;
  role: string;
};
type ProfileKey = keyof ProfileState;

interface PlanData {
  plan: string;
  planId: "trial" | "starter" | "professional" | "enterprise" | null;
  trialStatus: "active" | "expired" | "extended" | "converted";
  trialEndsAt: string | null;
  trialDaysLeft: number | null;
  isTrialExpired: boolean;
  subscriptionStatus: string;
  limits: { candidates: number | null; projects: number | null; recruiters: number | null };
  usage: { candidates: number; projects: number; recruiters: number };
  priceEur: number | null;
}

export default function SettingsPage() {
  const t = useTranslations("settings");
  const currentLocale = useLocale() === "es" ? "es" : "en";
  const es = currentLocale === "es";
  const copy = es
    ? {
        english: "Inglés",
        profile: "Perfil de la cuenta",
        companyInfo: "Información de empresa",
        yourName: "Su nombre",
        logoPreview: "Logo de empresa",
        fields: [
          { key: "name", label: "Nombre completo", placeholder: "Su nombre" },
          { key: "company", label: "Empresa", placeholder: "Nombre de la empresa" },
          { key: "industry", label: "Industria", placeholder: "Ej. Reclutamiento, call center, consultoría" },
          { key: "logo_url", label: "URL del logo", placeholder: "https://empresa.com/logo.png" },
        ],
        accountEmail: "Correo de acceso",
        accountRole: "Rol",
        password: "Contraseña",
        passwordText: "Envíe un enlace seguro para crear una nueva contraseña. No se muestra ni se almacena una contraseña en esta pantalla.",
        sendPasswordReset: "Enviar enlace de restablecimiento",
        sendingPasswordReset: "Enviando enlace...",
        passwordResetSent: "Enlace de restablecimiento enviado.",
        passwordResetError: "No se pudo enviar el enlace de restablecimiento.",
        billing: "Facturación",
        billingText: "La facturación se integrará más adelante. Por ahora, los planes se gestionan desde el panel interno.",
        planLabel: "Plan actual",
        priceMonthly: (amount: number) => `${amount} €/mes`,
        priceContact: "Contactar con ventas",
        trialEndsLabel: "Su prueba termina el",
        trialExpiredLabel: "Su prueba finalizó el",
        trialDaysLeft: (days: number) => (days === 1 ? "Queda 1 día de prueba" : `Quedan ${days} días de prueba`),
        usageLabel: "Uso este mes",
        usageCandidates: "Candidatos",
        usageProjects: "Proyectos activos",
        usageRecruiters: "Reclutadores",
        usageUnlimited: "sin límite",
        paymentMethodLabel: "Método de pago",
        paymentMethodValue: "Facturación manual · PayPal próximamente",
        contactSales: "Contactar con ventas",
        requestUpgrade: "Solicitar ampliación de plan",
        planLoading: "Cargando plan...",
        notifications: "Preferencias de notificación",
        notificationItems: [
          { key: "candidateCompleted", label: "El candidato completa una evaluación", desc: "Reciba una notificación cuando un candidato finalice su evaluación" },
          { key: "candidateInvited", label: "El candidato abre la invitación", desc: "Notificación cuando un candidato abre su enlace de invitación" },
          { key: "reportReady", label: "El informe está listo", desc: "Aviso cuando se genera un informe de proyecto y está listo para revisar" },
          { key: "weeklyDigest", label: "Resumen semanal", desc: "Resumen de la actividad de evaluación enviado cada lunes" },
        ],
        teamMembers: "Miembros del equipo",
        teamMembersComingSoon: "La invitación y gestión de roles de miembros del equipo estará disponible próximamente. Por ahora, todos los usuarios del espacio de trabajo comparten acceso de administrador.",
        dangerZone: "Zona de riesgo",
        dangerText: "Estas acciones son irreversibles. Proceda con cautela.",
        dangerComingSoon: "Próximamente",
        deleteData: "Eliminar todos los datos de evaluación",
        closeAccount: "Cerrar cuenta",
        saveChanges: "Guardar cambios",
      }
    : {
        english: "English",
        profile: "Account Profile",
        companyInfo: "Company information",
        yourName: "Your name",
        logoPreview: "Company logo",
        fields: [
          { key: "name", label: "Full Name", placeholder: "Your name" },
          { key: "company", label: "Company", placeholder: "Company name" },
          { key: "industry", label: "Industry", placeholder: "e.g. Recruitment, call center, consulting" },
          { key: "logo_url", label: "Logo URL", placeholder: "https://company.com/logo.png" },
        ],
        accountEmail: "Login email",
        accountRole: "Role",
        password: "Password",
        passwordText: "Send a secure link to create a new password. Passwords are never shown or stored on this screen.",
        sendPasswordReset: "Send reset link",
        sendingPasswordReset: "Sending reset link...",
        passwordResetSent: "Password reset link sent.",
        passwordResetError: "Could not send password reset link.",
        billing: "Billing",
        billingText: "Billing will be integrated later. For now, plans are managed from the internal admin panel.",
        planLabel: "Current plan",
        priceMonthly: (amount: number) => `€${amount}/month`,
        priceContact: "Contact sales",
        trialEndsLabel: "Your trial ends on",
        trialExpiredLabel: "Your trial ended on",
        trialDaysLeft: (days: number) => (days === 1 ? "1 day left in your trial" : `${days} days left in your trial`),
        usageLabel: "Usage this month",
        usageCandidates: "Candidates",
        usageProjects: "Active projects",
        usageRecruiters: "Recruiters",
        usageUnlimited: "unlimited",
        paymentMethodLabel: "Payment method",
        paymentMethodValue: "Manual billing · PayPal coming soon",
        contactSales: "Contact sales",
        requestUpgrade: "Request upgrade",
        planLoading: "Loading plan...",
        notifications: "Notification Preferences",
        notificationItems: [
          { key: "candidateCompleted", label: "Candidate completes assessment", desc: "Get notified when a candidate finishes their assessment" },
          { key: "candidateInvited", label: "Candidate accepts invitation", desc: "Notification when a candidate opens their invitation link" },
          { key: "reportReady", label: "Report is ready", desc: "Alert when a project report is generated and ready to review" },
          { key: "weeklyDigest", label: "Weekly digest", desc: "A summary of all assessment activity sent every Monday" },
        ],
        teamMembers: "Team Members",
        teamMembersComingSoon: "Team member invitations and role management are coming soon. For now, all workspace users share admin access.",
        dangerZone: "Danger Zone",
        dangerText: "These actions are irreversible. Please proceed with caution.",
        dangerComingSoon: "Coming soon",
        deleteData: "Delete All Assessment Data",
        closeAccount: "Close Account",
        saveChanges: "Save Changes",
      };
  const [saved, setSaved] = useState(false);
  // Workspace language is fixed at signup; settings no longer change it.
  const language: AppLocale = currentLocale;
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
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
  const [planData, setPlanData] = useState<PlanData | null>(null);
  const [planLoading, setPlanLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadPlan() {
      try {
        const res = await fetch("/api/settings/plan");
        if (!res.ok) return;
        const data = await res.json();
        if (mounted) setPlanData(data);
      } finally {
        if (mounted) setPlanLoading(false);
      }
    }

    loadPlan();
    return () => {
      mounted = false;
    };
  }, []);

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

  const sendPasswordReset = async () => {
    if (!profile.email) return;
    setPasswordSaving(true);
    setPasswordMessage(null);

    try {
      const res = await fetch("/api/auth/recovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: profile.email, language }),
      });

      if (!res.ok) throw new Error(copy.passwordResetError);
      setPasswordMessage({ type: "success", text: copy.passwordResetSent });
    } catch {
      setPasswordMessage({ type: "error", text: copy.passwordResetError });
    } finally {
      setPasswordSaving(false);
      window.setTimeout(() => setPasswordMessage(null), 3000);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">{t("title")}</h1>
        <p className="text-slate-500 text-sm mt-1">{t("description")}</p>
      </div>

      {saved && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {t("saved")}
        </div>
      )}

      {/* Language is a workspace property chosen at signup */}
      <div className="premium-card rounded-xl p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-white">{t("languageTitle")}</h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-400">{t("languageLocked")}</p>
          </div>
          <span className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-full border border-[#1D4ED8]/30 bg-[#1D4ED8]/10 px-3 py-1.5 text-sm font-semibold text-[#9BB8FF]">
            {language === "es" ? "Español" : "English"}
          </span>
        </div>
      </div>

      {/* Profile and company section */}
      <div className="bg-[#0D1020] border border-[#1E2240] rounded-xl p-6 space-y-6">
        <div className="border-b border-[#1E2240] pb-4">
          <h2 className="text-base font-semibold text-white">{copy.profile}</h2>
          <p className="mt-1 text-sm text-slate-500">{copy.companyInfo}</p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
          <div className="rounded-xl border border-[#1E2240] bg-[#07080F]/65 p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-600">{copy.logoPreview}</p>
            <div className="mt-4 flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border border-[#1E2240] bg-[#0D1020]">
              {profile.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.logo_url} alt="" className="h-full w-full object-contain p-3" />
              ) : (
                <span className="text-2xl font-bold text-[#6B9FFF]">
                  {profile.company ? profile.company.slice(0, 2).toUpperCase() : "IT"}
                </span>
              )}
            </div>
            <div className="mt-5 space-y-3 text-sm">
              <div>
                <p className="text-xs text-slate-600">{copy.accountEmail}</p>
                <p className="mt-1 break-all font-medium text-slate-200">{profile.email || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-600">{copy.accountRole}</p>
                <p className="mt-1 font-medium capitalize text-slate-200">{profile.role || "admin"}</p>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-[#1D4ED8]/20 border-2 border-[#1D4ED8]/40 flex items-center justify-center text-xl font-bold text-[#6B9FFF]">
                {profile.name ? profile.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() : "?"}
              </div>
              <div>
                <p className="text-sm font-medium text-white">{profile.name || <span className="text-slate-500">{copy.yourName}</span>}</p>
                <p className="text-xs text-slate-500 mt-0.5">{profile.company || "—"}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {copy.fields.map((field) => {
                const key = field.key as ProfileKey;
                return (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-slate-300 mb-2">{field.label}</label>
                    <input
                      disabled={profileLoading}
                      value={profile[key]}
                      onChange={(e) => setProfile((p) => ({ ...p, [key]: e.target.value }))}
                      placeholder={field.placeholder}
                      className="w-full px-4 py-3 rounded-lg bg-[#07080F] border border-[#1E2240] text-slate-100 placeholder-slate-600 focus:outline-none focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8] transition-colors text-sm disabled:cursor-wait disabled:opacity-60"
                    />
                  </div>
                );
              })}
            </div>

            {profileMessage && (
              <div className={`rounded-xl border px-3 py-2 text-xs font-medium ${
                profileMessage.type === "success"
                  ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300"
                  : "border-red-500/25 bg-red-500/10 text-red-300"
              }`}>
                {profileMessage.text}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Password */}
      <div className="bg-[#0D1020] border border-[#1E2240] rounded-xl p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">{copy.password}</h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">{copy.passwordText}</p>
          </div>
          <button
            type="button"
            onClick={sendPasswordReset}
            disabled={passwordSaving || !profile.email}
            className="inline-flex items-center justify-center rounded-xl border border-[#1E2240] bg-[#07080F] px-4 py-2.5 text-sm font-semibold text-slate-100 transition-colors hover:border-[#1D4ED8]/70 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {passwordSaving ? copy.sendingPasswordReset : copy.sendPasswordReset}
          </button>
        </div>
        {passwordMessage && (
          <div className={`mt-4 rounded-xl border px-3 py-2 text-xs font-medium ${
            passwordMessage.type === "success"
              ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300"
              : "border-red-500/25 bg-red-500/10 text-red-300"
          }`}>
            {passwordMessage.text}
          </div>
        )}
      </div>

      {/* Notifications */}
      <div className="bg-[#0D1020] border border-[#1E2240] rounded-xl p-6 space-y-4">
        <h2 className="text-base font-semibold text-white border-b border-[#1E2240] pb-3">{copy.notifications}</h2>
        {copy.notificationItems.map((item) => (
          <div key={item.key} className="flex items-start justify-between gap-4 py-3 border-b border-[#1E2240] last:border-0 last:pb-0">
            <div>
              <p className="text-sm font-medium text-slate-200">{item.label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
            </div>
            <button
              onClick={() => setNotifications((n) => ({ ...n, [item.key]: !n[item.key as keyof typeof n] }))}
              className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors ${
                notifications[item.key as keyof typeof notifications] ? "bg-[#1D4ED8]" : "bg-[#1E2240]"
              }`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                notifications[item.key as keyof typeof notifications] ? "translate-x-6" : "translate-x-1"
              }`} />
            </button>
          </div>
        ))}
      </div>

      {/* Team members */}
      <div className="bg-[#0D1020] border border-[#1E2240] rounded-xl p-6">
        <h2 className="text-base font-semibold text-white border-b border-[#1E2240] pb-3 mb-4">{copy.teamMembers}</h2>
        <p className="text-sm leading-6 text-slate-500">{copy.teamMembersComingSoon}</p>
      </div>

      {/* Billing / Plan */}
      <div className="bg-[#0D1020] border border-[#1E2240] rounded-xl p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1E2240] pb-4">
          <div>
            <h2 className="text-base font-semibold text-white">{copy.billing}</h2>
            <p className="mt-1 text-sm text-slate-500">{copy.billingText}</p>
          </div>
          {planData && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#1D4ED8]/30 bg-[#1D4ED8]/10 px-3 py-1.5 text-sm font-semibold capitalize text-[#9BB8FF]">
              {planData.plan}
            </span>
          )}
        </div>

        {planLoading ? (
          <p className="text-sm text-slate-500">{copy.planLoading}</p>
        ) : planData ? (
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-600">{copy.planLabel}</p>
                <p className="mt-1 text-sm font-medium text-slate-200">
                  {planData.priceEur !== null ? copy.priceMonthly(planData.priceEur) : copy.priceContact}
                </p>
              </div>
              {planData.planId === "trial" && planData.trialEndsAt && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-600">
                    {planData.isTrialExpired ? copy.trialExpiredLabel : copy.trialEndsLabel}
                  </p>
                  <p className={`mt-1 text-sm font-medium ${planData.isTrialExpired ? "text-red-400" : "text-slate-200"}`}>
                    {new Date(planData.trialEndsAt).toLocaleDateString(es ? "es-ES" : "en-US", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                    {!planData.isTrialExpired && planData.trialDaysLeft !== null
                      ? ` · ${copy.trialDaysLeft(planData.trialDaysLeft)}`
                      : ""}
                  </p>
                </div>
              )}
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-slate-600">{copy.usageLabel}</p>
              <div className="mt-2 grid gap-3 sm:grid-cols-3">
                {(
                  [
                    ["usageCandidates", planData.usage.candidates, planData.limits.candidates],
                    ["usageProjects", planData.usage.projects, planData.limits.projects],
                    ["usageRecruiters", planData.usage.recruiters, planData.limits.recruiters],
                  ] as const
                ).map(([key, used, limit]) => (
                  <div key={key} className="rounded-lg border border-[#1E2240] bg-[#07080F]/60 px-3 py-2.5">
                    <p className="text-xs text-slate-500">{copy[key]}</p>
                    <p className="mt-0.5 text-sm font-semibold text-slate-100">
                      {used}
                      <span className="font-normal text-slate-500">/{limit ?? copy.usageUnlimited}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#1E2240] bg-[#07080F]/60 px-4 py-3">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-600">{copy.paymentMethodLabel}</p>
                <p className="mt-1 text-sm text-slate-300">{copy.paymentMethodValue}</p>
              </div>
              <a
                href="/contact"
                className="flex-shrink-0 rounded-lg bg-[#1D4ED8] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1e40af]"
              >
                {planData.planId === "trial" ? copy.contactSales : copy.requestUpgrade}
              </a>
            </div>
          </div>
        ) : null}
      </div>

      {/* Danger zone */}
      <div className="bg-[#0D1020] border border-red-500/20 rounded-xl p-6">
        <h2 className="text-base font-semibold text-red-400 mb-3">{copy.dangerZone}</h2>
        <p className="text-sm text-slate-500 mb-4">{copy.dangerText}</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            disabled
            title={copy.dangerComingSoon}
            className="px-4 py-2.5 rounded-lg border border-red-500/30 text-red-400 text-sm font-medium cursor-not-allowed opacity-50"
          >
            {copy.deleteData} · {copy.dangerComingSoon}
          </button>
          <button
            type="button"
            disabled
            title={copy.dangerComingSoon}
            className="px-4 py-2.5 rounded-lg border border-red-500/30 text-red-400 text-sm font-medium cursor-not-allowed opacity-50"
          >
            {copy.closeAccount} · {copy.dangerComingSoon}
          </button>
        </div>
      </div>

      {/* Save button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={profileSaving}
          className="px-6 py-2.5 rounded-lg bg-[#1D4ED8] hover:bg-[#1e40af] text-white text-sm font-semibold transition-colors disabled:cursor-wait disabled:opacity-70"
        >
          {profileSaving ? t("savingLanguage") : copy.saveChanges}
        </button>
      </div>
    </div>
  );
}
