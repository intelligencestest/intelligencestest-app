import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerSupabaseClient, createAdminClient } from "@/lib/supabase-server";
import { analyzeResult } from "@/lib/report-scoring";
import { assessmentName as termName, dimensionLabel as termDimension } from "@/lib/i18n/assessment-terms";
import {
  bandOf,
  BAND_LABEL_ES,
  contentFor,
  interviewQuestions,
  buildVerdict,
  executiveSummary,
  RECOMMENDATION_ES,
  type Band,
} from "@/lib/report-content";
import PrintButton from "./PrintButton";

// Executive document — Spanish is the production language of the report.

const BAND_TONE: Record<Band, { text: string; bg: string; bar: string }> = {
  high: { text: "#047857", bg: "#ECFDF5", bar: "#059669" },
  medium: { text: "#B45309", bg: "#FFFBEB", bar: "#D97706" },
  low: { text: "#DC2626", bg: "#FEF2F2", bar: "#DC2626" },
};

const READING_ES: Record<Band, string> = {
  high: "Fortaleza clara",
  medium: "Competente, con matices",
  low: "Área de riesgo",
};

function BandChip({ band }: { band: Band }) {
  const tone = BAND_TONE[band];
  return (
    <span
      className="inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
      style={{ color: tone.text, backgroundColor: tone.bg }}
    >
      {BAND_LABEL_ES[band]}
    </span>
  );
}

function ScoreBar({ score, band, height = 6 }: { score: number; band: Band; height?: number }) {
  return (
    <div className="w-full overflow-hidden rounded-full bg-slate-100" style={{ height }}>
      <div
        className="h-full rounded-full"
        style={{ width: `${Math.min(score, 100)}%`, backgroundColor: BAND_TONE[band].bar }}
      />
    </div>
  );
}

function SheetHeader({ candidate, section, index }: { candidate: string; section: string; index: string }) {
  return (
    <div className="mb-10 flex items-baseline justify-between border-b border-slate-200 pb-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
        Informe ejecutivo · {candidate}
      </p>
      <p className="text-[11px] font-medium text-slate-400">
        <span className="mr-3 font-semibold text-[#1D4ED8]">{index}</span>
        {section}
      </p>
    </div>
  );
}

