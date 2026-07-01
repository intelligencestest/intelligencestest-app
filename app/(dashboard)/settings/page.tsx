"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import LanguageSwitcher from "@/components/LanguageSwitcher";

type AppLocale = "en" | "es";

export default function SettingsPage() {
  const t = useTranslations("settings");
  const currentLocale = useLocale() === "es" ? "es" : "en";
  const [saved, setSaved] = useState(false);
  const [language, setLanguage] = useState<AppLocale>(currentLocale);
  const [languageSaving, setLanguageSaving] = useState(false);
  const [languageMessage, setLanguageMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [notifications, setNotifications] = useState({
    candidateCompleted: true,
    candidateInvited: false,
    reportReady: true,
    weeklyDigest: true,
  });
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    company: "",
    role: "",
  });

  const handleSave = async () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const saveLanguage = async () => {
    setLanguageSaving(true);
    setLanguageMessage(null);

    try {
      const res = await fetch("/api/settings/language", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language }),
      });

      if (!res.ok) {
        setLanguageMessage({ type: "error", text: t("languageError") });
      } else {
        document.cookie = `lang=${language}; path=/; max-age=31536000; samesite=lax`;
        setLanguageMessage({ type: "success", text: t("languageSaved") });
      }
    } catch {
      setLanguageMessage({ type: "error", text: t("languageError") });
    }

    setLanguageSaving(false);
    window.setTimeout(() => setLanguageMessage(null), 2600);
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

      {/* Language preference */}
      <div className="premium-card rounded-xl p-6">
        <div className="mb-5 flex flex-col gap-4 border-b border-[#1E2240] pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-white">{t("languageTitle")}</h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">{t("languageDescription")}</p>
          </div>
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-[#1D4ED8]/30 bg-[#1D4ED8]/10 px-3 py-1 text-xs font-medium text-[#9BB8FF]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#6B9FFF]" />
            EN / ES
          </span>
        </div>

        <div className="grid gap-5 md:grid-cols-[1fr_220px] md:items-start">
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-[#1E2240] bg-[#07080F]/65 p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-600">{t("dashboardLanguage")}</p>
                <p className="mt-2 text-sm font-semibold text-white">{language === "es" ? "Español" : "English"}</p>
              </div>
              <div className="rounded-xl border border-[#1E2240] bg-[#07080F]/65 p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-600">{t("candidateLanguage")}</p>
                <p className="mt-2 text-sm font-semibold text-white">{language === "es" ? "Español" : "English"}</p>
              </div>
            </div>
            <p className="text-xs leading-5 text-slate-500">{t("languageNote")}</p>
          </div>

          <div className="space-y-3">
            <LanguageSwitcher
              variant="settings"
              showLabel={false}
              onLocaleChange={(locale) => setLanguage(locale)}
            />
            <button
              type="button"
              onClick={saveLanguage}
              disabled={languageSaving}
              className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#1D4ED8] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1e40af] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {languageSaving && (
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z" />
                </svg>
              )}
              {languageSaving ? t("savingLanguage") : t("saveLanguage")}
            </button>
            {languageMessage && (
              <div className={`rounded-xl border px-3 py-2 text-xs font-medium ${
                languageMessage.type === "success"
                  ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300"
                  : "border-red-500/25 bg-red-500/10 text-red-300"
              }`}>
                {languageMessage.text}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile section */}
      <div className="bg-[#0D1020] border border-[#1E2240] rounded-xl p-6 space-y-5">
        <h2 className="text-base font-semibold text-white border-b border-[#1E2240] pb-3">Account Profile</h2>

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#1D4ED8]/20 border-2 border-[#1D4ED8]/40 flex items-center justify-center text-xl font-bold text-[#6B9FFF]">
            {profile.name ? profile.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() : "?"}
          </div>
          <div>
            <p className="text-sm font-medium text-white">{profile.name || <span className="text-slate-500">Your name</span>}</p>
            <p className="text-xs text-slate-500 mt-0.5">{profile.email || "—"}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {[
            { key: "name", label: "Full Name", placeholder: "Your name" },
            { key: "email", label: "Email Address", placeholder: "you@company.com" },
            { key: "company", label: "Company", placeholder: "Company name" },
            { key: "role", label: "Job Title", placeholder: "e.g. Recruiter, Operations Manager" },
          ].map((field) => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-slate-300 mb-2">{field.label}</label>
              <input
                value={profile[field.key as keyof typeof profile]}
                onChange={(e) => setProfile((p) => ({ ...p, [field.key]: e.target.value }))}
                placeholder={field.placeholder}
                className="w-full px-4 py-3 rounded-lg bg-[#07080F] border border-[#1E2240] text-slate-100 placeholder-slate-600 focus:outline-none focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8] transition-colors text-sm"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-[#0D1020] border border-[#1E2240] rounded-xl p-6 space-y-4">
        <h2 className="text-base font-semibold text-white border-b border-[#1E2240] pb-3">Notification Preferences</h2>
        {[
          { key: "candidateCompleted", label: "Candidate completes assessment", desc: "Get notified when a candidate finishes their assessment" },
          { key: "candidateInvited", label: "Candidate accepts invitation", desc: "Notification when a candidate opens their invitation link" },
          { key: "reportReady", label: "Report is ready", desc: "Alert when a project report is generated and ready to review" },
          { key: "weeklyDigest", label: "Weekly digest", desc: "A summary of all hiring activity sent every Monday" },
        ].map((item) => (
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
        <div className="flex items-center justify-between border-b border-[#1E2240] pb-3 mb-4">
          <h2 className="text-base font-semibold text-white">Team Members</h2>
          <button className="text-xs text-[#6B9FFF] hover:text-blue-300 transition-colors font-medium">
            + Invite member
          </button>
        </div>
        <div className="space-y-3">
          {[
            { name: "HR Admin", email: "admin@company.com", role: "Owner", avatar: "HR", color: "bg-[#1D4ED8]/20 text-[#6B9FFF] border-[#1D4ED8]/30" },
            { name: "Sarah Kowalski", email: "s.kowalski@company.com", role: "Recruiter", avatar: "SK", color: "bg-violet-500/20 text-violet-400 border-violet-500/30" },
            { name: "David Park", email: "d.park@company.com", role: "Recruiter", avatar: "DP", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
          ].map((member) => (
            <div key={member.email} className="flex items-center gap-3 py-2">
              <div className={`w-9 h-9 rounded-full border flex items-center justify-center text-xs font-semibold flex-shrink-0 ${member.color}`}>
                {member.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{member.name}</p>
                <p className="text-xs text-slate-500">{member.email}</p>
              </div>
              <span className="text-xs bg-[#1E2240] text-slate-400 px-2.5 py-1 rounded-full">{member.role}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-[#0D1020] border border-red-500/20 rounded-xl p-6">
        <h2 className="text-base font-semibold text-red-400 mb-3">Danger Zone</h2>
        <p className="text-sm text-slate-500 mb-4">These actions are irreversible. Please proceed with caution.</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button className="px-4 py-2.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm font-medium transition-colors">
            Delete All Assessment Data
          </button>
          <button className="px-4 py-2.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm font-medium transition-colors">
            Close Account
          </button>
        </div>
      </div>

      {/* Save button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="px-6 py-2.5 rounded-lg bg-[#1D4ED8] hover:bg-[#1e40af] text-white text-sm font-semibold transition-colors"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
