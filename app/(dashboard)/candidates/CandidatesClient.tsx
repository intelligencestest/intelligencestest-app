"use client";

import { useState } from "react";

const statusConfig: Record<string, { label: string; class: string; dot: string; text: string }> = {
  invited: { label: "Invited", class: "bg-amber-500/10 text-amber-300 border-amber-500/25", dot: "bg-amber-400", text: "text-amber-300" },
  started: { label: "Started", class: "bg-blue-500/10 text-blue-300 border-blue-500/25", dot: "bg-blue-400", text: "text-blue-300" },
  completed: { label: "Completed", class: "bg-emerald-500/10 text-emerald-300 border-emerald-500/25", dot: "bg-emerald-400", text: "text-emerald-300" },
};

const avatarColors = [
  "bg-blue-500/20 text-blue-300 border-blue-500/30",
  "bg-violet-500/20 text-violet-300 border-violet-500/30",
  "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  "bg-amber-500/20 text-amber-300 border-amber-500/30",
  "bg-pink-500/20 text-pink-300 border-pink-500/30",
  "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
];

const activeAssessmentOptions = [
  { name: "Critical Thinking Test", route: "critical-thinking", label: "Critical Thinking Test (25 min)" },
  { name: "Numerical Intelligence Test", route: "numerical-intelligence", label: "Numerical Intelligence Test (20 min)" },
  { name: "Personality Type Test", route: "personality-type", label: "Personality Type Test (20 min)" },
  { name: "Situational Judgment Test", route: "situational-judgment", label: "Situational Judgment Test (20 min)" },
  { name: "Emotional Intelligence Test", route: "emotional-intelligence", label: "Emotional Intelligence Test (20 min)" },
  { name: "Leadership Styles Test", route: "leadership-styles", label: "Leadership Styles Test (15 min)" },
  { name: "Adversity Quotient (AQ) Test", route: "aq", label: "AQ Test - Adversity Quotient (20 min)" },
  { name: "Attention to Detail Test", route: "attention-detail", label: "Attention to Detail Test (20 min)" },
  { name: "Verbal Reasoning Test", route: "verbal-reasoning", label: "Verbal Reasoning Test (20 min)" },
  { name: "Abstract Reasoning Test", route: "abstract-reasoning", label: "Abstract Reasoning Test (20 min)" },
  { name: "Mechanical Reasoning Test", route: "mechanical-reasoning", label: "Mechanical Reasoning Test (25 min)" },
  { name: "Communication Skills Test", route: "communication-skills", label: "Communication Skills Test (20 min)" },
  { name: "Problem Solving Test", route: "problem-solving", label: "Problem Solving Test (25 min)" },
  { name: "Work Style Assessment", route: "work-style", label: "Work Style Assessment (20 min)" },
  { name: "Sales Aptitude Test", route: "sales-aptitude", label: "Sales Aptitude Test (20 min)" },
  { name: "Customer Service Skills Test", route: "customer-service-skills", label: "Customer Service Skills Test (20 min)" },
  { name: "Teamwork & Collaboration Test", route: "teamwork-collaboration", label: "Teamwork & Collaboration Test (20 min)" },
  { name: "Time Management Test", route: "time-management", label: "Time Management Test (20 min)" },
  { name: "Stress Tolerance Test", route: "stress-tolerance", label: "Stress Tolerance Test (15 min)" },
  { name: "Integrity & Ethics Test", route: "integrity-ethics", label: "Integrity & Ethics Test (20 min)" },
  { name: "Decision Making Test", route: "decision-making", label: "Decision Making Test (20 min)" },
  { name: "Learning Agility Test", route: "learning-agility", label: "Learning Agility Test (20 min)" },
] as const;

type SharedAssessmentRoute = (typeof activeAssessmentOptions)[number]["route"];

interface Candidate {
  id: string;
  full_name: string;
  email: string;
  status: string;
  created_at: string;
  token: string | null;
  hiring_projects: { id: string; name: string } | null;
}

interface Project {
  id: string;
  name: string;
  status: string;
}

interface Props {
  initialCandidates: Candidate[];
  projects: Project[];
  companyId: string;
}