export default async function ExecutiveReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const locale = "es";

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  const admin = createAdminClient();

  const { data: profile } = await admin.from("users").select("company_id").eq("id", user!.id).single();
  const companyId = profile?.company_id;

  const { data: candidate } = await admin
    .from("candidates")
    .select("id, full_name, email, created_at, company_id, project_id, hiring_projects(id, name)")
    .eq("id", id)
    .eq("company_id", companyId)
    .returns<{
      id: string; full_name: string; email: string; created_at: string;
      company_id: string; project_id: string; hiring_projects: { id: string; name: string } | null;
    }[]>()
    .maybeSingle();

  if (!candidate) notFound();

  const [{ data: results }, { data: projectResults }, { count: assignedCount }, { data: company }] = await Promise.all([
    admin
      .from("results")
      .select("id, score, completed_at, raw_answers, assessment_id, assessments(id, name, category)")
      .eq("candidate_id", candidate.id)
      .order("score", { ascending: false })
      .returns<{
        id: string; score: number; completed_at: string; raw_answers: unknown; assessment_id: string;
        assessments: { id: string; name: string; category: string | null } | null;
      }[]>(),
    admin
      .from("results")
      .select("candidate_id, assessment_id, score")
      .eq("project_id", candidate.project_id)
      .returns<{ candidate_id: string; assessment_id: string; score: number }[]>(),
    admin
      .from("project_assessments")
      .select("*", { count: "exact", head: true })
      .eq("project_id", candidate.project_id),
    admin.from("companies").select("name").eq("id", candidate.company_id).single(),
  ]);

  const myResults = results ?? [];
  if (myResults.length === 0) notFound();

  const peers = projectResults ?? [];
  const name = candidate.full_name?.trim() || "Candidato";
  const projectName = candidate.hiring_projects?.name ?? "—";
  const companyName = company?.name ?? "";
  const today = new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
  const reportId = `RPT-${candidate.id.slice(0, 8).toUpperCase()}`;

  // ---- Derived analysis -----------------------------------------------------
  const rows = myResults.map((r) => {
    const rawName = r.assessments?.name ?? "—";
    const displayName = termName(rawName, locale);
    const others = peers.filter((p) => p.assessment_id === r.assessment_id && p.candidate_id !== candidate.id);
    const percentile =
      others.length >= 3 ? Math.round((others.filter((o) => o.score < r.score).length / others.length) * 100) : null;
    const projectAvg =
      others.length >= 1 ? Math.round(others.reduce((s, o) => s + o.score, 0 + r.score) / (others.length + 1)) : null;
    const projectTop = others.length >= 1 ? Math.max(r.score, ...others.map((o) => o.score)) : null;
    return {
      result: r,
      rawName,
      displayName,
      band: bandOf(r.score),
      percentile,
      projectAvg: others.length >= 1 ? projectAvg : null,
      projectTop,
      peerCount: others.length,
      content: contentFor(rawName, r.assessments?.category ?? null),
      detail: r.assessments ? analyzeResult(rawName, r.raw_answers) : null,
    };
  });

  const overall = Math.round(myResults.reduce((s, r) => s + r.score, 0) / myResults.length);
  const overallBand = bandOf(overall);
  const assigned = Math.max(assignedCount ?? 0, myResults.length);
  const verdict = buildVerdict({ scores: rows.map((r) => ({ name: r.displayName, score: r.result.score })), assigned });
  const summary = executiveSummary({
    name,
    projectName,
    scores: rows.map((r) => ({ name: r.displayName, score: r.result.score })),
    verdict,
  });
  const rec = RECOMMENDATION_ES[verdict.recommendation];

  const strengthRows = rows.filter((r) => r.band === "high");
  const devRows = rows.filter((r) => r.band !== "high");
  const showBenchmarks = rows.some((r) => r.peerCount >= 1);

  const CONF_LABEL: Record<string, string> = { alta: "Alta", media: "Media", limitada: "Limitada" };

  let sectionNo = 1;
  const nextIndex = () => String(sectionNo++).padStart(2, "0");
  const summaryIdx = nextIndex();
  const resultsIdx = nextIndex();
  const meaningIdx = nextIndex();
  const strengthsIdx = strengthRows.length > 0 ? nextIndex() : null;
  const devIdx = devRows.length > 0 ? nextIndex() : null;
  const interviewIdx = nextIndex();
  const finalIdx = nextIndex();
  const recordIdx = nextIndex();

  return (
    <main className="min-h-screen bg-[#07080F] px-4 py-8 text-slate-900 print:bg-white print:p-0">
      <style>{`
        @page { size: A4; margin: 16mm 14mm; }
        .sheet { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        @media print {
          .no-print { display: none !important; }
          .sheet { box-shadow: none !important; border: none !important; border-radius: 0 !important; width: 100% !important; max-width: none !important; margin: 0 !important; padding: 0 !important; break-after: page; }
          .sheet:last-child { break-after: auto; }
          body { background: white !important; }
        }
        .avoid-break { break-inside: avoid; }
      `}</style>

      <div className="no-print mx-auto mb-5 flex max-w-[210mm] items-center justify-between gap-4">
        <div>
          <Link href={`/candidates/${candidate.id}`} className="text-[13px] font-medium text-slate-400 hover:text-slate-200">
            ← Volver al perfil
          </Link>
          <p className="mt-1 text-sm font-semibold text-white">Informe ejecutivo · {name}</p>
        </div>
        <PrintButton label="Imprimir / Guardar PDF" />
      </div>

      <div className="mx-auto max-w-[210mm] space-y-6">
        {/* ── 01 · Resumen ejecutivo ─────────────────────────────────────── */}
        <section className="sheet rounded-2xl bg-white p-12 shadow-2xl">
          <div className="flex items-start justify-between border-b-2 border-[#1D4ED8] pb-6">
            <div>
              <p className="text-[13px] font-semibold text-[#1D4ED8]">Intelligences Test</p>
              <p className="mt-0.5 text-[11px] uppercase tracking-[0.18em] text-slate-400">
                Informe ejecutivo de evaluación
              </p>
            </div>
            <div className="text-right text-[11px] leading-5 text-slate-400">
              <p className="font-semibold text-slate-500">{reportId}</p>
              <p>{today}</p>
              <p className="font-semibold uppercase tracking-wider text-slate-400">Confidencial</p>
            </div>
          </div>

          <div className="mt-10">
            <h1 className="text-[34px] font-semibold leading-tight tracking-tight text-slate-900">{name}</h1>
            <p className="mt-2 text-[15px] text-slate-500">
              {projectName}
              {companyName ? ` · ${companyName}` : ""}
            </p>
          </div>

          <div className="mt-10 grid grid-cols-[auto_1fr] items-center gap-10">
            <div
              className="flex h-36 w-36 flex-col items-center justify-center rounded-full border-[6px]"
              style={{ borderColor: BAND_TONE[overallBand].bar }}
            >
              <span className="text-5xl font-semibold tracking-tight text-slate-900">{overall}</span>
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">de 100</span>
            </div>
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2.5">
                <span
                  className="inline-flex rounded-full px-3.5 py-1.5 text-[13px] font-semibold text-white"
                  style={{ backgroundColor: verdict.recommendation === "not_recommended" ? "#DC2626" : verdict.recommendation === "proceed" ? "#047857" : "#B45309" }}
                >
                  {rec.label}
                </span>
                <BandChip band={overallBand} />
                <span className="inline-flex rounded-full border border-slate-200 px-2.5 py-0.5 text-[11px] font-semibold text-slate-500">
                  Confianza: {CONF_LABEL[verdict.confidence]}
                </span>
              </div>
              <p className="max-w-xl text-[15px] leading-7 text-slate-700">{summary}</p>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-4 gap-px overflow-hidden rounded-xl border border-slate-200 bg-slate-200">
            {[
              { label: "Evaluaciones", value: `${myResults.length}/${assigned}` },
              { label: "Promedio", value: `${overall}` },
              { label: "Mejor resultado", value: `${Math.max(...myResults.map((r) => r.score))}` },
              { label: "Posición", value: projectName.length > 18 ? `${projectName.slice(0, 17)}…` : projectName },
            ].map((cell) => (
              <div key={cell.label} className="bg-white p-4">
                <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">{cell.label}</p>
                <p className="mt-1 truncate text-lg font-semibold text-slate-900">{cell.value}</p>
              </div>
            ))}
          </div>

          <p className="mt-12 border-t border-slate-200 pt-5 text-[11px] leading-5 text-slate-400">
            {verdict.confidenceReason} Este documento se generó a partir de los resultados reales de las evaluaciones
            completadas y forma parte del expediente del proceso de selección.
          </p>
        </section>

        {/* ── 02 · Resultados ────────────────────────────────────────────── */}
        <section className="sheet rounded-2xl bg-white p-12 shadow-2xl">
          <SheetHeader candidate={name} section="Resultados de evaluaciones" index={resultsIdx} />
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Resultados</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Puntuaciones obtenidas por {name}
            {showBenchmarks ? ", comparadas con los demás candidatos evaluados en esta posición." : "."}
          </p>

          <table className="mt-8 w-full border-collapse text-left">
            <thead>
              <tr className="border-b-2 border-slate-900 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="py-3 pr-4">Evaluación</th>
                <th className="w-24 py-3 pr-4 text-right">Puntuación</th>
                {rows.some((r) => r.percentile !== null) && <th className="w-24 py-3 pr-4 text-right">Percentil</th>}
                <th className="w-20 py-3 pr-4">Banda</th>
                <th className="w-44 py-3">Lectura</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {rows.map((row) => (
                <tr key={row.result.id} className="avoid-break">
                  <td className="py-4 pr-4">
                    <p className="text-sm font-semibold text-slate-900">{row.displayName}</p>
                    <p className="mt-0.5 text-[12px] leading-5 text-slate-500">{row.content.focus}</p>
                  </td>
                  <td className="py-4 pr-4 text-right align-top">
                    <span className="text-xl font-semibold" style={{ color: BAND_TONE[row.band].text }}>
                      {row.result.score}
                    </span>
                  </td>
                  {rows.some((r) => r.percentile !== null) && (
                    <td className="py-4 pr-4 text-right align-top text-sm text-slate-600">
                      {row.percentile !== null ? `P${row.percentile}` : "—"}
                    </td>
                  )}
                  <td className="py-4 pr-4 align-top"><BandChip band={row.band} /></td>
                  <td className="py-4 align-top text-[13px] leading-5 text-slate-600">{READING_ES[row.band]}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {showBenchmarks && (
            <div className="avoid-break mt-10">
              <h3 className="text-sm font-semibold text-slate-900">Comparativa dentro del proceso</h3>
              <div className="mt-4 space-y-5">
                {rows.filter((r) => r.projectAvg !== null).map((row) => (
                  <div key={`bench-${row.result.id}`}>
                    <p className="mb-1.5 text-[12px] font-medium text-slate-600">{row.displayName}</p>
                    <div className="space-y-1">
                      {[
                        { label: name, value: row.result.score, color: BAND_TONE[row.band].bar, bold: true },
                        { label: "Promedio del proceso", value: row.projectAvg!, color: "#94A3B8", bold: false },
                        { label: "Mejor resultado", value: row.projectTop!, color: "#1D4ED8", bold: false },
                      ].map((bar) => (
                        <div key={bar.label} className="flex items-center gap-3">
                          <span className={`w-44 text-[11px] ${bar.bold ? "font-semibold text-slate-800" : "text-slate-500"}`}>
                            {bar.label}
                          </span>
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                            <div className="h-2 rounded-full" style={{ width: `${bar.value}%`, backgroundColor: bar.color }} />
                          </div>
                          <span className="w-8 text-right text-[11px] font-semibold text-slate-700">{bar.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[11px] text-slate-400">
                La comparativa incluye únicamente candidatos evaluados en esta misma posición.
              </p>
            </div>
          )}
        </section>

        {/* ── 03 · Qué significan los resultados ─────────────────────────── */}
        <section className="sheet rounded-2xl bg-white p-12 shadow-2xl">
          <SheetHeader candidate={name} section="Interpretación de resultados" index={meaningIdx} />
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Qué significan estos resultados</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Implicaciones para el negocio según la banda real obtenida en cada instrumento.
          </p>

          <div className="mt-8 space-y-8">
            {rows.map((row) => {
              const meaning = row.content.meaning[row.band];
              return (
                <article key={`meaning-${row.result.id}`} className="avoid-break rounded-xl border border-slate-200 p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-[15px] font-semibold text-slate-900">{row.displayName}</h3>
                      <p className="mt-0.5 text-[12px] text-slate-500">{row.content.focus}</p>
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-2">
                      <span className="text-lg font-semibold" style={{ color: BAND_TONE[row.band].text }}>{row.result.score}</span>
                      <BandChip band={row.band} />
                    </div>
                  </div>

                  <div className="mt-4"><ScoreBar score={row.result.score} band={row.band} /></div>

                  {row.detail?.dimensions && row.detail.dimensions.length > 0 && (
                    <div className="mt-5 grid grid-cols-2 gap-x-8 gap-y-2.5">
                      {row.detail.dimensions.map((d) => {
                        const max = d.max ?? Math.max(...row.detail!.dimensions!.map((x) => x.max ?? x.value), 1);
                        return (
                          <div key={d.label} className="flex items-center gap-3">
                            <span className="w-32 truncate text-[11px] text-slate-500">{termDimension(d.label, locale)}</span>
                            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                              <div className="h-1.5 rounded-full bg-[#1D4ED8]" style={{ width: `${Math.min((d.value / max) * 100, 100)}%` }} />
                            </div>
                            <span className="w-10 text-right text-[11px] font-semibold text-slate-600">
                              {d.value}{d.max ? `/${d.max}` : ""}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {row.detail?.correct && (
                    <p className="mt-4 text-[12px] text-slate-500">
                      {row.detail.correct.correct} de {row.detail.correct.total} respuestas correctas.
                    </p>
                  )}

                  <div className="mt-5 grid grid-cols-[1.2fr_1fr] gap-6">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Comportamientos probables</p>
                      <ul className="mt-2 space-y-1.5">
                        {meaning.behaviors.map((b) => (
                          <li key={b} className="flex gap-2 text-[13px] leading-5 text-slate-700">
                            <span className="mt-[7px] h-1 w-1 flex-shrink-0 rounded-full bg-slate-400" aria-hidden="true" />
                            {b}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Nivel de riesgo</p>
                        <p className="mt-1.5 text-[13px] leading-5 text-slate-700">{meaning.risk}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Para el equipo de selección</p>
                        <p className="mt-1.5 text-[13px] leading-5 text-slate-700">{meaning.considerations}</p>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* ── 04 · Fortalezas (solo con evidencia) ───────────────────────── */}
        {strengthsIdx && (
          <section className="sheet rounded-2xl bg-white p-12 shadow-2xl">
            <SheetHeader candidate={name} section="Fortalezas" index={strengthsIdx} />
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Fortalezas observadas</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Derivadas únicamente de los instrumentos donde {name} obtuvo resultados en banda alta.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-4">
              {strengthRows.flatMap((row) =>
                row.content.strengths.slice(0, 3).map((s) => (
                  <div key={`${row.result.id}-${s}`} className="avoid-break rounded-xl border border-slate-200 p-5">
                    <div className="flex items-start gap-3">
                      <span
                        className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full"
                        style={{ backgroundColor: "#ECFDF5", color: "#047857" }}
                      >
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      <div>
                        <p className="text-[14px] font-semibold leading-5 text-slate-900">{s}</p>
                        <p className="mt-1 text-[11px] text-slate-400">
                          {row.displayName} · {row.result.score}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {/* ── 05 · Áreas de desarrollo (solo con evidencia) ──────────────── */}
        {devIdx && (
          <section className="sheet rounded-2xl bg-white p-12 shadow-2xl">
            <SheetHeader candidate={name} section="Áreas de desarrollo" index={devIdx} />
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Áreas de desarrollo</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Presentadas con contexto: riesgo potencial, oportunidad de desarrollo y qué explorar en entrevista.
            </p>
            <div className="mt-8 space-y-6">
              {devRows.map((row) => (
                <article key={`dev-${row.result.id}`} className="avoid-break rounded-xl border border-slate-200 p-6">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-[15px] font-semibold text-slate-900">{row.displayName}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold" style={{ color: BAND_TONE[row.band].text }}>{row.result.score}</span>
                      <BandChip band={row.band} />
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-6">
                    {[
                      { title: "Riesgo potencial", items: row.content.development.risks },
                      { title: "Oportunidad de desarrollo", items: row.content.development.coaching },
                      { title: "Explorar en entrevista", items: row.content.development.topics },
                    ].map((col) => (
                      <div key={col.title}>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{col.title}</p>
                        <ul className="mt-2 space-y-1.5">
                          {col.items.map((item) => (
                            <li key={item} className="flex gap-2 text-[12px] leading-5 text-slate-700">
                              <span className="mt-[7px] h-1 w-1 flex-shrink-0 rounded-full bg-slate-400" aria-hidden="true" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* ── 06 · Guía de entrevista ────────────────────────────────────── */}
        <section className="sheet rounded-2xl bg-white p-12 shadow-2xl">
          <SheetHeader candidate={name} section="Guía de entrevista" index={interviewIdx} />
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Guía de entrevista</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Preguntas seleccionadas según la puntuación real: los resultados altos se validan; los bajos se exploran.
          </p>
          <div className="mt-8 space-y-7">
            {rows.map((row) => {
              const guide = interviewQuestions(row.content, row.result.score);
              return (
                <div key={`iv-${row.result.id}`} className="avoid-break">
                  <div className="flex items-baseline justify-between border-b border-slate-200 pb-2">
                    <h3 className="text-[14px] font-semibold text-slate-900">{row.displayName}</h3>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#1D4ED8]">{guide.tone}</span>
                  </div>
                  <ul className="mt-3 space-y-2.5">
                    {guide.questions.map((q) => (
                      <li key={q} className="flex items-start gap-3">
                        <span className="mt-0.5 h-4 w-4 flex-shrink-0 rounded border border-slate-300" aria-hidden="true" />
                        <p className="text-[13px] leading-6 text-slate-700">{q}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── 07 · Recomendación final ───────────────────────────────────── */}
        <section className="sheet rounded-2xl bg-white p-12 shadow-2xl">
          <SheetHeader candidate={name} section="Recomendación final" index={finalIdx} />
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Recomendación final</h2>

          <div
            className="mt-8 rounded-xl p-7"
            style={{ backgroundColor: verdict.recommendation === "not_recommended" ? "#FEF2F2" : verdict.recommendation === "proceed" ? "#ECFDF5" : "#FFFBEB" }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Recomendación</p>
            <p
              className="mt-1 text-[26px] font-semibold tracking-tight"
              style={{ color: verdict.recommendation === "not_recommended" ? "#DC2626" : verdict.recommendation === "proceed" ? "#047857" : "#B45309" }}
            >
              {rec.label}
            </p>
            <p className="mt-2 text-[13px] text-slate-600">
              Confianza {CONF_LABEL[verdict.confidence].toLowerCase()} — {verdict.confidenceReason}
            </p>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-8">
            <div>
              <h3 className="text-[13px] font-semibold uppercase tracking-wider text-slate-500">Por qué</h3>
              <ul className="mt-3 space-y-2">
                {verdict.reasons.map((reason) => (
                  <li key={reason} className="flex gap-2.5 text-[13px] leading-6 text-slate-700">
                    <span className="mt-[9px] h-1 w-1 flex-shrink-0 rounded-full bg-[#1D4ED8]" aria-hidden="true" />
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-7">
              <div>
                <h3 className="text-[13px] font-semibold uppercase tracking-wider text-slate-500">Riesgos de contratación</h3>
                <ul className="mt-3 space-y-2">
                  {verdict.risks.map((risk) => (
                    <li key={risk} className="flex gap-2.5 text-[13px] leading-6 text-slate-700">
                      <span className="mt-[9px] h-1 w-1 flex-shrink-0 rounded-full bg-[#DC2626]" aria-hidden="true" />
                      {risk}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-[13px] font-semibold uppercase tracking-wider text-slate-500">Próximos pasos sugeridos</h3>
                <ol className="mt-3 space-y-2">
                  {verdict.nextSteps.map((step, i) => (
                    <li key={step} className="flex gap-3 text-[13px] leading-6 text-slate-700">
                      <span className="font-semibold text-[#1D4ED8]">{i + 1}.</span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </section>

        {/* ── 08 · Registro de revisión ──────────────────────────────────── */}
        <section className="sheet rounded-2xl bg-white p-12 shadow-2xl">
          <SheetHeader candidate={name} section="Registro de revisión" index={recordIdx} />
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Registro de revisión</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Para el expediente del proceso. Complete tras la reunión de decisión.
          </p>

          <div className="mt-10 space-y-8">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Revisado por</p>
                <div className="mt-6 border-b border-slate-300" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Cargo</p>
                <div className="mt-6 border-b border-slate-300" />
              </div>
            </div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Decisión</p>
              <div className="mt-3 grid grid-cols-4 gap-3">
                {["Avanzar a entrevista", "Extender oferta", "Rechazar", "Mantener en reserva"].map((option) => (
                  <div key={option} className="flex items-center gap-2.5 rounded-lg border border-slate-200 px-3 py-2.5">
                    <span className="h-4 w-4 flex-shrink-0 rounded border border-slate-300" aria-hidden="true" />
                    <span className="text-[12px] font-medium text-slate-700">{option}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Comentarios</p>
              <div className="mt-6 space-y-6">
                <div className="border-b border-slate-300" />
                <div className="border-b border-slate-300" />
                <div className="border-b border-slate-300" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 pt-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Firma</p>
                <div className="mt-10 border-b border-slate-300" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Fecha</p>
                <div className="mt-10 border-b border-slate-300" />
              </div>
            </div>
          </div>

          <p className="mt-14 border-t border-slate-200 pt-5 text-[10px] leading-5 text-slate-400">
            {reportId} · Generado el {today} por Intelligences Test para {companyName || "el equipo de selección"}. Documento
            confidencial: contiene resultados de evaluación de {name} para la posición de {projectName}. Las puntuaciones
            reflejan el desempeño en los instrumentos completados y deben interpretarse junto con la entrevista y las
            referencias.
          </p>
        </section>
      </div>
    </main>
  );
}
