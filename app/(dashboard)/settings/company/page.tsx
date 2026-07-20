"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Check, Upload } from "lucide-react";
import { toAppLocale, type AppLocale } from "@/lib/i18n/locales";
import {
  DEFAULT_REPORT_PRIMARY_COLOR,
  MAX_REPORT_FOOTER_TEXT_LENGTH,
} from "@/lib/security/company-branding";

type CompanyState = {
  name: string;
  industry: string;
  logo_url: string;
  primary_color: string;
  report_footer_text: string;
  // Kept from the loaded profile, unedited here — the API requires full_name
  // and company_name together.
  fullName: string;
};

const companyCopy: Record<AppLocale, {
  title: string;
  description: string;
  companyName: string;
  companyNamePlaceholder: string;
  industry: string;
  industryPlaceholder: string;
  logoPreview: string;
  uploadLogo: string;
  uploadingLogo: string;
  logoHelp: string;
  primaryColor: string;
  primaryColorHelp: string;
  reportFooter: string;
  reportFooterPlaceholder: string;
  reportFooterHelp: string;
  saveChanges: string;
}> = {
  es: {
    title: "Empresa",
    description: "Información de empresa visible en informes e invitaciones.",
    companyName: "Empresa",
    companyNamePlaceholder: "Nombre de la empresa",
    industry: "Industria",
    industryPlaceholder: "Ej. Reclutamiento, call center, consultoría",
    logoPreview: "Logo de empresa",
    uploadLogo: "Subir logo",
    uploadingLogo: "Subiendo…",
    logoHelp: "PNG, JPG, WEBP o GIF. Máximo 2 MB.",
    primaryColor: "Color principal del informe",
    primaryColorHelp: "Se usa en acentos, gráficos y elementos destacados del informe para clientes.",
    reportFooter: "Nota personalizada del pie de página",
    reportFooterPlaceholder: "Ej. Preparado de forma confidencial para uso exclusivo del cliente.",
    reportFooterHelp: "Opcional. Aparece en el pie de cada página del informe.",
    saveChanges: "Guardar cambios",
  },
  en: {
    title: "Company",
    description: "Company details shown on reports and candidate invitations.",
    companyName: "Company",
    companyNamePlaceholder: "Company name",
    industry: "Industry",
    industryPlaceholder: "e.g. Recruitment, call center, consulting",
    logoPreview: "Company logo",
    uploadLogo: "Upload logo",
    uploadingLogo: "Uploading…",
    logoHelp: "PNG, JPG, WEBP, or GIF. Maximum 2 MB.",
    primaryColor: "Report primary color",
    primaryColorHelp: "Used for accents, charts, and highlighted elements in client reports.",
    reportFooter: "Custom report footer note",
    reportFooterPlaceholder: "e.g. Prepared confidentially for the client's exclusive use.",
    reportFooterHelp: "Optional. Appears in the footer area on every report page.",
    saveChanges: "Save changes",
  },
  fr: {
    title: "Entreprise",
    description: "Informations d'entreprise visibles sur les rapports et les invitations aux candidats.",
    companyName: "Entreprise",
    companyNamePlaceholder: "Nom de l'entreprise",
    industry: "Secteur",
    industryPlaceholder: "Ex. Recrutement, centre d'appels, conseil",
    logoPreview: "Logo de l'entreprise",
    uploadLogo: "Importer le logo",
    uploadingLogo: "Importation…",
    logoHelp: "PNG, JPG, WEBP ou GIF. 2 Mo maximum.",
    primaryColor: "Couleur principale du rapport",
    primaryColorHelp: "Utilisée pour les accents, graphiques et éléments clés des rapports clients.",
    reportFooter: "Note personnalisée de pied de page",
    reportFooterPlaceholder: "Ex. Préparé confidentiellement pour l'usage exclusif du client.",
    reportFooterHelp: "Facultatif. Apparaît dans le pied de chaque page du rapport.",
    saveChanges: "Enregistrer les modifications",
  },
};

