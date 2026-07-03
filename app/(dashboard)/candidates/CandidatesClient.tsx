"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { useEffect, useState } from "react";

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
  projectAssessments: Record<string, { name: string; route: string; label: string }[]>;
}

type LoadingMode = "link" | "email" | null;
type InviteSuccess = { type: "link"; url: string } | { type: "email"; to: string };

function CopyButton({ text }: { text: string }) {
  const es = useLocale() === "es";
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
      }}
      aria-label={es ? "Copiar enlace" : "Copy link"}
      className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-[#1D4ED8]/40 px-3 py-1.5 text-xs font-medium text-[#A9C2FF] transition-colors hover:bg-[#1D4ED8]/10"
    >
      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2m-6 12h8a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-8a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2Z" />
      </svg>
      {copied ? (es ? "Copiado" : "Copied!") : (es ? "Copiar" : "Copy")}
    </button>
  );
}

export default function CandidatesClient({ initialCandidates, projects, projectAssessments }: Props) {
  const es = useLocale() === "es";
  const dateLocale = es ? "es-ES" : "en-US";
  const copy = es
    ? {
        roster: "Lista de candidatos",
        title: "Candidatos",
        across: (count: number) => `${count} candidato${count === 1 ? "" : "s"} en todos los proyectos`,
        inviteCandidate: "Invitar candidato",
        status: { invited: "Invitado", started: "Iniciado", completed: "Completado" } as Record<string, string>,
        search: "Buscar por nombre o correo...",
        allStatuses: "Todos los estados",
        allProjects: "Todos los proyectos",
        candidate: "Candidato",
        project: "Proyecto",
        statusHeader: "Estado",
        invitedAt: "Invitado",
        noCandidates: "Aún no hay candidatos. Haga clic en Invitar candidato para comenzar.",
        noMatches: "Ningún candidato coincide con los filtros.",
        anonymous: "Sin nombre",
        unassigned: "Sin asignar",
        showing: (shown: number, total: number) => `Mostrando ${shown} de ${total} candidatos`,
        modalTitle: "Invitar candidato",
        modalDescription: "Genere un enlace seguro de evaluación válido por 7 días.",
        validEmail: "Se requiere un correo electrónico válido para enviar la invitación.",
        selectProject: "Seleccione un proyecto primero.",
        noLinked: "No hay evaluaciones vinculadas a este proyecto.",
        failed: "No se pudo generar la invitación",
        network: "Error de red. Intente de nuevo.",
        copied: "Enlace copiado al portapapeles",
        validShare: "Válido por 7 días, compártalo con el candidato",
        inviteLink: "Enlace de invitación",
        emailSent: "Correo enviado",
        inviteAnother: "Invitar a otro",
        candidateName: "Nombre del candidato",
        optional: "opcional",
        emailAddress: "Correo electrónico",
        requiredEmail: "requerido para enviar correo",
        noProjects: "Aún no hay proyectos",
        createFirst: "crear uno primero",
        assessment: "Evaluación",
        selectProjectFirst: "Seleccione un proyecto primero",
        copying: "Copiando...",
        copyLink: "Copiar enlace",
        sending: "Enviando...",
        sendEmail: "Enviar correo",
      }
    : {
        roster: "Candidate roster",
        title: "Candidates",
        across: (count: number) => `${count} candidate${count !== 1 ? "s" : ""} across all projects`,
        inviteCandidate: "Invite Candidate",
        status: { invited: "Invited", started: "Started", completed: "Completed" } as Record<string, string>,
        search: "Search by name or email...",
        allStatuses: "All Statuses",
        allProjects: "All Projects",
        candidate: "Candidate",
        project: "Project",
        statusHeader: "Status",
        invitedAt: "Invited",
        noCandidates: "No candidates yet. Click Invite Candidate to get started.",
        noMatches: "No candidates match your filters.",
        anonymous: "Anonymous",
        unassigned: "Unassigned",
        showing: (shown: number, total: number) => `Showing ${shown} of ${total} candidates`,
        modalTitle: "Invite Candidate",
        modalDescription: "Generate a secure, 7-day assessment link.",
        validEmail: "A valid email address is required to send an invite.",
        selectProject: "Select a project first.",
        noLinked: "No assessments are linked to this project.",
        failed: "Failed to generate invite",
        network: "Network error. Please try again.",
        copied: "Link copied to clipboard",
        validShare: "Valid for 7 days, share with your candidate",
        inviteLink: "Invite link",
        emailSent: "Email sent",
        inviteAnother: "Invite another",
        candidateName: "Candidate name",
        optional: "optional",
        emailAddress: "Email address",
        requiredEmail: "required for Send Email",
        noProjects: "No projects yet",
        createFirst: "create one first",
        assessment: "Assessment",
        selectProjectFirst: "Select a project first",
        copying: "Copying...",
        copyLink: "Copy Link",
        sending: "Sending...",
        sendEmail: "Send Email",
      };
  const [candidates, setCandidates] = useState<Candidate[]>(initialCandidates);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    project_id: projects[0]?.id ?? "",
    assessment_type: "",
  });
  const [loadingMode, setLoadingMode] = useState<LoadingMode>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<InviteSuccess | null>(null);

  // Sync first assessment when project changes
  useEffect(() => {
    const opts = projectAssessments[form.project_id] ?? [];
    setForm((f) => ({ ...f, assessment_type: opts[0]?.name ?? "" }));
  }, [form.project_id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Escape key closes modal
  useEffect(() => {
    if (!showModal) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") closeModal(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [showModal]);

  // Deep links from the dashboard: ?status=, ?project=, ?invite=1
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get("status");
    if (status && ["invited", "started", "completed"].includes(status)) setStatusFilter(status);
    const project = params.get("project");
    if (project) setProjectFilter(project);
    if (params.get("invite") === "1") {
      if (project) setForm((f) => ({ ...f, project_id: project }));
      setShowModal(true);
    }
  }, []);

  const currentAssessments = projectAssessments[form.project_id] ?? [];

  const closeModal = () => {
    setShowModal(false);
    setSuccess(null);
    setError("");
    setLoadingMode(null);
    const firstProject = projects[0]?.id ?? "";
    const firstAssessment = (projectAssessments[firstProject] ?? [])[0]?.name ?? "";
    setForm({ full_name: "", email: "", project_id: firstProject, assessment_type: firstAssessment });
  };

  const resetForm = () => {
    setSuccess(null);
    setError("");
    const firstAssessment = (projectAssessments[form.project_id] ?? [])[0]?.name ?? "";
    setForm((f) => ({ ...f, full_name: "", email: "", assessment_type: firstAssessment }));
  };

  const handleInvite = async (mode: "link" | "email") => {
    setError("");

    if (mode === "email") {
      if (!form.email || !form.email.includes("@")) {
        setError(copy.validEmail);
        return;
      }
    }

    if (!form.project_id) { setError(copy.selectProject); return; }
    if (!form.assessment_type) { setError(copy.noLinked); return; }

    setLoadingMode(mode);
    try {
      const res = await fetch("/api/candidates/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: form.full_name,
          email: form.email,
          project_id: form.project_id,
          assessment_type: form.assessment_type,
          delivery_method: mode,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? copy.failed);
      } else {
        const project = projects.find((p) => p.id === form.project_id) ?? null;
        setCandidates((prev) => [
          {
            id: data.candidate_id,
            full_name: form.full_name || copy.anonymous,
            email: form.email || "",
            status: "invited",
            created_at: new Date().toISOString(),
            token: null,
            hiring_projects: project,
          },
          ...prev,
        ]);

        if (mode === "link") {
          const url = `${window.location.origin}${data.test_url}`;
          await navigator.clipboard.writeText(url).catch(() => {});
          setSuccess({ type: "link", url });
        } else {
          setSuccess({ type: "email", to: form.email });
        }
      }
    } catch {
      setError(copy.network);
    }
    setLoadingMode(null);
  };

  const filtered = candidates.filter((c) => {
    const matchSearch =
      !search ||
      c.full_name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    const matchProject = projectFilter === "all" || c.hiring_projects?.id === projectFilter;
    return matchSearch && matchStatus && matchProject;
  });

  const counts = {
    invited: candidates.filter((c) => c.status === "invited").length,
    started: candidates.filter((c) => c.status === "started").length,
    completed: candidates.filter((c) => c.status === "completed").length,
  };

  const inputClass = "w-full rounded-xl border border-[#1E2240] bg-[#07080F] px-4 py-2.5 text-sm text-slate-100 outline-none transition-colors placeholder:text-slate-600 focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/25";
  const selectClass = "w-full cursor-pointer rounded-xl border border-[#1E2240] bg-[#07080F] px-4 py-2.5 text-sm text-slate-300 outline-none focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/25";

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#1E2240] bg-[#0D1020] px-3 py-1 text-xs font-medium text-[#9BB8FF]">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-soft-pulse" />
            {copy.roster}
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">{copy.title}</h1>
          <p className="text-slate-500 text-sm mt-1">
            {copy.across(candidates.length)}
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex cursor-pointer items-center gap-2 self-start rounded-xl bg-[#1D4ED8] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_14px_36px_rgba(29,78,216,0.22)] transition-colors hover:bg-[#1e40af] sm:self-auto"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21.75 7.5v9a2.25 2.25 0 0 1-2.25 2.25h-15A2.25 2.25 0 0 1 2.25 16.5v-9m19.5 0A2.25 2.25 0 0 0 19.5 5.25h-15A2.25 2.25 0 0 0 2.25 7.5m19.5 0-8.2 5.47a2.25 2.25 0 0 1-2.5 0L2.25 7.5" />
          </svg>
          {copy.inviteCandidate}
        </button>
      </div>

      {/* Status stats */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { key: "invited", label: copy.status.invited, count: counts.invited },
          { key: "started", label: copy.status.started, count: counts.started },
          { key: "completed", label: copy.status.completed, count: counts.completed },
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

      {/* Filters */}
      <div className="premium-card rounded-xl p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={copy.search}
              className="w-full rounded-xl border border-[#1E2240] bg-[#07080F] py-2.5 pl-9 pr-4 text-sm text-slate-100 outline-none transition-colors placeholder:text-slate-600 focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/25"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="cursor-pointer rounded-xl border border-[#1E2240] bg-[#07080F] px-3 py-2.5 text-sm text-slate-300 outline-none focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/25"
          >
            <option value="all">{copy.allStatuses}</option>
            <option value="invited">{copy.status.invited}</option>
            <option value="started">{copy.status.started}</option>
            <option value="completed">{copy.status.completed}</option>
          </select>
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="cursor-pointer rounded-xl border border-[#1E2240] bg-[#07080F] px-3 py-2.5 text-sm text-slate-300 outline-none focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/25"
          >
            <option value="all">{copy.allProjects}</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Candidate table */}
      <div className="premium-card overflow-hidden rounded-xl">
        <div className="hidden grid-cols-12 gap-4 border-b border-[#1E2240] px-6 py-3 text-xs font-medium uppercase tracking-wider text-slate-500 md:grid">
          <div className="col-span-5">{copy.candidate}</div>
          <div className="col-span-4">{copy.project}</div>
          <div className="col-span-2">{copy.statusHeader}</div>
          <div className="col-span-1 text-right">{copy.invitedAt}</div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <svg className="w-10 h-10 mx-auto mb-3 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8" />
            </svg>
            <p className="text-sm">{candidates.length === 0 ? copy.noCandidates : copy.noMatches}</p>
          </div>
        ) : (
          <div className="divide-y divide-[#1E2240]">
            {filtered.map((candidate, i) => {
              const cfg = statusConfig[candidate.status] ?? statusConfig.invited;
              const avatarClass = avatarColors[i % avatarColors.length];
              const name = candidate.full_name?.trim() || copy.anonymous;
              const initials = name === copy.anonymous ? "?" : name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
              return (
                <Link href={`/candidates/${candidate.id}`} key={candidate.id} className="grid gap-4 px-4 py-4 transition-colors hover:bg-[#1E2240]/30 md:grid-cols-12 md:px-6 md:items-center group">
                  <div className="flex min-w-0 items-center gap-3 md:col-span-5">
                    <div className={`w-10 h-10 rounded-full border flex items-center justify-center text-xs font-semibold flex-shrink-0 ${avatarClass}`}>
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white transition-colors group-hover:text-[#8CB1FF]">{name}</p>
                      <p className="truncate text-xs text-slate-500">{candidate.email || "—"}</p>
                    </div>
                  </div>
                  <div className="min-w-0 md:col-span-4">
                    <p className="truncate text-sm text-slate-400">{candidate.hiring_projects?.name ?? copy.unassigned}</p>
                    <p className="mt-1 text-xs text-slate-600 md:hidden">
                      {copy.invitedAt} {new Date(candidate.created_at).toLocaleDateString(dateLocale, { month: "short", day: "numeric" })}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${cfg.class}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                      {copy.status[candidate.status] ?? cfg.label}
                    </span>
                  </div>
                  <div className="hidden text-right md:col-span-1 md:block">
                    <p className="text-xs text-slate-500">
                      {new Date(candidate.created_at).toLocaleDateString(dateLocale, { month: "short", day: "numeric" })}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        <div className="border-t border-[#1E2240] px-6 py-3 text-xs text-slate-600">
          {copy.showing(filtered.length, candidates.length)}
        </div>
      </div>

      {/* Invite modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="premium-card w-full max-w-md rounded-2xl p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-white">{copy.modalTitle}</h3>
                <p className="mt-0.5 text-xs text-slate-500">{copy.modalDescription}</p>
              </div>
              <button
                onClick={closeModal}
                className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-[#1E2240] hover:text-white"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Success state */}
            {success ? (
              <div className="space-y-4">
                {success.type === "link" ? (
                  <>
                    <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/8 p-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/15">
                        <svg className="h-4 w-4 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-emerald-300">{copy.copied}</p>
                        <p className="text-xs text-slate-500">{copy.validShare}</p>
                      </div>
                    </div>
                    <div className="rounded-xl border border-[#1E2240] bg-[#07080F] p-3">
                      <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">{copy.inviteLink}</p>
                      <div className="flex items-center gap-2">
                        <p className="flex-1 break-all font-mono text-xs text-blue-300">{success.url}</p>
                        <CopyButton text={success.url} />
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
                      <p className="text-sm font-medium text-emerald-300">{copy.emailSent}</p>
                      <p className="truncate text-xs text-slate-500">{success.to}</p>
                    </div>
                  </div>
                )}
                <button
                  type="button"
                  onClick={resetForm}
                  className="w-full cursor-pointer rounded-xl border border-[#1E2240] py-2.5 text-sm font-medium text-slate-400 transition-colors hover:text-white"
                >
                  {copy.inviteAnother}
                </button>
              </div>
            ) : (
              /* Form state */
              <div className="space-y-4">
                {error && (
                  <div className="rounded-xl border border-red-500/25 bg-red-500/10 p-3 text-sm text-red-300">
                    {error}
                  </div>
                )}

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-300">
                    {copy.candidateName}
                    <span className="ml-1.5 text-xs font-normal text-slate-500">({copy.optional})</span>
                  </label>
                  <input
                    value={form.full_name}
                    onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                    placeholder={es ? "María García" : "Jane Smith"}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-300">
                    {copy.emailAddress}
                    <span className="ml-1.5 text-xs font-normal text-slate-500">({copy.requiredEmail})</span>
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder={es ? "maria@ejemplo.com" : "jane@example.com"}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-300">{copy.project}</label>
                  {projects.length === 0 ? (
                    <p className="rounded-xl border border-[#1E2240] bg-[#07080F] px-4 py-2.5 text-sm text-slate-500">
                      {copy.noProjects} — <a href="/projects/new" className="text-[#8CB1FF] hover:underline">{copy.createFirst}</a>
                    </p>
                  ) : (
                    <select
                      value={form.project_id}
                      onChange={(e) => setForm((f) => ({ ...f, project_id: e.target.value }))}
                      className={selectClass}
                    >
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-300">{copy.assessment}</label>
                  {currentAssessments.length === 0 ? (
                    <p className="rounded-xl border border-[#1E2240] bg-[#07080F] px-4 py-2.5 text-sm text-slate-500">
                      {form.project_id ? copy.noLinked : copy.selectProjectFirst}
                    </p>
                  ) : (
                    <select
                      value={form.assessment_type}
                      onChange={(e) => setForm((f) => ({ ...f, assessment_type: e.target.value }))}
                      className={selectClass}
                    >
                      {currentAssessments.map((a) => (
                        <option key={a.name} value={a.name}>{a.label}</option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <button
                    type="button"
                    disabled={loadingMode !== null || projects.length === 0 || currentAssessments.length === 0}
                    onClick={() => handleInvite("link")}
                    className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-[#1E2240] py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-[#1E2240] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loadingMode === "link" ? (
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
                      </svg>
                    )}
                    {loadingMode === "link" ? copy.copying : copy.copyLink}
                  </button>
                  <button
                    type="button"
                    disabled={loadingMode !== null || projects.length === 0 || currentAssessments.length === 0}
                    onClick={() => handleInvite("email")}
                    className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#1D4ED8] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1e40af] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loadingMode === "email" ? (
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2Z" />
                      </svg>
                    )}
                    {loadingMode === "email" ? copy.sending : copy.sendEmail}
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
