"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Assessment {
  id: string;
  name: string;
  route: string;
  duration_minutes: number | null;
  question_count: number | null;
}

interface LibraryAssessment {
  id: string;
  name: string;
  category: string;
  duration_minutes: number | null;
  question_count: number | null;
}

interface ProjectCandidate {
  id: string;
  full_name: string;
  status: string;
  created_at: string;
  results: { id: string; score: number; completed_at: string }[];
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
  candidates: ProjectCandidate[];
  allAssessments: LibraryAssessment[];
}

type LoadingMode = "link" | "email" | null;
type InviteSuccess =
  | { type: "link"; url: string }
  | { type: "email"; to: string };

interface EditForm {
  name: string;
  description: string;
  deadline: string;
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

const projectStatusConfig: Record<string, { label: string; class: string; dot: string }> = {
  active: { label: "Active", class: "border-emerald-500/25 bg-emerald-500/10 text-emerald-300", dot: "bg-emerald-400" },
  draft: { label: "Draft", class: "border-slate-500/25 bg-slate-500/10 text-slate-300", dot: "bg-slate-400" },
  archived: { label: "Archived", class: "border-amber-500/25 bg-amber-500/10 text-amber-300", dot: "bg-amber-400" },
};

const candidateStatusConfig: Record<string, { label: string; class: string }> = {
  invited: { label: "Invited", class: "border-amber-500/25 bg-amber-500/10 text-amber-300" },
  started: { label: "Started", class: "border-blue-500/25 bg-blue-500/10 text-blue-300" },
  completed: { label: "Completed", class: "border-emerald-500/25 bg-emerald-500/10 text-emerald-300" },
};

const avatarColors = [
  "bg-blue-500/20 text-blue-300 border-blue-500/30",
  "bg-violet-500/20 text-violet-300 border-violet-500/30",
  "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  "bg-amber-500/20 text-amber-300 border-amber-500/30",
  "bg-pink-500/20 text-pink-300 border-pink-500/30",
  "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
];

export default function ProjectDetailClient({ project, assessments, candidates, allAssessments }: Props) {
  const router = useRouter();

  // Invite state
  const [inviteForm, setInviteForm] = useState({ full_name: "", email: "", assessment_id: assessments[0]?.id ?? "" });
  const [inviteLoadingMode, setInviteLoadingMode] = useState<LoadingMode>(null);
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState<InviteSuccess | null>(null);

  // Add assessment state
  const [addOpen, setAddOpen] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);

  // Edit project state
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<EditForm>({
    name: project.name,
    description: project.description ?? "",
    deadline: project.deadline ? project.deadline.slice(0, 10) : "",
  });
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");

  // Sync invite form assessment when assessments prop changes (after router.refresh)
  useEffect(() => {
    setInviteForm((f) => ({
      ...f,
      assessment_id: f.assessment_id || (assessments[0]?.id ?? ""),
    }));
  }, [assessments]);