export default function CompanySettingsPage() {
  const t = useTranslations("settings");
  const copy = companyCopy[toAppLocale(useLocale())];

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [company, setCompany] = useState<CompanyState>({
    name: "",
    industry: "",
    logo_url: "",
    primary_color: DEFAULT_REPORT_PRIMARY_COLOR,
    report_footer_text: "",
    fullName: "",
  });

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
          primary_color: data.primary_color ?? DEFAULT_REPORT_PRIMARY_COLOR,
          report_footer_text: data.report_footer_text ?? "",
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
          primary_color: company.primary_color,
          report_footer_text: company.report_footer_text,
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

  const handleLogoUpload = async (file: File | undefined) => {
    if (!file) return;
    setUploadingLogo(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.set("logo", file);
      const res = await fetch("/api/settings/logo", { method: "POST", body: formData });
      const payload = await res.json().catch(() => null);
      if (!res.ok) throw new Error(payload?.error || t("languageError"));

      setCompany((current) => ({ ...current, logo_url: payload.logo_url ?? "" }));
      setMessage({ type: "success", text: t("saved") });
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : t("languageError") });
    } finally {
      setUploadingLogo(false);
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
              <label
                className={`mt-4 inline-flex items-center gap-2 rounded-lg border border-[var(--it-hairline)] bg-[var(--it-bg)] px-3 py-2 text-sm font-semibold text-slate-200 transition-colors hover:border-[var(--it-primary)] ${
                  loading || uploadingLogo ? "cursor-wait opacity-60" : "cursor-pointer"
                }`}
              >
                <Upload className="h-4 w-4" strokeWidth={2} />
                {uploadingLogo ? copy.uploadingLogo : copy.uploadLogo}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  disabled={loading || uploadingLogo}
                  className="sr-only"
                  onChange={(event) => {
                    const input = event.currentTarget;
                    void handleLogoUpload(input.files?.[0]).finally(() => {
                      input.value = "";
                    });
                  }}
                />
              </label>
              <p className="mt-2 max-w-[180px] text-xs leading-5 text-[var(--it-muted)]">{copy.logoHelp}</p>
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
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">{copy.primaryColor}</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    disabled={loading}
                    value={company.primary_color}
                    onChange={(event) => setCompany((current) => ({ ...current, primary_color: event.target.value.toUpperCase() }))}
                    className="h-12 w-16 cursor-pointer rounded-lg border border-[var(--it-hairline)] bg-[var(--it-bg)] p-1 disabled:cursor-wait disabled:opacity-60"
                    aria-label={copy.primaryColor}
                  />
                  <span className="font-mono text-sm font-medium text-slate-200">{company.primary_color}</span>
                </div>
                <p className="mt-2 text-xs leading-5 text-[var(--it-muted)]">{copy.primaryColorHelp}</p>
              </div>
              <div className="sm:col-span-2">
                <div className="mb-2 flex items-center justify-between gap-4">
                  <label className="block text-sm font-medium text-slate-300">{copy.reportFooter}</label>
                  <span className="text-xs tabular-nums text-[var(--it-faint)]">
                    {company.report_footer_text.length}/{MAX_REPORT_FOOTER_TEXT_LENGTH}
                  </span>
                </div>
                <textarea
                  disabled={loading}
                  value={company.report_footer_text}
                  onChange={(event) => setCompany((current) => ({ ...current, report_footer_text: event.target.value }))}
                  placeholder={copy.reportFooterPlaceholder}
                  maxLength={MAX_REPORT_FOOTER_TEXT_LENGTH}
                  rows={3}
                  className="w-full resize-y rounded-lg border border-[var(--it-hairline)] bg-[var(--it-bg)] px-4 py-3 text-sm leading-6 text-slate-100 placeholder-[var(--it-faint)] transition-colors focus:border-[var(--it-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--it-primary)] disabled:cursor-wait disabled:opacity-60"
                />
                <p className="mt-2 text-xs leading-5 text-[var(--it-muted)]">{copy.reportFooterHelp}</p>
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
