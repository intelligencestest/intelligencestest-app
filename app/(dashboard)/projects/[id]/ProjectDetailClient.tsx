"use client";

import { useState } from "react";

interface Assessment {
  id: string;
  name: string;
  route: string;
  duration_minutes: number | null;
  question_count: number | null;
}

interface Props {
  project: {
    id: string;
    name: string;
    status: string;
    description: string | null;
    deadline: string | null;
    created_at: string;
  };
  assessments: Assessment[];
  candidateCounts: { total: number; completed: number; invited: number };
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
      }}
      className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-[#1D4ED8]/40 px-3 py-1.5 text-xs font-medium text-[#A9C2FF] transition-colors hover:bg-[#1D4ED8]/10"
    >
      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2m-6 12h8a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-8a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2Z" />
      </svg>
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

const statusConfig: Record<string, { label: string; class: string; dot: string }> = {
  active: { label: "Active", class: "border-emerald-500/25 bg-emerald-500/10 text-emerald-300", dot: "bg-emerald-400" },
  draft: { label: "Draft", class: "border-slate-500/25 bg-slate-500/10 text-slate-300", dot: "bg-slate-400" },
  archived: { label: "Archived", class: "border-amber-500/25 bg-amber-500/10 text-amber-300", dot: "bg-amber-400" },
};

export default function ProjectDetailClient({ project, assessments, candidateCounts }: Props) {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    assessment_id: assessments[0]?.id ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ url: string; name: string } | null>(null);

  const selectedAssessment = assessments.find((a) => a.id === form.assessment_id);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!selectedAssessment) return;
    setLoading(true);

    try {
      const res = await fetch("/api/candidates/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: form.full_name,
          email: form.email,
          project_id: project.id,
          assessment_type: selectedAssessment.name,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to generate invite link");
      } else {
        setResult({
          url: `${window.location.origin}${data.test_url}`,
          name: form.full_name,
        });
      }
    } catch {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  };

  const resetForm = () => {
    setResult(null);
    setError("");
    setForm({ full_name: "", email: "", assessment_id: assessments[0]?.id ?? "" });
  };

  const cfg = statusConfig[project.status] ?? statusConfig.draft;
  const progress = candidateCounts.total > 0
    ? Math.round((candidateCounts.completed / candidateCounts.total) * 100)
    : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            Project created
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">{project.name}</h1>
          {project.description && (
            <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">{project.description}</p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${cfg.class}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
              {cfg.label}
            </span>
            <span className="text-xs text-slate-600">
              Created {new Date(project.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
            {project.deadline && (
              <span className="text-xs text-slate-600">
                Deadline {new Date(project.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Invited", value: candidateCounts.invited, color: "text-amber-300" },
          { label: "Completed", value: candidateCounts.completed, color: "text-emerald-300" },
          { label: "Progress", value: `${progress}%`, color: "text-blue-300" },
        ].map((stat) => (
          <div key={stat.label} className="premium-card rounded-xl p-4">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">{stat.label}</p>
            <p className={`mt-1.5 text-2xl font-semibold tracking-tight ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Assessments */}
        <div className="premium-card rounded-xl p-5">
          <div className="mb-4 flex items-center justify-between border-b border-[#1E2240] pb-4">
            <div>
              <h2 className="text-base font-semibold text-white">Assessment battery</h2>
              <p className="mt-0.5 text-xs text-slate-500">{assessments.length} test{assessments.length !== 1 ? "s" : ""} included in this project</p>
            </div>
            <span className="rounded-full border border-[#1E2240] bg-[#07080F] px-2.5 py-1 text-xs font-medium text-slate-400">
              {assessments.reduce((s, a) => s + (a.duration_minutes ?? 0), 0)} min total
            </span>
          </div>

          {assessments.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#1E2240] py-10 text-center">
              <p className="text-sm text-slate-500">No assessments linked to this project.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {assessments.map((assessment) => (
                <div
                  key={assessment.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-[#1E2240] bg-[#07080F]/55 px-4 py-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#1D4ED8]/30 bg-[#1D4ED8]/10 text-blue-300">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 4.5h6m-8.25 3h10.5m-12 3h13.5M7.5 21h9a2.25 2.25 0 0 0 2.25-2.25v-9A2.25 2.25 0 0 0 16.5 7.5h-9a2.25 2.25 0 0 0-2.25 2.25v9A2.25 2.25 0 0 0 7.5 21Z" />
                      </svg>
                    </div>
                    <p className="truncate text-sm font-medium text-slate-200">{assessment.name}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3 text-xs text-slate-500">
                    {assessment.duration_minutes != null && <span>{assessment.duration_minutes} min</span>}
                    {assessment.question_count != null && <span>{assessment.question_count} Q</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Invite panel */}
        <div className="premium-card rounded-xl p-5">
          <div className="mb-4 border-b border-[#1E2240] pb-4">
            <h2 className="text-base font-semibold text-white">Generate candidate link</h2>
            <p className="mt-0.5 text-xs text-slate-500">Create a secure, time-limited invite for one candidate.</p>
          </div>

          {result ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/8 p-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/15">
                  <svg className="h-4 w-4 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-emerald-300">Link ready for {result.name}</p>
                  <p className="text-xs text-slate-500">Valid for 7 days</p>
                </div>
              </div>

              <div className="rounded-xl border border-[#1E2240] bg-[#07080F] p-3">
                <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Invite link</p>
                <div className="flex items-center gap-2">
                  <p className="flex-1 break-all font-mono text-xs text-blue-300">{result.url}</p>
                  <CopyButton text={result.url} />
                </div>
              </div>

              <button
                type="button"
                onClick={resetForm}
                className="w-full cursor-pointer rounded-xl border border-[#1E2240] py-2.5 text-sm font-medium text-slate-400 transition-colors hover:text-white"
              >
                Generate another link
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
                  Candidate name <span className="text-red-400">*</span>
                </label>
                <input
                  required
                  value={form.full_name}
                  onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                  placeholder="Jane Smith"
                  className="w-full rounded-xl border border-[#1E2240] bg-[#07080F] px-4 py-2.5 text-sm text-slate-100 outline-none placeholder:text-slate-600 transition-colors focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/25"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">
                  Email address <span className="text-red-400">*</span>
                </label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="jane@example.com"
                  className="w-full rounded-xl border border-[#1E2240] bg-[#07080F] px-4 py-2.5 text-sm text-slate-100 outline-none placeholder:text-slate-600 transition-colors focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/25"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">Assessment</label>
                {assessments.length === 0 ? (
                  <p className="text-sm text-slate-500">No assessments in this project.</p>
                ) : (
                  <select
                    value={form.assessment_id}
                    onChange={(e) => setForm((f) => ({ ...f, assessment_id: e.target.value }))}
                    className="w-full cursor-pointer rounded-xl border border-[#1E2240] bg-[#07080F] px-4 py-2.5 text-sm text-slate-300 outline-none transition-colors focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/25"
                  >
                    {assessments.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}{a.duration_minutes != null ? ` (${a.duration_minutes} min)` : ""}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || assessments.length === 0}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#1D4ED8] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1e40af] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z" />
                    </svg>
                    Generating…
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
                    </svg>
                    Generate link
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
