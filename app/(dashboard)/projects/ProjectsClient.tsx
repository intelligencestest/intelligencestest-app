"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight, Check, CheckCircle2, Link2, Loader2, Mail, Plus, Users, X } from "lucide-react";
import { assessmentName as termName } from "@/lib/i18n/assessment-terms";

interface Assessment {
  id: string;
  name: string;
  duration_minutes: number | null;
}

interface Project {
  id: string;
  name: string;
  status: string;
  description: string | null;
  deadline: string | null;
  created_at: string;
}

interface Props {
  projects: Project[];
  countsByProject: Record<string, { total: number; completed: number }>;
  projectAssessments: Record<string, Assessment[]>;
  activeCount: number;
  totalCandidates: number;
}

type LoadingMode = "link" | "email" | null;
type SuccessState =
  | { type: "link"; url: string }
  | { type: "email"; to: string };

const statusConfig: Record<string, { class: string; dot: string }> = {
  active: { class: "border-[var(--it-success)]/25 bg-[rgba(79,132,103,0.1)] text-[#a9c8b4]", dot: "bg-[var(--it-success)]" },
  draft: { class: "border-[var(--it-hairline)] bg-white/[0.03] text-[var(--it-muted)]", dot: "bg-[var(--it-faint)]" },
  archived: { class: "border-[var(--it-warning)]/25 bg-[rgba(168,135,61,0.1)] text-[#cdb584]", dot: "bg-[var(--it-warning)]" },
};