interface BulkResult {
  email: string;
  name: string;
  url: string | null;
  error: string | null;
}

function nameFromEmail(email: string): string {
  return email
    .split("@")[0]
    .replace(/[._-]/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ") || email;
}

function CopyButton({ text, onCopied }: { text: string; onCopied?: () => void }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      onCopied?.();
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      onClick={copy}
      aria-label="Copy invitation link"
      className="inline-flex flex-shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-[#1D4ED8]/40 px-3 py-1.5 text-xs font-medium text-[#A9C2FF] transition-colors hover:bg-[#1D4ED8]/10"
    >
      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2m-6 12h8a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-8a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2Z" />
      </svg>
      {copied ? "Copied" : "Copy link"}
    </button>
  );
}

export default function CandidatesClient({ initialCandidates, projects, companyId }: Props) {
  const [candidates, setCandidates] = useState<Candidate[]>(initialCandidates);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [inviteMode, setInviteMode] = useState<"single" | "bulk" | "shared">("single");

  // Single invite state
  const [singleForm, setSingleForm] = useState<{
    full_name: string;
    email: string;
    project_id: string;
    assessment_type: string;
  }>({
    full_name: "",
    email: "",
    project_id: projects[0]?.id ?? "",
    assessment_type: activeAssessmentOptions[0].name,
  });
  const [singleInviting, setSingleInviting] = useState(false);
  const [singleError, setSingleError] = useState("");
  const [singleResult, setSingleResult] = useState<{ test_url: string; full_name: string } | null>(null);

  // Bulk invite state
  const [bulkEmails, setBulkEmails] = useState("");
  const [bulkProjectId, setBulkProjectId] = useState(projects[0]?.id ?? "");
  const [bulkAssessment, setBulkAssessment] = useState<string>(activeAssessmentOptions[0].name);
  const [bulkInviting, setBulkInviting] = useState(false);
  const [bulkResults, setBulkResults] = useState<BulkResult[] | null>(null);
  const [bulkError, setBulkError] = useState("");
  const [copyToast, setCopyToast] = useState("");

  // Shared link state
  const [sharedProjectId, setSharedProjectId] = useState(projects[0]?.id ?? "");
  const [sharedAssessment, setSharedAssessment] = useState<SharedAssessmentRoute>(activeAssessmentOptions[0].route);

  const filtered = candidates.filter((c) => {
    const matchSearch =
      !search ||
      c.full_name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    const matchProject = projectFilter === "all" || c.hiring_projects?.id === projectFilter;
    return matchSearch && matchStatus && matchProject;
  });

  const showCopyToast = () => {
    setCopyToast("Invitation link copied");
    window.setTimeout(() => setCopyToast(""), 2200);
  };

  const handleSingleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setSingleError("");
    setSingleInviting(true);
    try {
      const res = await fetch("/api/candidates/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(singleForm),
      });
      const data = await res.json();
      if (!res.ok) {
        setSingleError(data.error ?? "Failed to invite candidate");
      } else {
        const fullUrl = `${window.location.origin}${data.test_url}`;
        setSingleResult({ test_url: fullUrl, full_name: singleForm.full_name });
        setCandidates((prev) => [
          {
            id: data.candidate_id,
            full_name: singleForm.full_name,
            email: singleForm.email,
            status: "invited",
            created_at: new Date().toISOString(),
            token: null,
            hiring_projects: projects.find((p) => p.id === singleForm.project_id) ?? null,
          },
          ...prev,
        ]);
      }
    } catch {
      setSingleError("Network error. Please try again.");
    }
    setSingleInviting(false);
  };

  const handleBulkInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setBulkError("");
    const emails = bulkEmails
      .split(/[\n,]+/)
      .map((e) => e.trim())
      .filter(Boolean);

    if (emails.length === 0) {
      setBulkError("Enter at least one email address.");
      return;
    }
    if (emails.length > 50) {
      setBulkError("Maximum 50 emails per bulk invite.");
      return;
    }

    setBulkInviting(true);
    const results: BulkResult[] = [];

    for (const email of emails) {
      const name = nameFromEmail(email);
      try {
        const res = await fetch("/api/candidates/invite", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ full_name: name, email, project_id: bulkProjectId, assessment_type: bulkAssessment }),
        });
        const data = await res.json();
        if (!res.ok) {
          results.push({ email, name, url: null, error: data.error ?? "Failed" });
        } else {
          const fullUrl = `${window.location.origin}${data.test_url}`;
          results.push({ email, name, url: fullUrl, error: null });
          setCandidates((prev) => [
            {
              id: data.candidate_id,
              full_name: name,
              email,
              status: "invited",
              created_at: new Date().toISOString(),
              token: null,
              hiring_projects: projects.find((p) => p.id === bulkProjectId) ?? null,
            },
            ...prev,
          ]);
        }
      } catch {
        results.push({ email, name, url: null, error: "Network error" });
      }
    }

    setBulkResults(results);
    setBulkInviting(false);
  };

  const closeModal = () => {
    setShowModal(false);
    setSingleResult(null);
    setSingleError("");
    setBulkResults(null);
    setBulkError("");
    setBulkEmails("");
    setCopyToast("");
    setSingleForm({ full_name: "", email: "", project_id: projects[0]?.id ?? "", assessment_type: activeAssessmentOptions[0].name });
    setInviteMode("single");
    setSharedProjectId(projects[0]?.id ?? "");
    setSharedAssessment(activeAssessmentOptions[0].route);
  };

  const counts = {
    invited: candidates.filter((c) => c.status === "invited").length,
    started: candidates.filter((c) => c.status === "started").length,
    completed: candidates.filter((c) => c.status === "completed").length,
  };

  const inputClass = "w-full rounded-xl border border-[#1E2240] bg-[#07080F] px-4 py-2.5 text-sm text-slate-100 outline-none transition-colors placeholder:text-slate-600 focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/25";
  const selectClass = "w-full cursor-pointer rounded-xl border border-[#1E2240] bg-[#07080F] px-4 py-2.5 text-sm text-slate-300 outline-none focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/25";

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#1E2240] bg-[#0D1020] px-3 py-1 text-xs font-medium text-[#9BB8FF]">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-soft-pulse" />
            Candidate roster
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Candidates</h1>
          <p className="text-slate-500 text-sm mt-1">
            {candidates.length} candidate{candidates.length !== 1 ? "s" : ""} across all projects
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex cursor-pointer items-center gap-2 self-start rounded-xl bg-[#1D4ED8] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_14px_36px_rgba(29,78,216,0.22)] transition-colors hover:bg-[#1e40af] sm:self-auto"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21.75 7.5v9a2.25 2.25 0 0 1-2.25 2.25h-15A2.25 2.25 0 0 1 2.25 16.5v-9m19.5 0A2.25 2.25 0 0 0 19.5 5.25h-15A2.25 2.25 0 0 0 2.25 7.5m19.5 0-8.2 5.47a2.25 2.25 0 0 1-2.5 0L2.25 7.5" />
          </svg>
          Invite Candidate
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { key: "invited", label: "Invited", count: counts.invited },
          { key: "started", label: "Started", count: counts.started },
          { key: "completed", label: "Completed", count: counts.completed },
        ].map((s, index) => {
          const cfg = statusConfig[s.key];
          return (
            <div key={s.label} className="premium-card rounded-xl p-4 animate-fade-up" style={{ animationDelay: `${index * 60}ms` }}>
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{s.label}</p>
                <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
              </div>
              <p className={`mt-2 text-3xl font-semibold tracking-tight ${cfg.text}`}>{s.count}</p>
            </div>
          );
        })}
      </div>

      <div className="premium-card rounded-xl p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full rounded-xl border border-[#1E2240] bg-[#07080F] py-2.5 pl-9 pr-4 text-sm text-slate-100 outline-none transition-colors placeholder:text-slate-600 focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/25"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="cursor-pointer rounded-xl border border-[#1E2240] bg-[#07080F] px-3 py-2.5 text-sm text-slate-300 outline-none focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/25"
          >
            <option value="all">All Statuses</option>
            <option value="invited">Invited</option>
            <option value="started">Started</option>
            <option value="completed">Completed</option>
          </select>
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="cursor-pointer rounded-xl border border-[#1E2240] bg-[#07080F] px-3 py-2.5 text-sm text-slate-300 outline-none focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/25"
          >
            <option value="all">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="premium-card overflow-hidden rounded-xl">
        <div className="hidden grid-cols-12 gap-4 border-b border-[#1E2240] px-6 py-3 text-xs font-medium uppercase tracking-wider text-slate-500 md:grid">
          <div className="col-span-5">Candidate</div>
          <div className="col-span-4">Project</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-1 text-right">Invited</div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <svg className="w-10 h-10 mx-auto mb-3 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8" />
            </svg>
            <p className="text-sm">{candidates.length === 0 ? "No candidates yet. Click Invite Candidate to get started." : "No candidates match your filters."}</p>
          </div>
        ) : (
          <div className="divide-y divide-[#1E2240]">
            {filtered.map((candidate, i) => {
              const cfg = statusConfig[candidate.status] ?? statusConfig.invited;
              const avatarClass = avatarColors[i % avatarColors.length];
              const initials = candidate.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
              return (
                <div key={candidate.id} className="grid gap-4 px-4 py-4 transition-colors hover:bg-[#1E2240]/30 md:grid-cols-12 md:px-6 md:items-center group">
                  <div className="flex min-w-0 items-center gap-3 md:col-span-5">
                    <div className={`w-10 h-10 rounded-full border flex items-center justify-center text-xs font-semibold flex-shrink-0 ${avatarClass}`}>
                      {initials || "?"}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white transition-colors group-hover:text-[#8CB1FF]">
                        {candidate.full_name}
                      </p>
                      <p className="truncate text-xs text-slate-500">{candidate.email}</p>
                    </div>
                  </div>
                  <div className="min-w-0 md:col-span-4">
                    <p className="truncate text-sm text-slate-400">{candidate.hiring_projects?.name ?? "Unassigned"}</p>
                    <p className="mt-1 text-xs text-slate-600 md:hidden">
                      Invited {new Date(candidate.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${cfg.class}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                      {cfg.label}
                    </span>
                  </div>
                  <div className="hidden text-right md:col-span-1 md:block">
                    <p className="text-xs text-slate-500">
                      {new Date(candidate.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="border-t border-[#1E2240] px-6 py-3 text-xs text-slate-600">
          Showing {filtered.length} of {candidates.length} candidates
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm">
          {copyToast && (
            <div className="fixed right-4 top-4 z-[60] flex items-center gap-2 rounded-xl border border-emerald-500/25 bg-[#0D1020] px-4 py-3 text-sm font-medium text-emerald-300 shadow-2xl shadow-black/30">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              {copyToast}
            </div>
          )}
          <div className="premium-card w-full max-w-lg rounded-2xl p-6 shadow-2xl">

            {/* Single: success state */}
            {inviteMode === "single" && singleResult && (
              <>
                <div className="text-center mb-6">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/25 bg-emerald-500/10 shadow-lg shadow-emerald-950/20">
                    <svg className="w-6 h-6 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-1">Invitation created</h3>
                  <p className="text-slate-400 text-sm">Share this secure assessment link with {singleResult.full_name}.</p>
                </div>
                <div className="mb-4 rounded-2xl border border-[#1E2240] bg-[#07080F] p-4">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Secure link</span>
                    <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-300">Ready</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="flex-1 break-all font-mono text-xs text-blue-300">{singleResult.test_url}</p>
                    <CopyButton text={singleResult.test_url} onCopied={showCopyToast} />
                  </div>
                </div>
                <button onClick={closeModal} className="w-full cursor-pointer rounded-xl border border-[#1E2240] py-2.5 text-sm font-medium text-slate-400 transition-colors hover:text-white">
                  Done
                </button>
              </>
            )}

            {/* Bulk: results state */}
            {inviteMode === "bulk" && bulkResults && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Invitations sent</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {bulkResults.filter((r) => r.url).length} of {bulkResults.length} successful
                    </p>
                  </div>
                  <button onClick={closeModal} className="cursor-pointer rounded-lg p-1 text-slate-500 hover:bg-[#1E2240] hover:text-white">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {bulkResults.map((r) => (
                    <div key={r.email} className={`rounded-xl border p-3 ${r.url ? "border-emerald-500/20 bg-emerald-500/5" : "border-red-500/20 bg-red-500/5"}`}>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="text-sm font-medium text-white truncate">{r.email}</p>
                        {r.url ? (
                          <span className="text-xs text-emerald-400 flex-shrink-0">Invited</span>
                        ) : (
                          <span className="text-xs text-red-400 flex-shrink-0">{r.error}</span>
                        )}
                      </div>
                      {r.url && (
                        <div className="flex items-center gap-2">
                          <p className="flex-1 truncate font-mono text-[10px] text-slate-500">{r.url}</p>
                          <CopyButton text={r.url} onCopied={showCopyToast} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <button onClick={closeModal} className="mt-4 w-full cursor-pointer rounded-xl border border-[#1E2240] py-2.5 text-sm font-medium text-slate-400 transition-colors hover:text-white">
                  Done
                </button>
              </>
            )}

            {/* Form state (single or bulk) */}
            {!singleResult && !bulkResults && (
              <>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Invite Candidate</h3>
                    <p className="mt-1 text-xs text-slate-500">Generate a secure, time-limited assessment link.</p>
                  </div>
                  <button onClick={closeModal} className="cursor-pointer rounded-lg p-1 text-slate-500 transition-colors hover:bg-[#1E2240] hover:text-white">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Mode toggle */}
                <div className="flex gap-1 rounded-xl border border-[#1E2240] bg-[#07080F] p-1 mb-5">
                  {([
                    { id: "single", label: "Single" },
                    { id: "bulk", label: "Bulk" },
                    { id: "shared", label: "Shared link" },
                  ] as const).map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => { setInviteMode(mode.id); setSingleError(""); setBulkError(""); }}
                      className={`flex-1 cursor-pointer rounded-lg py-2 text-xs font-medium transition-colors ${
                        inviteMode === mode.id
                          ? "bg-[#1D4ED8] text-white"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>

                {inviteMode === "single" && (
                  <>
                    {singleError && (
                      <div className="mb-4 rounded-xl border border-red-500/25 bg-red-500/10 p-3 text-sm text-red-300">
                        {singleError}
                      </div>
                    )}
                    <form onSubmit={handleSingleInvite} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
                        <input
                          required
                          value={singleForm.full_name}
                          onChange={(e) => setSingleForm((f) => ({ ...f, full_name: e.target.value }))}
                          placeholder="Jane Smith"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
                        <input
                          required
                          type="email"
                          value={singleForm.email}
                          onChange={(e) => setSingleForm((f) => ({ ...f, email: e.target.value }))}
                          placeholder="jane@example.com"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Project</label>
                        <select
                          required
                          value={singleForm.project_id}
                          onChange={(e) => setSingleForm((f) => ({ ...f, project_id: e.target.value }))}
                          className={selectClass}
                        >
                          {projects.length === 0 && <option value="">No projects yet</option>}
                          {projects.map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Assessment</label>
                        <select
                          value={singleForm.assessment_type}
                          onChange={(e) => setSingleForm((f) => ({ ...f, assessment_type: e.target.value }))}
                          className={selectClass}
                        >
                          {activeAssessmentOptions.map((assessment) => (
                            <option key={assessment.name} value={assessment.name}>
                              {assessment.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex gap-3 pt-2">
                        <button type="button" onClick={closeModal} className="flex-1 cursor-pointer rounded-xl border border-[#1E2240] py-2.5 text-sm font-medium text-slate-400 transition-colors hover:text-white">
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={singleInviting || projects.length === 0}
                          className="flex-1 cursor-pointer rounded-xl bg-[#1D4ED8] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1e40af] disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {singleInviting ? (
                            <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z" /></svg> Inviting...</>
                          ) : "Generate Link"}
                        </button>
                      </div>
                    </form>
                  </>
                )}

                {inviteMode === "shared" && (() => {
                  const sharedUrl = typeof window !== "undefined"
                    ? `${window.location.origin}/test/${sharedAssessment}?project=${sharedProjectId}`
                    : `/test/${sharedAssessment}?project=${sharedProjectId}`;
                  return (
                    <div className="space-y-4">
                      <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
                        <p className="text-xs font-semibold text-blue-300 uppercase tracking-wider mb-1">How it works</p>
                        <p className="text-sm text-slate-400 leading-relaxed">
                          Share one link with multiple candidates. Each person enters their name and email, then starts the test immediately. No individual invites needed.
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Project</label>
                        <select value={sharedProjectId} onChange={(e) => setSharedProjectId(e.target.value)} className={selectClass}>
                          {projects.length === 0 && <option value="">No projects yet</option>}
                          {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Assessment</label>
                        <select
                          value={sharedAssessment}
                          onChange={(e) => setSharedAssessment(e.target.value as SharedAssessmentRoute)}
                          className={selectClass}
                        >
                          {activeAssessmentOptions.map((assessment) => (
                            <option key={assessment.route} value={assessment.route}>
                              {assessment.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Your shareable link</label>
                        <div className="flex items-center gap-2 rounded-xl border border-[#1E2240] bg-[#07080F] p-3">
                          <p className="flex-1 break-all font-mono text-xs text-blue-300">{sharedUrl}</p>
                          <CopyButton text={sharedUrl} onCopied={showCopyToast} />
                        </div>
                      </div>
                      <button type="button" onClick={closeModal} className="w-full cursor-pointer rounded-xl border border-[#1E2240] py-2.5 text-sm font-medium text-slate-400 transition-colors hover:text-white">
                        Done
                      </button>
                    </div>
                  );
                })()}

                {inviteMode === "bulk" && (
                  <>
                    {bulkError && (
                      <div className="mb-4 rounded-xl border border-red-500/25 bg-red-500/10 p-3 text-sm text-red-300">
                        {bulkError}
                      </div>
                    )}
                    <form onSubmit={handleBulkInvite} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">
                          Email addresses
                          <span className="ml-2 text-xs text-slate-500 font-normal">comma or newline separated - max 50</span>
                        </label>
                        <textarea
                          required
                          rows={5}
                          value={bulkEmails}
                          onChange={(e) => setBulkEmails(e.target.value)}
                          placeholder={"alice@company.com\nbob@company.com, carol@company.com"}
                          className="w-full rounded-xl border border-[#1E2240] bg-[#07080F] px-4 py-2.5 text-sm text-slate-100 outline-none transition-colors placeholder:text-slate-600 focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/25 resize-none"
                        />
                        <p className="mt-1 text-xs text-slate-600">
                          {bulkEmails.split(/[\n,]+/).filter((e) => e.trim()).length} email{bulkEmails.split(/[\n,]+/).filter((e) => e.trim()).length !== 1 ? "s" : ""} entered
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Project</label>
                        <select value={bulkProjectId} onChange={(e) => setBulkProjectId(e.target.value)} className={selectClass}>
                          {projects.length === 0 && <option value="">No projects yet</option>}
                          {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Assessment</label>
                        <select value={bulkAssessment} onChange={(e) => setBulkAssessment(e.target.value)} className={selectClass}>
                          {activeAssessmentOptions.map((assessment) => (
                            <option key={assessment.name} value={assessment.name}>
                              {assessment.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex gap-3 pt-2">
                        <button type="button" onClick={closeModal} className="flex-1 cursor-pointer rounded-xl border border-[#1E2240] py-2.5 text-sm font-medium text-slate-400 transition-colors hover:text-white">
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={bulkInviting || projects.length === 0}
                          className="flex-1 cursor-pointer rounded-xl bg-[#1D4ED8] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1e40af] disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {bulkInviting ? (
                            <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z" /></svg> Inviting...</>
                          ) : "Send All Invitations"}
                        </button>
                      </div>
                    </form>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
