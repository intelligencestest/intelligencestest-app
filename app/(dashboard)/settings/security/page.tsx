"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { AlertTriangle, Check } from "lucide-react";
import { SettingsNav } from "@/components/settings/SettingsNav";
import { createClient } from "@/lib/supabase";

export default function SecuritySettingsPage() {
  const flow = useTranslations("authFlow");
  const locale = useLocale();
  const es = locale === "es";

  const copy = es
    ? {
        title: "Seguridad",
        description: "Contraseña y acciones sensibles de la cuenta.",
        resetLinkTitle: "Enlace de restablecimiento",
        resetLinkText: "Envíe un enlace seguro a su correo para crear una nueva contraseña.",
        sendResetLink: "Enviar enlace",
        sendingResetLink: "Enviando enlace...",
        resetLinkSent: "Enlace de restablecimiento enviado.",
        resetLinkError: "No se pudo enviar el enlace de restablecimiento.",
        changePasswordTitle: "Cambiar contraseña",
        changePasswordText: "Establezca una nueva contraseña directamente, sin salir de la sesión actual.",
        passwordChanged: "Contraseña actualizada correctamente.",
        dangerZone: "Zona de riesgo",
        dangerText: "Estas acciones son irreversibles. Proceda con cautela.",
        dangerComingSoon: "Próximamente",
        deleteData: "Eliminar todos los datos de evaluación",
        closeAccount: "Cerrar cuenta",
      }
    : {
        title: "Security",
        description: "Password and sensitive account actions.",
        resetLinkTitle: "Reset link",
        resetLinkText: "Send a secure link to your email to create a new password.",
        sendResetLink: "Send reset link",
        sendingResetLink: "Sending reset link...",
        resetLinkSent: "Password reset link sent.",
        resetLinkError: "Could not send password reset link.",
        changePasswordTitle: "Change password",
        changePasswordText: "Set a new password directly, without leaving your current session.",
        passwordChanged: "Password updated successfully.",
        dangerZone: "Danger zone",
        dangerText: "These actions are irreversible. Please proceed with caution.",
        dangerComingSoon: "Coming soon",
        deleteData: "Delete all assessment data",
        closeAccount: "Close account",
      };

  // -- Reset-link flow (unchanged behavior from the old single-page settings) --
  const [email, setEmail] = useState<string | null>(null);
  const [resetSaving, setResetSaving] = useState(false);
  const [resetMessage, setResetMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const sendPasswordReset = async () => {
    setResetSaving(true);
    setResetMessage(null);
    try {
      let toEmail = email;
      if (!toEmail) {
        const res = await fetch("/api/settings/profile");
        const data = res.ok ? await res.json() : null;
        toEmail = data?.email ?? null;
        setEmail(toEmail);
      }
      if (!toEmail) throw new Error(copy.resetLinkError);

      const res = await fetch("/api/auth/recovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: toEmail, language: es ? "es" : "en" }),
      });
      if (!res.ok) throw new Error(copy.resetLinkError);
      setResetMessage({ type: "success", text: copy.resetLinkSent });
    } catch {
      setResetMessage({ type: "error", text: copy.resetLinkError });
    } finally {
      setResetSaving(false);
      window.setTimeout(() => setResetMessage(null), 3000);
    }
  };

  // -- New: change password while logged in, reusing the same
  // supabase.auth.updateUser() call app/reset-password/page.tsx already uses. --
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [changeSaving, setChangeSaving] = useState(false);
  const [changeMessage, setChangeMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangeMessage(null);

    if (password !== confirm) {
      setChangeMessage({ type: "error", text: flow("passwordsDoNotMatch") });
      return;
    }
    if (password.length < 8) {
      setChangeMessage({ type: "error", text: flow("passwordTooShort") });
      return;
    }

    setChangeSaving(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setChangeSaving(false);

    if (error) {
      setChangeMessage({ type: "error", text: error.message || flow("passwordUpdateError") });
      return;
    }

    setPassword("");
    setConfirm("");
    setChangeMessage({ type: "success", text: copy.passwordChanged });
    window.setTimeout(() => setChangeMessage(null), 3000);
  };

  return (
    <div className="mx-auto max-w-[1200px]">
      <div>
        <h1 className="text-[30px] font-semibold leading-[38px] tracking-[-0.01em] text-[var(--it-text)]">{copy.title}</h1>
        <p className="mt-2 text-sm text-[var(--it-muted)]">{copy.description}</p>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)] lg:items-start">
        <SettingsNav />

        <div>
          {/* Change password */}
          <div className="border-t border-[var(--it-hairline)] pt-4">
            <h2 className="text-lg font-semibold text-[var(--it-text)]">{copy.changePasswordTitle}</h2>
            <p className="mt-1 text-sm leading-6 text-[var(--it-muted)]">{copy.changePasswordText}</p>

            <form onSubmit={handleChangePassword} className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">{flow("newPassword")}</label>
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={flow("passwordMinPlaceholder")}
                  className="w-full rounded-lg border border-[var(--it-hairline)] bg-[var(--it-bg)] px-4 py-3 text-sm text-slate-100 placeholder-[var(--it-faint)] transition-colors focus:border-[var(--it-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--it-primary)]"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">{flow("confirmNewPassword")}</label>
                <input
                  required
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder={flow("passwordRepeatPlaceholder")}
                  className="w-full rounded-lg border border-[var(--it-hairline)] bg-[var(--it-bg)] px-4 py-3 text-sm text-slate-100 placeholder-[var(--it-faint)] transition-colors focus:border-[var(--it-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--it-primary)]"
                />
              </div>

              {changeMessage && (
                <div
                  className={`sm:col-span-2 flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium ${
                    changeMessage.type === "success"
                      ? "border-[var(--it-success)]/30 bg-[rgba(22,163,74,0.08)] text-[#15803d]"
                      : "border-[var(--it-danger)]/30 bg-[rgba(220,38,38,0.08)] text-[#b91c1c]"
                  }`}
                >
                  {changeMessage.type === "success" ? (
                    <Check className="h-3.5 w-3.5 flex-shrink-0" strokeWidth={2} />
                  ) : (
                    <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" strokeWidth={2} />
                  )}
                  {changeMessage.text}
                </div>
              )}

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={changeSaving}
                  className="enterprise-button rounded-lg px-5 py-2.5 text-sm font-semibold disabled:cursor-wait disabled:opacity-70"
                >
                  {changeSaving ? flow("updating") : flow("updatePassword")}
                </button>
              </div>
            </form>
          </div>

          {/* Reset link (unchanged behavior) */}
          <div className="mt-10 border-t border-[var(--it-hairline)] pt-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[var(--it-text)]">{copy.resetLinkTitle}</h2>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-[var(--it-muted)]">{copy.resetLinkText}</p>
              </div>
              <button
                type="button"
                onClick={sendPasswordReset}
                disabled={resetSaving}
                className="enterprise-button-secondary flex-shrink-0 rounded-lg px-4 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
              >
                {resetSaving ? copy.sendingResetLink : copy.sendResetLink}
              </button>
            </div>
            {resetMessage && (
              <div
                className={`mt-4 max-w-sm rounded-xl border px-3 py-2 text-xs font-medium ${
                  resetMessage.type === "success"
                    ? "border-[var(--it-success)]/30 bg-[rgba(22,163,74,0.08)] text-[#15803d]"
                    : "border-[var(--it-danger)]/30 bg-[rgba(220,38,38,0.08)] text-[#b91c1c]"
                }`}
              >
                {resetMessage.text}
              </div>
            )}
          </div>

          {/* Danger zone — the one place a tinted, bordered container is warranted:
              it needs to read as a distinct, high-caution area, not a settings section. */}
          <div className="mt-10 rounded-xl border border-[var(--it-danger)]/25 bg-[rgba(220,38,38,0.04)] p-6">
            <h2 className="mb-3 text-base font-semibold text-[#b91c1c]">{copy.dangerZone}</h2>
            <p className="mb-4 text-sm text-[var(--it-muted)]">{copy.dangerText}</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                disabled
                title={copy.dangerComingSoon}
                className="cursor-not-allowed rounded-lg border border-[var(--it-danger)]/30 px-4 py-2.5 text-sm font-medium text-[#b91c1c] opacity-50"
              >
                {copy.deleteData} · {copy.dangerComingSoon}
              </button>
              <button
                type="button"
                disabled
                title={copy.dangerComingSoon}
                className="cursor-not-allowed rounded-lg border border-[var(--it-danger)]/30 px-4 py-2.5 text-sm font-medium text-[#b91c1c] opacity-50"
              >
                {copy.closeAccount} · {copy.dangerComingSoon}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