export default function ProjectsClient({ projects, countsByProject, projectAssessments, activeCount, totalCandidates }: Props) {
  const t = useTranslations("projects");
  const locale = useLocale();
  const dateLocale = locale === "es" ? "es-ES" : "en-US";

  const [inviteProjectId, setInviteProjectId] = useState<string | null>(null);
  const [form, setForm] = useState({ full_name: "", email: "", assessment_id: "" });
  const [loadingMode, setLoadingMode] = useState<LoadingMode>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<SuccessState | null>(null);

  const availableAssessments = inviteProjectId ? (projectAssessments[inviteProjectId] ?? []) : [];

  const closeModal = () => {
    setInviteProjectId(null);
    setForm({ full_name: "", email: "", assessment_id: "" });
    setError("");
    setSuccess(null);
    setLoadingMode(null);
  };

  const openModal = (projectId: string) => {
    const first = (projectAssessments[projectId] ?? [])[0];
    setInviteProjectId(projectId);
    setForm({ full_name: "", email: "", assessment_id: first?.id ?? "" });
    setError("");
    setSuccess(null);
  };

  useEffect(() => {
    if (!inviteProjectId) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") closeModal(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [inviteProjectId]);

  const resetForm = () => {
    const first = inviteProjectId ? (projectAssessments[inviteProjectId] ?? [])[0] : undefined;
    setForm({ full_name: "", email: "", assessment_id: first?.id ?? "" });
    setError("");
    setSuccess(null);
  };

  const handleInvite = async (mode: "link" | "email") => {
    setError("");
    const selectedAssessment = availableAssessments.find((a) => a.id === form.assessment_id);
    if (!selectedAssessment || !inviteProjectId) return;

    if (mode === "email") {
      if (!form.email || !form.email.includes("@")) {
        setError(t("emailRequired"));
        return;
      }
    }

    setLoadingMode(mode);

    try {
      const res = await fetch("/api/candidates/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: form.full_name,
          email: form.email,
          project_id: inviteProjectId,
          assessment_type: selectedAssessment.name,
          delivery_method: mode,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? t("inviteError"));
      } else if (mode === "link") {
        const url = `${window.location.origin}${data.test_url}`;
        await navigator.clipboard.writeText(url).catch(() => {});
        setSuccess({ type: "link", url });
      } else {
        setSuccess({ type: "email", to: form.email });
      }
    } catch {
      setError(t("networkError"));
    }

    setLoadingMode(null);
  };

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[28px] font-semibold leading-[34px] tracking-[-0.01em] text-white">{t("title")}</h1>
          <p className="mt-2 text-sm text-[var(--it-muted)]">{t("summary", { activeCount, totalCandidates })}</p>
        </div>
        <Link
          href="/projects/new"
          className="enterprise-button inline-flex cursor-pointer items-center gap-2 self-start rounded-xl px-4 py-2.5 text-sm font-semibold sm:self-auto"
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          {t("newProject")}
        </Link>
      </div>

      {/* Empty state */}
      {projects.length === 0 ? (
        <div className="border-t border-[var(--it-hairline)] pt-10">
          <p className="text-sm font-medium text-slate-200">{t("noProjects")}</p>
          <p className="mt-1 text-sm text-[var(--it-muted)]">{t("noProjectsDescription")}</p>
          <Link href="/projects/new" className="enterprise-button mt-4 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold">
            {t("createProject")}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {projects.map((project) => {
            const counts = countsByProject[project.id] ?? { total: 0, completed: 0 };
            const progress = counts.total > 0 ? Math.round((counts.completed / counts.total) * 100) : 0;
            const cfg = statusConfig[project.status] ?? statusConfig.draft;
            const hasAssessments = (projectAssessments[project.id] ?? []).length > 0;
            return (
              <div key={project.id} className="enterprise-card enterprise-card-hover group rounded-xl p-5">
                <div className="min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="truncate text-base font-semibold text-white transition-colors group-hover:text-[var(--it-link)]">
                      {project.name}
                    </h3>
                    <span className={`inline-flex flex-shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${cfg.class}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                      {t(project.status === "active" ? "statusActive" : project.status === "archived" ? "statusArchived" : "statusDraft")}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-[var(--it-faint)]">
                    {t("createdPrefix")} {new Date(project.created_at).toLocaleDateString(dateLocale, { month: "short", day: "numeric" })}
                  </p>
                </div>

                <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-[var(--it-muted)]">
                  {project.description ?? t("noDescription")}
                </p>

                <div className="mt-4 flex items-center gap-6">
                  <div className="flex items-baseline gap-1.5">
                    <Users className="h-3.5 w-3.5 text-[var(--it-faint)]" strokeWidth={1.8} aria-hidden="true" />
                    <span className="text-lg font-semibold text-white">{counts.total}</span>
                    <span className="text-xs text-[var(--it-faint)]">{t("candidatesLabel")}</span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[var(--it-faint)]" strokeWidth={1.8} aria-hidden="true" />
                    <span className="text-lg font-semibold text-white">{counts.completed}</span>
                    <span className="text-xs text-[var(--it-faint)]">{t("completedLabel")}</span>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="mb-1.5 flex justify-between text-xs text-[var(--it-faint)]">
                    <span>{t("completionLabel")}</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className="h-full rounded-full bg-[var(--it-primary)] transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-3 border-t border-[var(--it-hairline)] pt-3 text-xs text-[var(--it-faint)] sm:flex-row sm:items-center sm:justify-between">
                  <span>
                    {project.deadline
                      ? `${t("deadlinePrefix")} ${new Date(project.deadline).toLocaleDateString(dateLocale, { month: "short", day: "numeric" })}`
                      : t("noDeadline")}
                  </span>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      disabled={!hasAssessments}
                      onClick={() => openModal(project.id)}
                      title={hasAssessments ? undefined : t("noAssessmentsLinked")}
                      className="inline-flex items-center gap-1.5 font-medium text-[var(--it-muted)] transition-colors hover:text-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Link2 className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
                      {t("inviteButton")}
                    </button>
                    <Link href={`/reports?project=${project.id}`} className="enterprise-link inline-flex items-center gap-1 font-medium">
                      {t("viewReport")}
                      <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Invite modal */}
      {inviteProjectId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="enterprise-card w-full max-w-md rounded-2xl p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-white">{t("inviteTitle")}</h2>
                <p className="mt-0.5 text-xs text-[var(--it-muted)]">{t("inviteDescription")}</p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-lg text-[var(--it-muted)] transition-colors hover:bg-white/[0.05] hover:text-white"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>

            {success ? (
              <div className="space-y-4">
                {success.type === "link" ? (
                  <>
                    <div className="flex items-center gap-3 rounded-xl border border-[var(--it-success)]/25 bg-[rgba(79,132,103,0.08)] p-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgba(79,132,103,0.15)]">
                        <Check className="h-4 w-4 text-[#a9c8b4]" strokeWidth={2} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#a9c8b4]">{t("linkCopied")}</p>
                        <p className="text-xs text-[var(--it-muted)]">{t("linkValid")}</p>
                      </div>
                    </div>
                    <div className="rounded-xl border border-[var(--it-hairline)] bg-[var(--it-bg)] p-3">
                      <p className="break-all font-mono text-xs text-[var(--it-link)]">{success.url}</p>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-3 rounded-xl border border-[var(--it-success)]/25 bg-[rgba(79,132,103,0.08)] p-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgba(79,132,103,0.15)]">
                      <Mail className="h-4 w-4 text-[#a9c8b4]" strokeWidth={2} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#a9c8b4]">{t("emailSent")}</p>
                      <p className="truncate text-xs text-[var(--it-muted)]">{success.to}</p>
                    </div>
                  </div>
                )}
                <button
                  type="button"
                  onClick={resetForm}
                  className="w-full cursor-pointer rounded-xl border border-[var(--it-hairline)] py-2.5 text-sm font-medium text-[var(--it-muted)] transition-colors hover:text-white"
                >
                  {t("inviteAnother")}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {error && (
                  <div className="rounded-xl border border-[var(--it-danger)]/25 bg-[rgba(166,91,80,0.1)] p-3 text-sm text-[#cfa097]">
                    {error}
                  </div>
                )}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-300">
                    {t("candidateName")}
                    <span className="ml-1.5 text-xs font-normal text-[var(--it-faint)]">({t("optional")})</span>
                  </label>
                  <input
                    value={form.full_name}
                    onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                    placeholder={locale === "es" ? "María García" : "Jane Smith"}
                    className="w-full rounded-xl border border-[var(--it-hairline)] bg-[var(--it-bg)] px-4 py-2.5 text-sm text-slate-100 outline-none placeholder:text-[var(--it-faint)] transition-colors focus:border-[var(--it-primary)] focus:ring-2 focus:ring-[var(--it-primary)]/25"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-300">
                    {t("emailAddress")}
                    <span className="ml-1.5 text-xs font-normal text-[var(--it-faint)]">{t("emailOptionalHint")}</span>
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder={locale === "es" ? "maria@ejemplo.com" : "jane@example.com"}
                    className="w-full rounded-xl border border-[var(--it-hairline)] bg-[var(--it-bg)] px-4 py-2.5 text-sm text-slate-100 outline-none placeholder:text-[var(--it-faint)] transition-colors focus:border-[var(--it-primary)] focus:ring-2 focus:ring-[var(--it-primary)]/25"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-300">{t("assessmentLabel")}</label>
                  <select
                    value={form.assessment_id}
                    onChange={(e) => setForm((f) => ({ ...f, assessment_id: e.target.value }))}
                    className="w-full cursor-pointer rounded-xl border border-[var(--it-hairline)] bg-[var(--it-bg)] px-4 py-2.5 text-sm text-slate-300 outline-none transition-colors focus:border-[var(--it-primary)] focus:ring-2 focus:ring-[var(--it-primary)]/25"
                  >
                    {availableAssessments.map((a) => (
                      <option key={a.id} value={a.id}>
                        {termName(a.name, locale)}{a.duration_minutes != null ? ` (${a.duration_minutes} min)` : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    disabled={loadingMode !== null}
                    onClick={() => handleInvite("link")}
                    className="enterprise-button-secondary flex cursor-pointer items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loadingMode === "link" ? (
                      <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
                    ) : (
                      <Link2 className="h-4 w-4" strokeWidth={2} />
                    )}
                    {loadingMode === "link" ? t("generating") : t("copyLink")}
                  </button>
                  <button
                    type="button"
                    disabled={loadingMode !== null}
                    onClick={() => handleInvite("email")}
                    className="enterprise-button flex cursor-pointer items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loadingMode === "email" ? (
                      <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
                    ) : (
                      <Mail className="h-4 w-4" strokeWidth={2} />
                    )}
                    {loadingMode === "email" ? t("sendingEmail") : t("sendEmail")}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
