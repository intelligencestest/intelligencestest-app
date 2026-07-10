"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Check } from "lucide-react";

type CompanyState = {
  name: string;
  industry: string;
  logo_url: string;
  // Kept from the loaded profile, unedited here — the API requires full_name
  // and company_name together.
  fullName: string;
};

export default function CompanySettingsPage() {
  const t = useTranslations("settings");
  const es = useLocale() === "es";

  const copy = es
    ? {
        title: "Empresa",
        description: "Información de empresa visible en informes e invitaciones.",
        companyName: "Empresa",
        companyNamePlaceholder: "Nombre de la empresa",
        industry: "Industria",
        industryPlaceholder: "Ej. Reclutamiento, call center, consultoría",
        logoUrl: "URL del logo",
        logoUrlPlaceholder: "https://empresa.com/logo.png",
        logoPreview: "Logo de empresa",
        saveChanges: "Guardar cambios",
      }
    : {
        title: "Company",
        description: "Company details shown on reports and candidate invitations.",
        companyName: "Company",
        companyNamePlaceholder: "Company name",
        industry: "Industry",
        industryPlaceholder: "e.g. Recruitment, call center, consulting",
        logoUrl: "Logo URL",
        logoUrlPlaceholder: "https://company.com/logo.png",
        logoPreview: "Company logo",
        saveChanges: "Save changes",
      };

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [company, setCompany] = useState<CompanyState>({ name: "", industry: "", logo_url: "", fullName: "" });

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      try {
        const res = await fetch("/api/settings/profile");
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted) return;
        setCompany({
          name: data.company_name ?? "",
          industry: data.industry ?? "",
          logo_url: data.logo_url ?? "",
          fullName: data.full_name ?? "",
        });
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadProfile();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/settings/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: company.fullName,
          company_name: company.name,
          industry: company.industry,
          logo_url: company.logo_url,
        }),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.error || t("languageError"));
      }

      setSaved(true);
      setMessage({ type: "success", text: t("saved") });
      setTimeout(() => setSaved(false), 2500);
      setTimeout(() => setMessage(null), 2600);
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : t("languageError") });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1200px]">
      <div>
        <h1 className="text-[30px] font-semibold leading-[38px] tracking-[-0.01em] text-[var(--it-text)]">{t("title")}</h1>
        <p className="mt-2 text-sm text-[var(--it-muted)]">{t("description")}</p>
      </div>

      {saved && (
        <div className="mt-6 flex items-center gap-2 rounded-lg border border-[var(--it-success)]/30 bg-[rgba(22,163,74,0.08)] p-3 text-sm text-[#15803d]">
          <Check className="h-4 w-4 flex-shrink-0" strokeWidth={2} />
          {t("saved")}
        </div>
      )}

      <div className="mt-8">
          <div className="border-t border-[var(--it-hairline)] pt-4">
            <h2 className="text-lg font-semibold text-[var(--it-text)]">{copy.title}</h2>
            <p className="mt-1 text-sm text-[var(--it-muted)]">{copy.description}</p>
          </div>

          <div className="mt-5 grid gap-6 lg:grid-cols-[200px_1fr]">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-[var(--it-faint)]">{copy.logoPreview}</p>
              <div className="mt-3 flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border border-[var(--it-hairline)] bg-[var(--it-bg)]">
                {company.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={company.logo_url} alt="" className="h-full w-full object-contain p-3" />
                ) : (
                  <span className="text-2xl font-bold text-[var(--it-link)]">
                    {company.name ? company.name.slice(0, 2).toUpperCase() : "IT"}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">{copy.companyName}</label>
                <input
                  disabled={loading}
                  value={company.name}
                  onChange={(e) => setCompany((c) => ({ ...c, name: e.target.value }))}
                  placeholder={copy.companyNamePlaceholder}
                  className="w-full rounded-lg border border-[var(--it-hairline)] bg-[var(--it-bg)] px-4 py-3 text-sm text-slate-100 placeholder-[var(--it-faint)] transition-colors focus:border-[var(--it-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--it-primary)] disabled:cursor-wait disabled:opacity-60"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">{copy.industry}</label>
                <input
                  disabled={loading}
                  value={company.industry}
                  onChange={(e) => setCompany((c) => ({ ...c, industry: e.target.value }))}
                  placeholder={copy.industryPlaceholder}
                  className="w-full rounded-lg border border-[var(--it-hairline)] bg-[var(--it-bg)] px-4 py-3 text-sm text-slate-100 placeholder-[var(--it-faint)] transition-colors focus:border-[var(--it-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--it-primary)] disabled:cursor-wait disabled:opacity-60"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-300">{copy.logoUrl}</label>
                <input
                  disabled={loading}
                  value={company.logo_url}
                  onChange={(e) => setCompany((c) => ({ ...c, logo_url: e.target.value }))}
                  placeholder={copy.logoUrlPlaceholder}
                  className="w-full rounded-lg border border-[var(--it-hairline)] bg-[var(--it-bg)] px-4 py-3 text-sm text-slate-100 placeholder-[var(--it-faint)] transition-colors focus:border-[var(--it-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--it-primary)] disabled:cursor-wait disabled:opacity-60"
                />
              </div>
            </div>
          </div>

          {message && (
            <div
              className={`mt-4 max-w-sm rounded-xl border px-3 py-2 text-xs font-medium ${
                message.type === "success"
                  ? "border-[var(--it-success)]/30 bg-[rgba(22,163,74,0.08)] text-[#15803d]"
                  : "border-[var(--it-danger)]/30 bg-[rgba(220,38,38,0.08)] text-[#b91c1c]"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="enterprise-button rounded-lg px-6 py-2.5 text-sm font-semibold disabled:cursor-wait disabled:opacity-70"
            >
              {saving ? t("savingLanguage") : copy.saveChanges}
            </button>
          </div>
      </div>
    </div>
  );
}
