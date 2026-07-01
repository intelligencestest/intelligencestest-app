"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";

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

const statusConfig: Record<string, { label: string; class: string; dot: string }> = {
  active: { label: "Active", class: "bg-emerald-500/10 text-emerald-300 border-emerald-500/25", dot: "bg-emerald-400" },
  draft: { label: "Draft", class: "bg-slate-500/10 text-slate-300 border-slate-500/25", dot: "bg-slate-400" },
  archived: { label: "Archived", class: "bg-amber-500/10 text-amber-300 border-amber-500/25", dot: "bg-amber-400" },
};

export default function ProjectsClient({ projects, countsByProject, projectAssessments, activeCount, totalCandidates }: Props) {
  const t = useTranslations("projects");

  const [inviteProjectId, setInviteProjectId] = useState<string | null>(null);
  const [form, setForm] = useState({ full_name: "", assessment_id: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const availableAssessments = inviteProjectId ? (projectAssessments[inviteProjectId] ?? []) : [];

  useEffect(() => {
    if (inviteProjectId) {
      const first = (projectAssessments[inviteProjectId] ?? [])[0];
      setForm({ full_name: "", assessment_id: first?.id ?? "" });
      setError("");
      setCopiedUrl(null);
    }
  }, [inviteProjectId, projectAssessments]);

  useEffect(() => {
    if (!inviteProjectId) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") closeModal(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [inviteProjectId]);

  const closeModal = () => {
    setInviteProjectId(null);
    setForm({ full_name: "", assessment_id: "" });
    setError("");
    setCopiedUrl(null);
    setLoading(false);
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const selectedAssessment = availableAssessments.find((a) => a.id === form.assessment_id);
    if (!selectedAssessment || !inviteProjectId) return;
    setLoading(true);

    try {
      const res = await fetch("/api/candidates/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: form.full_name,
          project_id: inviteProjectId,
          assessment_type: selectedAssessment.name,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to generate invite link");
      } else {
        const url = `${window.location.origin}${data.test_url}`;
        await navigator.clipboard.writeText(url);
        setCopiedUrl(url);
      }
    } catch {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#1E2240] bg-[#0D1020] px-3 py-1 text-xs font-medium text-[#9BB8FF]">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-soft-pulse" />
            {t("badge")}
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">{t("title")}</h1>
          <p className="text-slate-500 text-sm mt-1">
            {activeCount} active project{activeCount !== 1 ? "s" : ""} · {totalCandidates} candidate{totalCandidates !== 1 ? "s" : ""} in motion
          </p>
        </div>
        <Link
          href="/projects/new"
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#1D4ED8] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_14px_36px_rgba(29,78,216,0.22)] transition-colors hover:bg-[#1e40af]"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {t("newProject")}
        </Link>
      </div>

      {/* Empty state */}
      {projects.length === 0 ? (
        <div className="premium-card rounded-xl py-20 text-center">
          <svg className="w-12 h-12 mx-auto mb-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Zm0 0V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
          </svg>
          <h3 className="text-white font-medium mb-1">{t("noProjects")}</h3>
          <p className="text-slate-500 text-sm mb-6">{t("noProjectsDescription")}</p>
          <Link href="/projects/new" className="inline-flex items-center gap-2 rounded-xl bg-[#1D4ED8] px-4 py-2.5 text-sm font-semibold text-white">
            {t("createProject")}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {projects.map((project, index) => {
            const counts = countsByProject[project.id] ?? { total: 0, completed: 0 };
            const progress = counts.total > 0 ? Math.round((counts.completed / counts.total) * 100) : 0;
            const cfg = statusConfig[project.status] ?? statusConfig.draft;
            const hasAssessments = (projectAssessments[project.id] ?? []).length > 0;
            return (
              <div
                key={project.id}
                className="premium-card premium-card-hover group rounded-xl p-5 animate-fade-up"
                style={{ animationDelay: `${index * 55}ms` }}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-base font-semibold text-white group-hover:text-[#8CB1FF] transition-colors truncate">
                        {project.name}
                      </h3>
                      <span className={`inline-flex flex-shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${cfg.class}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-slate-600">
                      {t("createdPrefix")} {new Date(project.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-slate-500 leading-relaxed mb-4 line-clamp-2">
                  {project.description ?? "No description provided."}
                </p>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="rounded-xl border border-[#1E2240] bg-[#07080F]/55 p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-slate-600">{t("candidatesLabel")}</p>
                      <svg className="h-4 w-4 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M23 21v-2a4 4 0 0 0-3-3.87" />
                      </svg>
                    </div>
                    <p className="mt-2 text-2xl font-semibold text-white">{counts.total}</p>
                  </div>
                  <div className="rounded-xl border border-[#1E2240] bg-[#07080F]/55 p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-slate-600">{t("completedLabel")}</p>
                      <svg className="h-4 w-4 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                      </svg>
                    </div>
                    <p className="mt-2 text-2xl font-semibold text-white">{counts.completed}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-xs text-slate-600 mb-1.5">
                    <span>{t("completionLabel")}</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-[#1E2240] rounded-full overflow-hidden">
                    <div
                      className="h-2 bg-[#1D4ED8] rounded-full shadow-[0_0_16px_rgba(29,78,216,0.45)] transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3 border-t border-[#1E2240] pt-3 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
                  <span>
                    {project.deadline
                      ? `${t("deadlinePrefix")} ${new Date(project.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                      : t("noDeadline")}
                  </span>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      disabled={!hasAssessments}
                      onClick={() => setInviteProjectId(project.id)}
                      title={hasAssessments ? undefined : t("noAssessmentsLinked")}
                      className="inline-flex items-center gap-1 font-medium text-slate-400 transition-colors hover:text-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
                      </svg>
                      {t("inviteButton")}
                    </button>
                    <Link href={`/reports?project=${project.id}`} className="inline-flex items-center gap-1 font-medium text-[#8CB1FF] transition-colors hover:text-blue-200">
                      {t("viewReport")}
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m-6-6 6 6-6 6" />
                      </svg>
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
            className="premium-card w-full max-w-md rounded-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-white">{t("inviteTitle")}</h2>
                <p className="mt-0.5 text-xs text-slate-500">{t("inviteDescription")}</p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-[#1E2240] hover:text-white"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {copiedUrl ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/8 p-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/15">
                    <svg className="h-4 w-4 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-emerald-300">{t("linkCopied")}</p>
                    <p className="text-xs text-slate-500">{t("linkValid")}</p>
                  </div>
                </div>
                <div className="rounded-xl border border-[#1E2240] bg-[#07080F] p-3">
                  <p className="break-all font-mono text-xs text-blue-300">{copiedUrl}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const first = (projectAssessments[inviteProjectId] ?? [])[0];
                    setForm({ full_name: "", assessment_id: first?.id ?? "" });
                    setError("");
                    setCopiedUrl(null);
                  }}
                  className="w-full cursor-pointer rounded-xl border border-[#1E2240] py-2.5 text-sm font-medium text-slate-400 transition-colors hover:text-white"
                >
                  {t("inviteAnother")}
                </button>
              </div>
            ) : (
              <form onSubmit={handleInvite} className="space-y-4">
                {error && (
                  <div className="rounded-xl border border-red-500/25 bg-red-500/10 p-3 text-sm text-red-300">
                    {error}
                  </div>
                )}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-300">
                    {t("candidateName")}
                    <span className="ml-1.5 text-xs font-normal text-slate-500">(optional)</span>
                  </label>
                  <input
                    value={form.full_name}
                    onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                    placeholder="Jane Smith"
                    className="w-full rounded-xl border border-[#1E2240] bg-[#07080F] px-4 py-2.5 text-sm text-slate-100 outline-none placeholder:text-slate-600 transition-colors focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/25"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-300">{t("assessmentLabel")}</label>
                  <select
                    value={form.assessment_id}
                    onChange={(e) => setForm((f) => ({ ...f, assessment_id: e.target.value }))}
                    className="w-full cursor-pointer rounded-xl border border-[#1E2240] bg-[#07080F] px-4 py-2.5 text-sm text-slate-300 outline-none transition-colors focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/25"
                  >
                    {availableAssessments.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}{a.duration_minutes != null ? ` (${a.duration_minutes} min)` : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#1D4ED8] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1e40af] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z" />
                      </svg>
                      {t("generating")}
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
                      </svg>
                      {t("generateLink")}
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