  useEffect(() => {
    if (!addOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setAddOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [addOpen]);

  useEffect(() => {
    if (!editOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setEditOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [editOpen]);

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError("");
    if (!editForm.name.trim()) { setEditError("Project name is required"); return; }
    setEditSaving(true);
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name,
          description: editForm.description,
          deadline: editForm.deadline,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setEditError(data.error ?? "Failed to save changes");
      } else {
        setEditOpen(false);
        router.refresh();
      }
    } catch {
      setEditError("Network error. Please try again.");
    }
    setEditSaving(false);
  };

  const linkedIds = new Set(assessments.map((a) => a.id));

  const handleAddAssessment = async (assessmentId: string) => {
    setAddingId(assessmentId);
    try {
      const res = await fetch(`/api/projects/${project.id}/assessments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessment_id: assessmentId }),
      });
      if (res.ok) {
        router.refresh();
        setTimeout(() => setAddOpen(false), 400);
      }
    } catch {}
    setAddingId(null);
  };

  const handleInvite = async (mode: "link" | "email") => {
    setInviteError("");
    const selected = assessments.find((a) => a.id === inviteForm.assessment_id);
    if (!selected) return;

    if (mode === "email") {
      if (!inviteForm.email || !inviteForm.email.includes("@")) {
        setInviteError("A valid email address is required to send an invite.");
        return;
      }
    }

    setInviteLoadingMode(mode);

    try {
      const res = await fetch("/api/candidates/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: inviteForm.full_name,
          email: inviteForm.email,
          project_id: project.id,
          assessment_type: selected.name,
          delivery_method: mode,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setInviteError(data.error ?? "Failed to generate invite");
      } else if (mode === "link") {
        const url = `${window.location.origin}${data.test_url}`;
        await navigator.clipboard.writeText(url).catch(() => {});
        setInviteSuccess({ type: "link", url });
        router.refresh();
      } else {
        setInviteSuccess({ type: "email", to: inviteForm.email });
        router.refresh();
      }
    } catch {
      setInviteError("Network error. Please try again.");
    }

    setInviteLoadingMode(null);
  };

  const resetInvite = () => {
    setInviteSuccess(null);
    setInviteError("");
    setInviteForm({ full_name: "", email: "", assessment_id: assessments[0]?.id ?? "" });
  };

  const cfg = projectStatusConfig[project.status] ?? projectStatusConfig.draft;
  const completed = candidates.filter((c) => c.status === "completed").length;
  const progress = candidates.length > 0 ? Math.round((completed / candidates.length) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${cfg.class}">
            <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
            <span className={cfg.class.split(" ").find((c) => c.startsWith("text-")) ?? "text-slate-300"}>{cfg.label}</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">{project.name}</h1>
          {project.description && (
            <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">{project.description}</p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-600">
            <span>Created {new Date(project.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
            {project.deadline && (
              <span>· Deadline {new Date(project.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setEditForm({
                name: project.name,
                description: project.description ?? "",
                deadline: project.deadline ? project.deadline.slice(0, 10) : "",
              });
              setEditError("");
              setEditOpen(true);
            }}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#1E2240] bg-[#07080F] px-4 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-[#1E2240] hover:text-white"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
            </svg>
            Edit
          </button>
          <Link
            href={`/reports?project=${project.id}`}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#1E2240] bg-[#07080F] px-4 py-2.5 text-sm font-medium text-[#8CB1FF] transition-colors hover:bg-[#1E2240] hover:text-blue-200"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m0 10a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 7a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m0 0v10m0-10a2 2 0 0 1 2 2h2a2 2 0 0 1 2-2V7a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2" />
            </svg>
            View report
          </Link>
        </div>
      </div>

      {/* Battery + Invite panel */}
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Assessment battery */}
        <div className="premium-card rounded-xl p-5">
          <div className="mb-4 flex items-center justify-between border-b border-[#1E2240] pb-4">
            <div>
              <h2 className="text-base font-semibold text-white">Assessment battery</h2>
              <p className="mt-0.5 text-xs text-slate-500">
                {assessments.length} test{assessments.length !== 1 ? "s" : ""} · {assessments.reduce((s, a) => s + (a.duration_minutes ?? 0), 0)} min total
              </p>
            </div>
            <button
              type="button"
              onClick={() => setAddOpen(true)}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#1D4ED8]/40 px-3 py-1.5 text-xs font-medium text-[#8CB1FF] transition-colors hover:bg-[#1D4ED8]/15"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14m7-7H5" />
              </svg>
              Add
            </button>
          </div>

          {assessments.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#1E2240] py-10 text-center">
              <p className="mb-3 text-sm text-slate-500">No assessments linked yet.</p>
              <button
                type="button"
                onClick={() => setAddOpen(true)}
                className="text-xs text-[#8CB1FF] transition-colors hover:text-blue-200"
              >
                Add your first assessment →
              </button>
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
            <h2 className="text-base font-semibold text-white">Invite candidate</h2>
            <p className="mt-0.5 text-xs text-slate-500">Generate a secure, 7-day invite link.</p>
          </div>

          {inviteSuccess ? (
            <div className="space-y-4">
              {inviteSuccess.type === "link" ? (
                <>
                  <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/8 p-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/15">
                      <svg className="h-4 w-4 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-emerald-300">Link copied to clipboard</p>
                      <p className="text-xs text-slate-500">Valid for 7 days · share with your candidate</p>
                    </div>
                  </div>
                  <div className="rounded-xl border border-[#1E2240] bg-[#07080F] p-3">
                    <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Invite link</p>
                    <div className="flex items-center gap-2">
                      <p className="flex-1 break-all font-mono text-xs text-blue-300">{inviteSuccess.url}</p>
                      <CopyButton text={inviteSuccess.url} />
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/8 p-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/15">
                    <svg className="h-4 w-4 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2Z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-emerald-300">Email sent</p>
                    <p className="truncate text-xs text-slate-500">{inviteSuccess.to}</p>
                  </div>
                </div>
              )}
              <button
                type="button"
                onClick={resetInvite}
                className="w-full cursor-pointer rounded-xl border border-[#1E2240] py-2.5 text-sm font-medium text-slate-400 transition-colors hover:text-white"
              >
                Generate another invite
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {inviteError && (
                <div className="rounded-xl border border-red-500/25 bg-red-500/10 p-3 text-sm text-red-300">
                  {inviteError}
                </div>
              )}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">
                  Candidate name
                  <span className="ml-1.5 text-xs font-normal text-slate-500">(optional)</span>
                </label>
                <input
                  value={inviteForm.full_name}
                  onChange={(e) => setInviteForm((f) => ({ ...f, full_name: e.target.value }))}
                  placeholder="Jane Smith"
                  className="w-full rounded-xl border border-[#1E2240] bg-[#07080F] px-4 py-2.5 text-sm text-slate-100 outline-none placeholder:text-slate-600 transition-colors focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/25"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">
                  Email address
                  <span className="ml-1.5 text-xs font-normal text-slate-500">(required for Send Email)</span>
                </label>
                <input
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm((f) => ({ ...f, email: e.target.value }))}
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
                    value={inviteForm.assessment_id}
                    onChange={(e) => setInviteForm((f) => ({ ...f, assessment_id: e.target.value }))}
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
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  disabled={inviteLoadingMode !== null || assessments.length === 0}
                  onClick={() => handleInvite("link")}
                  className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-[#1E2240] py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-[#1E2240] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {inviteLoadingMode === "link" ? (
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
                    </svg>
                  )}
                  {inviteLoadingMode === "link" ? "Copying…" : "Copy Link"}
                </button>
                <button
                  type="button"
                  disabled={inviteLoadingMode !== null || assessments.length === 0}
                  onClick={() => handleInvite("email")}
                  className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#1D4ED8] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1e40af] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {inviteLoadingMode === "email" ? (
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2Z" />
                    </svg>
                  )}
                  {inviteLoadingMode === "email" ? "Sending…" : "Send Email"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Candidates */}
      <div className="premium-card rounded-xl">
        <div className="flex items-center justify-between border-b border-[#1E2240] px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-white">Candidates</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {candidates.length} total · {completed} completed · {progress}% completion
            </p>
          </div>
        </div>

        {candidates.length === 0 ? (
          <div className="py-16 text-center">
            <svg className="mx-auto mb-3 h-10 w-10 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M23 21v-2a4 4 0 0 0-3-3.87" />
            </svg>
            <p className="text-sm font-medium text-slate-400">No candidates yet</p>
            <p className="mt-1 text-xs text-slate-600">Generate an invite link above to add your first candidate.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#1E2240]">
            {candidates.map((candidate, i) => {
              const sc = candidateStatusConfig[candidate.status] ?? candidateStatusConfig.invited;
              const displayName = candidate.full_name?.trim() || "Anonymous";
              const initials = displayName === "Anonymous"
                ? "?"
                : displayName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
              const avatarClass = avatarColors[i % avatarColors.length];
              const score = candidate.results[0]?.score ?? null;
              const scoreColor = score === null ? "" : score >= 80 ? "text-emerald-300" : score >= 60 ? "text-amber-300" : "text-red-300";
              return (
                <div key={candidate.id} className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-[#1E2240]/30">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${avatarClass}`}>
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-200">{displayName}</p>
                    <p className="mt-0.5 text-xs text-slate-600">
                      {new Date(candidate.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${sc.class}`}>
                    {sc.label}
                  </span>
                  {score !== null && (
                    <span className={`w-10 shrink-0 text-right text-sm font-bold ${scoreColor}`}>{score}</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit project modal */}
      {editOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setEditOpen(false)}
        >
          <div
            className="premium-card w-full max-w-md rounded-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-white">Edit project</h2>
                <p className="mt-0.5 text-xs text-slate-500">Update project name, description, or deadline.</p>
              </div>
              <button
                type="button"
                onClick={() => setEditOpen(false)}
                className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-[#1E2240] hover:text-white"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleEditSave} className="space-y-4">
              {editError && (
                <div className="rounded-xl border border-red-500/25 bg-red-500/10 p-3 text-sm text-red-300">
                  {editError}
                </div>
              )}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">
                  Project name <span className="text-red-400">*</span>
                </label>
                <input
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full rounded-xl border border-[#1E2240] bg-[#07080F] px-4 py-2.5 text-sm text-slate-100 outline-none placeholder:text-slate-600 transition-colors focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/25"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">
                  Description
                  <span className="ml-1.5 text-xs font-normal text-slate-500">(optional)</span>
                </label>
                <textarea
                  rows={3}
                  value={editForm.description}
                  onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Describe the role or hiring context…"
                  className="w-full resize-none rounded-xl border border-[#1E2240] bg-[#07080F] px-4 py-2.5 text-sm text-slate-100 outline-none placeholder:text-slate-600 transition-colors focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/25"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">
                  Deadline
                  <span className="ml-1.5 text-xs font-normal text-slate-500">(optional)</span>
                </label>
                <input
                  type="date"
                  value={editForm.deadline}
                  onChange={(e) => setEditForm((f) => ({ ...f, deadline: e.target.value }))}
                  className="w-full rounded-xl border border-[#1E2240] bg-[#07080F] px-4 py-2.5 text-sm text-slate-100 outline-none transition-colors focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/25 [color-scheme:dark]"
                />
              </div>
              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setEditOpen(false)}
                  className="flex-1 cursor-pointer rounded-xl border border-[#1E2240] py-2.5 text-sm font-medium text-slate-400 transition-colors hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSaving}
                  className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#1D4ED8] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1e40af] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {editSaving ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z" />
                      </svg>
                      Saving…
                    </>
                  ) : (
                    "Save changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add assessment modal */}
      {addOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 pt-16 backdrop-blur-sm"
          onClick={() => setAddOpen(false)}
        >
          <div
            className="premium-card mb-8 w-full max-w-xl rounded-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-white">Add assessment</h2>
                <p className="mt-0.5 text-xs text-slate-500">Select a test to add to this project's battery.</p>
              </div>
              <button
                type="button"
                onClick={() => setAddOpen(false)}
                className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-[#1E2240] hover:text-white"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="max-h-[60vh] space-y-1.5 overflow-y-auto">
              {allAssessments.map((a) => {
                const linked = linkedIds.has(a.id);
                return (
                  <div
                    key={a.id}
                    className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${linked ? "border-emerald-500/20 bg-emerald-500/5" : "border-[#1E2240] bg-[#07080F]/55"}`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className={`truncate text-sm font-medium ${linked ? "text-emerald-300" : "text-slate-200"}`}>{a.name}</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {a.category} · {a.duration_minutes ?? "-"} min · {a.question_count ?? "-"} Q
                      </p>
                    </div>
                    {linked ? (
                      <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-emerald-400">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        Added
                      </span>
                    ) : (
                      <button
                        type="button"
                        disabled={addingId === a.id}
                        onClick={() => handleAddAssessment(a.id)}
                        className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-lg bg-[#1D4ED8] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {addingId === a.id ? (
                          <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z" />
                          </svg>
                        ) : (
                          <>
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 5v14m7-7H5" />
                            </svg>
                            Add
                          </>
                        )}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
