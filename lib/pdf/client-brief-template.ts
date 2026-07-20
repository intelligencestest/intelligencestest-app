import fs from "node:fs";
import path from "node:path";
import { DEFAULT_REPORT_PRIMARY_COLOR, normalizePrimaryColor } from "@/lib/security/company-branding";

/**
 * HTML generator for the client-facing shortlist brief. Rendered to PDF via
 * lib/pdf/render-pdf.ts (Puppeteer), completely separate from the internal
 * report's @react-pdf/renderer pipeline (lib/pdf/server.ts) — that pipeline
 * is untouched by this file.
 *
 * Visual design ported from the editorial handoff package (Fraunces/Public
 * Sans, radar+score-bar candidate cards, 4-question interview grid). The
 * handoff only specifies the 1-2 primary candidate case; the >2 case
 * (compact grid + backup bench, from the openings_count scaling work) is
 * this file's own extension of the same visual language, not part of the
 * handoff.
 *
 * This is a client-safe document: no verification-status language, no
 * incomplete/lower-priority candidates. Only the top recommended candidates
 * (selected by the caller — see app/api/reports/client-brief/route.ts) are
 * passed in.
 */

export type ClientBriefLocale = "en" | "es" | "fr";

export interface ClientBriefRadarPoint {
  /** Competency label, already localized by the caller. */
  label: string;
  /** 0-5 scale. */
  value: number;
}

export interface ClientBriefCandidateCard {
  name: string;
  /** e.g. "strongest overall alignment, recommended for interview" — combined with name as "<strong>{name}</strong> — {verdict}". */
  verdict: string;
  isPrimary: boolean;
  /** 0-100, shown as "Overall XX / 100" -- same scale as ClientBriefBenchEntry.score
   * so a reader never sees two different scales for "overall score" in one document. */
  overallScore: number;
  /** Cohort percentile (0-100, rounded for display) — evidence-methodology Stage 1. */
  percentile?: number;
  radar: ClientBriefRadarPoint[];
  /** Why the confidence label reads the way it does -- derived only from the
   * competency-evidence scores already rendered on this card (via the same
   * MAD-based consistency measure the real confidence score uses), never
   * from confidenceCaveat/limitations/risks, which stay internal-only. */
  confidenceNote?: { kind: "consistent"; competencyCount: number } | { kind: "spread"; lowestLabel: string };
}

export interface ClientBriefInterviewQuestion {
  /** Short competency label shown top-right of the question card, e.g. "Stakeholder judgement". */
  focusLabel: string;
  question: string;
  verifies: string;
}

export interface ClientBriefInterviewPage {
  name: string;
  /** Short status pill, e.g. "Recommended for interview". */
  verdict: string;
  isPrimary: boolean;
  objectiveTitle: string;
  objectiveCopy: string;
  /** Up to 4 — rendered as a 2x2 grid. */
  questions: ClientBriefInterviewQuestion[];
}

/** Backup-bench row: rank + name + score + verdict only, no chart, no
 * interview-kit page. See lib/pdf/client-brief-selection.ts tierSelection. */
export interface ClientBriefBenchEntry {
  rank: number;
  name: string;
  /** 0-100. */
  score: number;
  percentile?: number;
  verdict: string;
}

export interface ShortlistData {
  locale: ClientBriefLocale;
  agencyName: string;
  agencyTagline?: string;
  /** Strictly sanitized HTTPS image URL. Omitted -> agency-initial monogram, no placeholder mark. */
  agencyLogoUrl?: string;
  roleTitle: string;
  shortlistName: string;
  /** Optional and off by default — see lib/pdf/agency-brief/types.ts for the same convention. */
  clientName?: string;
  /** Pre-formatted display date, e.g. "15 July 2026". */
  date: string;
  /** 3-4 sentence narrative paragraph, generated per-shortlist (see lib/claude.ts). */
  narrative: string;
  /** Primary tier only (rank 1..openings_count) — full card treatment. */
  cards: ClientBriefCandidateCard[];
  /** Backup tier (rank openings_count+1..target) — compact rank/name/score/verdict row, no chart, own section. Omit or empty when there's no backup bench. */
  benchEntries?: ClientBriefBenchEntry[];
  /** Candidates trimmed from the backup bench to keep the document under the page budget — must never be a silent drop (see planClientBriefDocuments). */
  benchOmittedCount?: number;
  /** One interview-kit page per PRIMARY candidate only — the backup bench never gets one. */
  interviewPages: ClientBriefInterviewPage[];
  /** Client-visible cutoff transparency (evidence-methodology Stage 1): when
   * "policy_fallback", the document says the pool was continuous and the
   * operational buffer was applied — never implying a distributional break. */
  cutoffDecisionType?: "natural_break" | "policy_fallback";
  /** Agency brand color. Falls back to the editorial template's own accent when not set. */
  accentColor?: string;
  /** Optional agency-supplied note rendered in the footer area on every page. */
  reportFooterText?: string;
}

const DEFAULT_ACCENT = DEFAULT_REPORT_PRIMARY_COLOR;
const COMPACT_GRID_PAGE_SIZE = 9; // 3-per-row compact grid, 3 rows per physical page.

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/** Safe to embed inside a <script> block: JSON-encodes and neutralizes </script. */
function toInlineJson(value: unknown): string {
  return JSON.stringify(value).replace(/<\/script/gi, "<\\/script");
}

function fontFileUrl(file: string): string {
  const fontPath = path.join(process.cwd(), "public", "fonts", file);
  return `data:font/woff2;base64,${fs.readFileSync(fontPath).toString("base64")}`;
}

function chunk<T>(items: T[], size: number): T[][] {
  const groups: T[][] = [];
  for (let i = 0; i < items.length; i += size) groups.push(items.slice(i, i + size));
  return groups;
}

function copy(locale: ClientBriefLocale) {
  const es = locale === "es";
  const fr = locale === "fr";
  return {
    confidential: es ? "Confidencial" : fr ? "Confidentiel" : "Confidential",
    shortlistRecommendation: es ? "Recomendación de shortlist" : fr ? "Recommandation de shortlist" : "Shortlist recommendation",
    coverTitle: es ? "Recomendación de entrevista de candidatos" : fr ? "Recommandation d'entretien candidats" : "Candidate interview recommendation",
    preparedFor: es ? "Preparado para" : fr ? "Préparé pour" : "Prepared for",
    preparedOn: es ? "Preparado el" : fr ? "Préparé le" : "Prepared on",
    disclaimerLabel: es ? "Evaluación profesional:" : fr ? "Évaluation professionnelle :" : "Professional evaluation:",
    disclaimer: (agency: string) =>
      es
        ? `Este informe respalda la evaluación profesional de la agencia. No constituye una decisión de contratación automatizada; la recomendación final corresponde a ${agency}.`
        : fr
        ? `Ce rapport soutient l'évaluation professionnelle de l'agence. Il ne constitue pas une décision d'embauche automatisée — la recommandation finale revient à ${agency}.`
        : `This report supports the agency's professional evaluation. It does not constitute an automated hiring decision — the final recommendation remains with ${agency}.`,
    disclaimerShort: es
      ? "Este informe respalda la evaluación profesional y no constituye una decisión de contratación automatizada."
      : fr
      ? "Ce rapport soutient l'évaluation professionnelle et ne constitue pas une décision d'embauche automatisée."
      : "This report supports professional evaluation and does not constitute an automated hiring decision.",
    shortlistDecisionBrief: es ? "Informe de decisión de shortlist" : fr ? "Note de décision shortlist" : "Shortlist decision brief",
    candidateLabel: (n: number) => (es ? `Candidato ${String(n).padStart(2, "0")}` : fr ? `Candidat ${String(n).padStart(2, "0")}` : `Candidate ${String(n).padStart(2, "0")}`),
    assessmentProfile: es ? "Perfil de evaluación" : fr ? "Profil d'évaluation" : "Assessment profile",
    overall: es ? "Total" : fr ? "Total" : "Overall",
    recommendedPlan: es ? "Plan de entrevista recomendado" : fr ? "Plan d'entretien recommandé" : "Recommended interview plan",
    recommendedPlanCopy: (names: string) =>
      es
        ? `Entreviste a ${names} usando las guías específicas de cada candidato en las páginas siguientes. Las preguntas están diseñadas para convertir la evidencia de la evaluación en una entrevista estructurada y comparable, manteniendo la decisión final en el equipo de contratación.`
        : fr
        ? `Rencontrez ${names} à l'aide des guides spécifiques à chaque candidat dans les pages suivantes. Les questions sont conçues pour transformer les preuves d'évaluation en un entretien structuré et comparable, tout en laissant la décision finale à l'équipe de recrutement.`
        : `Interview ${names} using the candidate-specific guides on the following pages. The questions are designed to turn the assessment evidence into a structured, comparable client interview while keeping the final decision with the hiring team.`,
    recommendedPlanCopyMany: (count: number) =>
      es
        ? `Entreviste a los ${count} candidatos principales usando las guías específicas de cada candidato en las páginas siguientes. Las preguntas están diseñadas para convertir la evidencia de la evaluación en una entrevista estructurada y comparable, manteniendo la decisión final en el equipo de contratación.`
        : fr
        ? `Rencontrez les ${count} candidats principaux à l'aide des guides spécifiques à chaque candidat dans les pages suivantes. Les questions sont conçues pour transformer les preuves d'évaluation en un entretien structuré et comparable, tout en laissant la décision finale à l'équipe de recrutement.`
        : `Interview the top ${count} candidates using the candidate-specific guides on the following pages. The questions are designed to turn the assessment evidence into a structured, comparable client interview while keeping the final decision with the hiring team.`,
    structuredInterviewGuide: es ? "Guía de entrevista estructurada" : fr ? "Guide d'entretien structuré" : "Structured interview guide",
    interviewObjective: es ? "Objetivo de la entrevista" : fr ? "Objectif de l'entretien" : "Interview objective",
    objectiveTitle: es
      ? "Traducir la evidencia en ejemplos específicos del puesto"
      : fr
      ? "Traduire les preuves en exemples spécifiques au poste"
      : "Translate the assessment evidence into role-specific examples",
    whatThisVerifies: es ? "Qué verifica esto" : fr ? "Ce que cela vérifie" : "What this verifies",
    useConsistently: es ? "Usar de forma consistente" : fr ? "Utiliser de façon cohérente" : "Use consistently",
    useConsistentlyCopy: es
      ? "Haga las mismas preguntas clave a cada finalista y use preguntas de seguimiento para examinar la evidencia y las decisiones detrás de cada ejemplo."
      : fr
      ? "Posez les mêmes questions clés à chaque finaliste, puis utilisez des relances pour examiner les preuves et les décisions derrière chaque exemple."
      : "Ask the same core questions for every finalist, then use follow-ups to examine the evidence and decisions behind each example.",
    engineCredit: es ? "Motor de evaluación por" : fr ? "Moteur d'évaluation par" : "Assessment engine by",
    backupBench: es ? "Candidatos suplentes, clasificados" : fr ? "Candidats de réserve, classés" : "Backup candidates, ranked",
    backupBenchSubtitle: es
      ? "Banco clasificado si un candidato principal no se presenta o no supera la entrevista."
      : fr
      ? "Réserve classée en cas d'indisponibilité d'un candidat principal ou d'échec à l'entretien."
      : "Ranked bench if a primary candidate doesn't show up or doesn't pass interview.",
    benchOmitted: (n: number) =>
      es
        ? `${n} candidatos suplentes adicionales fueron evaluados pero omitidos de este documento para mantener una extensión manejable.`
        : fr
        ? `${n} candidats de réserve supplémentaires ont été évalués mais omis de ce document afin d'en conserver une longueur raisonnable.`
        : `${n} additional backup candidates were evaluated but omitted from this document to keep it a manageable length.`,
    fullShortlist: es ? "Shortlist completa" : fr ? "Shortlist complète" : "Full shortlist",
    poolContinuousNote: es
      ? "Nota metodológica: el número de candidatos recomendados refleja un grupo continuo — no se encontró un corte natural claro en las puntuaciones dentro de la ventana de revisión, por lo que se aplicó el margen operativo estándar."
      : fr
      ? "Note méthodologique : le nombre de candidats recommandés reflète un vivier continu — aucune rupture nette des scores n'a été constatée dans la fenêtre d'examen ; la marge opérationnelle standard a donc été appliquée."
      : "Methodology note: the recommended count reflects a continuous candidate pool — no clear natural break in scores was found within the review window, so the standard operational buffer was applied.",
    percentileLabel: (n: number) => {
      if (es) return `percentil ${n}`;
      if (fr) return `${n}e percentile`;
      const suffix = n % 100 >= 11 && n % 100 <= 13 ? "th" : n % 10 === 1 ? "st" : n % 10 === 2 ? "nd" : n % 10 === 3 ? "rd" : "th";
      return `${n}${suffix} percentile`;
    },
    recommendedCandidates: (n: number) =>
      es ? `${n} candidatos recomendados` : fr ? `${n} candidats recommandés` : `${n} candidates recommended`,
    confidenceNoteConsistent: (n: number) =>
      es
        ? `consistente en las ${n} competencias evaluadas`
        : fr
        ? `résultats cohérents sur les ${n} compétences évaluées`
        : `consistent across all ${n} competencies evaluated`,
    confidenceNoteSpread: (lowestLabel: string) =>
      es
        ? `mayor variación entre competencias — más bajo en ${lowestLabel.toLowerCase()}`
        : fr
        ? `écart plus marqué entre les compétences — plus faible en ${lowestLabel.toLowerCase()}`
        : `wider spread across competencies — lower on ${lowestLabel.toLowerCase()}`,
  };
}

/** Default interview-guide objective title (ClientBriefInterviewPage.objectiveTitle)
 * when the caller has no bespoke per-candidate framing — exported so
 * app/api/reports/client-brief/route.ts doesn't duplicate this locale text. */
export function defaultInterviewObjectiveTitle(locale: ClientBriefLocale): string {
  return copy(locale).objectiveTitle;
}

function joinNames(locale: ClientBriefLocale, names: string[]): string {
  if (names.length <= 1) return names[0] ?? "";
  const and = locale === "es" ? "y" : locale === "fr" ? "et" : "and";
  return `${names.slice(0, -1).join(", ")} ${and} ${names[names.length - 1]}`;
}

/** Wraps a label onto multiple lines at word boundaries for Chart.js pointLabels
 * (accepts an array of strings per label, one per line). Achieves the same
 * "never cut a word mid-way" goal as the handoff's hardcoded RADAR_LABELS
 * arrays, but works for arbitrary/localized competency labels instead of a
 * fixed known set. */
function wrapLabel(label: string, maxCharsPerLine = 14): string[] {
  const words = label.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxCharsPerLine && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function radarChartConfig(radar: ClientBriefRadarPoint[], color: string, fill: string) {
  return {
    type: "radar",
    data: {
      labels: radar.map((point) => wrapLabel(point.label)),
      datasets: [
        {
          data: radar.map((point) => point.value),
          borderColor: color,
          backgroundColor: fill,
          pointBackgroundColor: color,
          pointBorderColor: "#ffffff",
          pointBorderWidth: 1.2,
          pointRadius: 2.7,
          pointHoverRadius: 2.7,
          borderWidth: 2.1,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      devicePixelRatio: 2,
      events: [],
      layout: { padding: { top: 8, right: 12, bottom: 5, left: 12 } },
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      scales: {
        r: {
          min: 0,
          max: 5,
          beginAtZero: true,
          angleLines: { color: "rgba(17, 24, 39, 0.13)", lineWidth: 0.8 },
          grid: { circular: true, color: "rgba(17, 24, 39, 0.13)", lineWidth: 0.8 },
          ticks: { display: true, stepSize: 1, showLabelBackdrop: false, color: "#8a929d", font: { family: "Public Sans Local", size: 8, weight: "400" }, z: 1 },
          pointLabels: { display: true, centerPointLabels: false, padding: 7, color: "#3f4856", font: { family: "Public Sans Local", size: 9, weight: "500", lineHeight: 1.15 } },
        },
      },
    },
  };
}

/** Small radar used in the compact grid (>2 primary candidates) — same config, smaller. */
function compactRadarChartConfig(radar: ClientBriefRadarPoint[], color: string, fill: string) {
  const base = radarChartConfig(radar, color, fill);
  return {
    ...base,
    data: { ...base.data, labels: radar.map((point) => wrapLabel(point.label, 10)) },
    options: {
      ...base.options,
      layout: { padding: { top: 4, right: 6, bottom: 2, left: 6 } },
      scales: {
        r: {
          ...base.options.scales.r,
          ticks: { ...base.options.scales.r.ticks, display: false },
          pointLabels: { ...base.options.scales.r.pointLabels, padding: 4, font: { family: "Public Sans Local", size: 6.5, weight: "500", lineHeight: 1.1 } },
        },
      },
    },
  };
}

function footerHtml(c: ReturnType<typeof copy>, left: string, right: string): string {
  return `
    <footer class="page-footer">
      <span>${left}</span>
      <span class="page-number">${right}</span>
    </footer>`;
}

function reportLegalHtml(
  c: ReturnType<typeof copy>,
  disclaimer: string,
  left: string,
  right: string,
  reportFooterText?: string
): string {
  return `
    <div class="report-legal">
      ${reportFooterText ? `<p class="report-custom-note">${escapeHtml(reportFooterText)}</p>` : ""}
      <p class="report-disclaimer">${disclaimer}</p>
      ${footerHtml(c, left, right)}
    </div>`;
}

function coverPageHtml(data: ShortlistData, c: ReturnType<typeof copy>): string {
  const preparedForValue = data.clientName ? escapeHtml(data.clientName) : escapeHtml(data.shortlistName);
  return `
  <section class="page cover" aria-label="Report cover">
    <div class="page-inner">
      <div class="cover-topline">
        <div class="agency-logo">
          ${
            data.agencyLogoUrl
              ? `<img class="agency-logo-img" src="${escapeHtml(data.agencyLogoUrl)}" alt="" />`
              : `<div class="agency-monogram">${escapeHtml(data.agencyName.charAt(0).toUpperCase())}</div>`
          }
          <div class="agency-wordmark">
            <strong>${escapeHtml(data.agencyName)}</strong>
            ${data.agencyTagline ? `<span>${escapeHtml(data.agencyTagline)}</span>` : ""}
          </div>
        </div>
        <div class="cover-document-type">${escapeHtml(c.confidential)}</div>
      </div>

      <div class="cover-main">
        <div class="cover-kicker">${escapeHtml(c.shortlistRecommendation)}</div>
        <h1>${escapeHtml(c.coverTitle)}</h1>
        <p class="cover-role">${escapeHtml(data.roleTitle)}</p>
        <div class="cover-accent-line"></div>
      </div>

      <div class="cover-meta">
        <div>
          <span class="meta-label">${escapeHtml(c.preparedFor)}</span>
          <span class="meta-value">${preparedForValue}</span>
        </div>
        <div>
          <span class="meta-label">${escapeHtml(c.preparedOn)}</span>
          <span class="meta-value">${escapeHtml(data.date)}</span>
        </div>
      </div>

      ${reportLegalHtml(
        c,
        `<strong>${escapeHtml(c.disclaimerLabel)}</strong> ${escapeHtml(c.disclaimer(data.agencyName))}`,
        `${escapeHtml(c.confidential)} · ${escapeHtml(data.agencyName)}`,
        `${escapeHtml(c.preparedFor)} ${preparedForValue}`,
        data.reportFooterText
      )}
    </div>
  </section>`;
}

function confidenceNoteText(note: ClientBriefCandidateCard["confidenceNote"], c: ReturnType<typeof copy>): string | null {
  if (!note) return null;
  return note.kind === "consistent" ? c.confidenceNoteConsistent(note.competencyCount) : c.confidenceNoteSpread(note.lowestLabel);
}

function detailedCandidateCardHtml(card: ClientBriefCandidateCard, index: number, canvasId: string, c: ReturnType<typeof copy>): string {
  const tier = card.isPrimary ? "lead" : "alternate";
  const rows = card.radar
    .map(
      (point) => `
        <div class="dimension-row">
          <span class="dimension-label">${escapeHtml(point.label)}</span>
          <span class="dimension-track"><span class="dimension-fill" style="width:${Math.max(0, Math.min(100, (point.value / 5) * 100))}%"></span></span>
        </div>`
    )
    .join("");

  return `
        <article class="candidate-card ${tier}">
          <header class="candidate-card-header">
            <span class="candidate-index">${escapeHtml(c.candidateLabel(index + 1))}</span>
            <h3 class="candidate-leadline"><strong>${escapeHtml(card.name)}</strong> — ${escapeHtml(card.verdict)}</h3>
          </header>
          <div class="score-support"><span>${escapeHtml(c.assessmentProfile)}</span><strong>${escapeHtml(c.overall)} ${Math.round(card.overallScore)} / 100${card.percentile !== undefined ? ` · ${escapeHtml(c.percentileLabel(card.percentile))}` : ""}</strong></div>
          ${confidenceNoteText(card.confidenceNote, c) ? `<p class="confidence-note">${escapeHtml(confidenceNoteText(card.confidenceNote, c)!)}</p>` : ""}
          <div class="radar-wrap"><canvas id="${canvasId}"></canvas></div>
          <div class="dimension-list">${rows}</div>
        </article>`;
}

function executiveSummaryPageHtml(data: ShortlistData, c: ReturnType<typeof copy>, accent: string, pageLabel: string): string {
  // The approved editorial layout spotlights at most two detailed cards side
  // by side. When more candidates are recommended, the full ranked set
  // follows on the compact-grid pages — this page stays the reference spread.
  const spotlight = data.cards.slice(0, 2);
  // The recommended set the client is told about = primary cards + the ranked
  // bench (including any bench entries trimmed for the page budget) — this
  // must agree with the narrative, which counts the full selected set.
  const totalRecommended = data.cards.length + (data.benchEntries?.length ?? 0) + (data.benchOmittedCount ?? 0);
  const cardsHtml = spotlight.map((card, index) => detailedCandidateCardHtml(card, index, `spotlight-${index}`, c)).join("");
  const names = joinNames(data.locale, spotlight.map((card) => card.name));
  const title =
    totalRecommended === 1
      ? (data.locale === "es" ? "Un candidato recomendado para entrevista" : data.locale === "fr" ? "Un candidat recommandé pour entretien" : "One candidate recommended for interview")
      : totalRecommended === 2
      ? (data.locale === "es" ? "Dos candidatos recomendados para entrevista" : data.locale === "fr" ? "Deux candidats recommandés pour entretien" : "Two candidates recommended for interview")
      : c.recommendedCandidates(totalRecommended);
  const planCopy = totalRecommended > 2 ? c.recommendedPlanCopyMany(data.cards.length) : c.recommendedPlanCopy(names);

  return `
  <section class="page summary" aria-label="Executive summary">
    <div class="page-inner">
      <div class="summary-header">
        <div class="summary-header-copy">
          <div class="eyebrow">${escapeHtml(c.shortlistDecisionBrief)}</div>
          <h2 class="section-title">${escapeHtml(title)}</h2>
        </div>
        <div class="summary-date">${escapeHtml(data.roleTitle)}<br>${escapeHtml(data.date)}</div>
      </div>

      <p class="executive-narrative">${escapeHtml(data.narrative)}</p>

      <div class="candidate-grid" style="grid-template-columns: repeat(${Math.min(2, spotlight.length)}, minmax(0, 1fr));">
        ${cardsHtml}
      </div>

      <div class="decision-strip">
        <h3>${escapeHtml(c.recommendedPlan)}</h3>
        <p>${escapeHtml(planCopy)}</p>
      </div>
      ${data.cutoffDecisionType === "policy_fallback" ? `<p class="cutoff-note">${escapeHtml(c.poolContinuousNote)}</p>` : ""}

      ${reportLegalHtml(c, escapeHtml(c.disclaimerShort), `${escapeHtml(c.confidential)} · ${escapeHtml(c.preparedFor)} ${data.clientName ? escapeHtml(data.clientName) : escapeHtml(data.shortlistName)}`, pageLabel, data.reportFooterText)}
    </div>
  </section>`;
}

function compactCardHtml(card: ClientBriefCandidateCard, accent: string, canvasId: string, rank: number, c: ReturnType<typeof copy>): string {
  // Score bars mirror the detailed card's dimension list (handoff: bars keep
  // the difference legible at small sizes and in grayscale print).
  const bars = card.radar
    .map(
      (point) => `
        <div class="compact-card__bar-row">
          <span class="compact-card__bar-label">${escapeHtml(point.label)}</span>
          <span class="compact-card__bar-track"><span class="compact-card__bar-fill" style="width:${Math.max(0, Math.min(100, (point.value / 5) * 100))}%"></span></span>
        </div>`
    )
    .join("");

  return `
    <div class="compact-card${card.isPrimary ? " compact-card--primary" : ""}">
      <div class="compact-card__header">
        <span class="compact-card__rank" style="${card.isPrimary ? `background:${accent};` : ""}">${rank}</span>
        <span class="compact-card__name">${escapeHtml(card.name)}</span>
      </div>
      <div class="compact-card__verdict">${escapeHtml(card.verdict)}</div>
      <div class="compact-card__score">${escapeHtml(c.overall)} <strong>${Math.round(card.overallScore)} / 100</strong>${card.percentile !== undefined ? ` · ${escapeHtml(c.percentileLabel(card.percentile))}` : ""}</div>
      ${confidenceNoteText(card.confidenceNote, c) ? `<div class="compact-card__confidence-note">${escapeHtml(confidenceNoteText(card.confidenceNote, c)!)}</div>` : ""}
      <div class="compact-card__chart"><canvas id="${canvasId}"></canvas></div>
      <div class="compact-card__bars">${bars}</div>
    </div>`;
}

function benchEntryHtml(entry: ClientBriefBenchEntry, c: ReturnType<typeof copy>): string {
  return `
    <div class="compact-card compact-card--bench">
      <div class="compact-card__header">
        <span class="compact-card__rank">${entry.rank}</span>
        <span class="compact-card__name">${escapeHtml(entry.name)}</span>
      </div>
      <div class="compact-card__score-standalone"><span class="compact-card__score-value">${Math.round(entry.score)}</span><span class="compact-card__score-unit">/100</span>${entry.percentile !== undefined ? `<span class="compact-card__score-unit"> · ${escapeHtml(c.percentileLabel(entry.percentile))}</span>` : ""}</div>
      <div class="compact-card__verdict">${escapeHtml(entry.verdict)}</div>
    </div>`;
}

/** Number of physical pages the compact grid + backup bench will occupy,
 * computed upfront so footer page numbers ("03 / 07") are accurate on
 * first pass instead of guessed. */
function compactGridPageCount(data: ShortlistData): number {
  const primaryPages = chunk(data.cards, COMPACT_GRID_PAGE_SIZE).length;
  const benchEntries = data.benchEntries ?? [];
  const benchOmittedCount = data.benchOmittedCount ?? 0;
  const benchPages = benchEntries.length > 0 || benchOmittedCount > 0 ? Math.max(1, chunk(benchEntries, COMPACT_GRID_PAGE_SIZE).length) : 0;
  return primaryPages + benchPages;
}

/** >2 primary candidates: paginated compact grid, chunked to a fixed number
 * of cards per physical page (this file's own extension — not covered by
 * the editorial handoff, which only specifies the 1-2 candidate layout). */
function compactGridPagesHtml(
  data: ShortlistData,
  c: ReturnType<typeof copy>,
  accent: string,
  chartInstances: { canvasId: string; config: unknown }[],
  startPageNumber: number,
  totalPages: number
): string {
  const primaryChunks = chunk(data.cards, COMPACT_GRID_PAGE_SIZE);
  const benchEntries = data.benchEntries ?? [];
  const benchOmittedCount = data.benchOmittedCount ?? 0;
  const benchChunks = chunk(benchEntries, COMPACT_GRID_PAGE_SIZE);
  let pageNumber = startPageNumber;
  let cardCursor = 0;

  const pages: string[] = [];

  primaryChunks.forEach((group, chunkIndex) => {
    const cardsHtml = group
      .map((card) => {
        const canvasId = `radar-${cardCursor}`;
        chartInstances.push({ canvasId, config: compactRadarChartConfig(card.radar, card.isPrimary ? accent : "#111827", card.isPrimary ? `${accent}26` : "rgba(17,24,39,0.08)") });
        const html = compactCardHtml(card, accent, canvasId, cardCursor + 1, c);
        cardCursor += 1;
        return html;
      })
      .join("");

    const isFirst = chunkIndex === 0;
    pages.push(`
  <section class="page grid-page" aria-label="Recommended candidates">
    <div class="page-inner">
      ${
        isFirst
          ? `<div class="summary-header">
          <div class="summary-header-copy">
            <div class="eyebrow">${escapeHtml(c.fullShortlist)}</div>
            <h2 class="section-title" style="font-size: 20pt;">${escapeHtml(c.recommendedCandidates(data.cards.length + (data.benchEntries?.length ?? 0) + (data.benchOmittedCount ?? 0)))}</h2>
          </div>
          <div class="summary-date">${escapeHtml(data.roleTitle)}<br>${escapeHtml(data.date)}</div>
        </div>`
          : `<div class="eyebrow">${escapeHtml(c.fullShortlist)}</div>`
      }
      <div class="cards-grid">${cardsHtml}</div>
      ${reportLegalHtml(c, escapeHtml(c.disclaimerShort), `${escapeHtml(c.confidential)} · ${data.clientName ? escapeHtml(data.clientName) : escapeHtml(data.shortlistName)}`, `${String(pageNumber).padStart(2, "0")} / ${String(totalPages).padStart(2, "0")}`, data.reportFooterText)}
    </div>
  </section>`);
    pageNumber += 1;
  });

  if (benchEntries.length > 0 || benchOmittedCount > 0) {
    const effectiveBenchChunks = benchChunks.length > 0 ? benchChunks : [[]];
    effectiveBenchChunks.forEach((group, chunkIndex) => {
      const isFirstBenchPage = chunkIndex === 0;
      const isLastBenchPage = chunkIndex === effectiveBenchChunks.length - 1;
      const benchHtml = group.map((entry) => benchEntryHtml(entry, c)).join("");
      pages.push(`
  <section class="page grid-page" aria-label="Backup candidates">
    <div class="page-inner">
      ${
        isFirstBenchPage
          ? `<div class="eyebrow">${escapeHtml(c.backupBench)}</div>
        <h2 class="section-title" style="font-size: 20pt;">${escapeHtml(c.backupBench)}</h2>
        <p class="bench-subtitle">${escapeHtml(c.backupBenchSubtitle)}</p>`
          : `<div class="eyebrow">${escapeHtml(c.backupBench)}</div>`
      }
      <div class="cards-grid" style="margin-top: 6mm;">${benchHtml}</div>
      ${isLastBenchPage && benchOmittedCount > 0 ? `<p class="bench-omitted">${escapeHtml(c.benchOmitted(benchOmittedCount))}</p>` : ""}
      ${reportLegalHtml(c, escapeHtml(c.disclaimerShort), `${escapeHtml(c.confidential)} · ${data.clientName ? escapeHtml(data.clientName) : escapeHtml(data.shortlistName)}`, `${String(pageNumber).padStart(2, "0")} / ${String(totalPages).padStart(2, "0")}`, data.reportFooterText)}
    </div>
  </section>`);
      pageNumber += 1;
    });
  }

  return pages.join("");
}

function interviewPageHtml(
  pageData: ClientBriefInterviewPage,
  c: ReturnType<typeof copy>,
  pageLabel: string,
  footerLeft: string,
  reportFooterText?: string
): string {
  const questionsHtml = pageData.questions
    .map(
      (q, index) => `
        <article class="question-card">
          <div class="question-topline">
            <span class="question-number">${String(index + 1).padStart(2, "0")}</span>
            <span class="question-focus">${escapeHtml(q.focusLabel)}</span>
          </div>
          <h3 class="question-text">${escapeHtml(q.question)}</h3>
          <div class="verify-block">
            <div class="verify-label">${escapeHtml(c.whatThisVerifies)}</div>
            <p class="verify-copy">${escapeHtml(q.verifies)}</p>
          </div>
        </article>`
    )
    .join("");

  return `
  <section class="page interview" aria-label="Interview guide for ${escapeHtml(pageData.name)}">
    <div class="page-inner">
      <header class="interview-header">
        <div>
          <div class="eyebrow">${escapeHtml(c.structuredInterviewGuide)}</div>
          <h2 class="section-title">${escapeHtml(pageData.name)}</h2>
        </div>
        <div class="candidate-pill">${escapeHtml(pageData.verdict)}</div>
      </header>

      <div class="candidate-brief">
        <div>
          <span class="brief-label">${escapeHtml(c.interviewObjective)}</span>
          <h3 class="brief-title">${escapeHtml(pageData.objectiveTitle)}</h3>
        </div>
        <p class="brief-copy">${escapeHtml(pageData.objectiveCopy)}</p>
      </div>

      <div class="question-grid">${questionsHtml}</div>

      <div class="interview-close">
        <strong>${escapeHtml(c.useConsistently)}</strong>
        <p>${escapeHtml(c.useConsistentlyCopy)}</p>
      </div>

      ${reportLegalHtml(
        c,
        escapeHtml(c.disclaimerShort),
        `${escapeHtml(c.confidential)} · <span class="engine-credit">${escapeHtml(c.engineCredit)} <strong>IntelligencesTest</strong></span>`,
        pageLabel,
        reportFooterText
      )}
    </div>
  </section>`;
}

export function buildClientBriefHTML(data: ShortlistData): string {
  const c = copy(data.locale);
  const accent = normalizePrimaryColor(data.accentColor) ?? DEFAULT_ACCENT;
  const isCompact = data.cards.length > 2;

  // Page 2 is ALWAYS the approved editorial executive-summary spread (top-2
  // detailed cards). With >2 recommended candidates, the full ranked set
  // follows as compact-grid pages — the grid supplements the approved
  // layout, it never replaces it.
  const summaryPageCount = 1 + (isCompact ? compactGridPageCount(data) : 0);
  const totalPages = 1 /* cover */ + summaryPageCount + data.interviewPages.length;

  const chartInstances: { canvasId: string; config: unknown }[] = [];

  data.cards.slice(0, 2).forEach((card, index) => {
    chartInstances.push({
      canvasId: `spotlight-${index}`,
      config: radarChartConfig(card.radar, card.isPrimary ? accent : "#111827", card.isPrimary ? `${accent}2E` : "rgba(17,24,39,0.10)"),
    });
  });
  let bodyPages = executiveSummaryPageHtml(data, c, accent, `02 / ${String(totalPages).padStart(2, "0")}`);

  if (isCompact) {
    bodyPages += compactGridPagesHtml(data, c, accent, chartInstances, 3, totalPages);
  }

  const interviewPagesHtml = data.interviewPages
    .map((page, index) => {
      const pageNumber = 1 + summaryPageCount + 1 + index;
      return interviewPageHtml(
        page,
        c,
        `${String(pageNumber).padStart(2, "0")} / ${String(totalPages).padStart(2, "0")}`,
        "",
        data.reportFooterText
      );
    })
    .join("");

  const chartJsPath = path.join(process.cwd(), "node_modules", "chart.js", "dist", "chart.umd.min.js");
  const chartJsSrc = fs.readFileSync(chartJsPath, "utf8");

  return `<!doctype html>
<html lang="${data.locale}">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(data.shortlistName)}</title>
  <style>
    /* Static instances only — never embed variable fonts here. Chromium's
     * print pipeline falls back to Type 3 glyph-drawing for variable fonts,
     * which renders with crushed/overlapping letter pairs in some PDF
     * viewers. These files are pinned instances generated from the original
     * variable sources (see fraunces-latin.woff2 / public-sans-latin.woff2). */
    @font-face {
      font-family: "Fraunces Display Local";
      src: url("${fontFileUrl("fraunces-display-medium.woff2")}") format("woff2");
      font-style: normal;
      font-weight: 100 900;
      font-display: block;
    }
    @font-face {
      font-family: "Fraunces Local";
      src: url("${fontFileUrl("fraunces-text-medium.woff2")}") format("woff2");
      font-style: normal;
      font-weight: 100 549;
      font-display: block;
    }
    @font-face {
      font-family: "Fraunces Local";
      src: url("${fontFileUrl("fraunces-text-semibold.woff2")}") format("woff2");
      font-style: normal;
      font-weight: 550 674;
      font-display: block;
    }
    @font-face {
      font-family: "Fraunces Local";
      src: url("${fontFileUrl("fraunces-text-bold.woff2")}") format("woff2");
      font-style: normal;
      font-weight: 675 900;
      font-display: block;
    }
    @font-face {
      font-family: "Public Sans Local";
      src: url("${fontFileUrl("public-sans-regular.woff2")}") format("woff2");
      font-style: normal;
      font-weight: 100 449;
      font-display: block;
    }
    @font-face {
      font-family: "Public Sans Local";
      src: url("${fontFileUrl("public-sans-medium.woff2")}") format("woff2");
      font-style: normal;
      font-weight: 450 549;
      font-display: block;
    }
    @font-face {
      font-family: "Public Sans Local";
      src: url("${fontFileUrl("public-sans-semibold.woff2")}") format("woff2");
      font-style: normal;
      font-weight: 550 649;
      font-display: block;
    }
    @font-face {
      font-family: "Public Sans Local";
      src: url("${fontFileUrl("public-sans-bold.woff2")}") format("woff2");
      font-style: normal;
      font-weight: 650 900;
      font-display: block;
    }

    :root {
      --paper: #ffffff;
      --canvas: #eef1f5;
      --ink: #111827;
      --body: #3f4856;
      --muted: #6f7885;
      --hairline: #dfe3e8;
      --soft: #f4f6f8;
      --soft-blue: ${accent}12;
      --accent: ${accent};
      --serif: "Fraunces Local", Georgia, "Times New Roman", serif;
      --serif-display: "Fraunces Display Local", "Fraunces Local", Georgia, "Times New Roman", serif;
      --sans: "Public Sans Local", Calibri, "Segoe UI", sans-serif;
      --page-w: 210mm;
      --page-h: 297mm;
    }

    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; background: var(--canvas); color: var(--ink); font-family: var(--sans); font-size: 10pt; line-height: 1.42; -webkit-font-smoothing: antialiased; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    body { padding: 18px 0; }
    h1, h2, h3, p { margin: 0; }

    .page { position: relative; width: var(--page-w); height: var(--page-h); margin: 0 auto 18px; overflow: hidden; background: var(--paper); page-break-after: always; break-after: page; }
    .page:last-child { page-break-after: auto; break-after: auto; }
    .grid-page { overflow: visible; }

    .page-inner { height: 100%; padding: 16mm 18mm 13mm; display: flex; flex-direction: column; }

    .eyebrow { color: var(--accent); font-size: 8.2pt; font-weight: 600; letter-spacing: 0.14em; line-height: 1.2; text-transform: uppercase; }
    .section-title { margin-top: 2.5mm; font-family: var(--serif-display); font-size: 25pt; font-weight: 500; letter-spacing: -0.025em; line-height: 1.08; }
    .page-footer { padding-top: 2.8mm; border-top: 1px solid var(--hairline); display: flex; align-items: center; justify-content: space-between; color: var(--muted); font-size: 7.7pt; letter-spacing: 0.015em; }
    .page-number { color: var(--ink); font-variant-numeric: tabular-nums; font-weight: 600; }
    .report-legal { margin-top: auto; }
    .report-custom-note { margin: 0 0 2.3mm; padding: 2.2mm 3mm; border-left: 1.5px solid var(--accent); background: var(--soft-blue); color: var(--body); font-size: 7.2pt; font-weight: 500; line-height: 1.35; white-space: pre-wrap; }
    .report-disclaimer { padding: 0 0 2.6mm; color: var(--muted); font-size: 7pt; line-height: 1.38; }
    .report-disclaimer strong { color: var(--body); font-weight: 600; }

    /* --- Cover --- */
    .cover .page-inner { padding: 18mm 20mm 17mm; }
    .cover-topline { display: flex; align-items: flex-start; justify-content: space-between; }
    .agency-logo { display: inline-flex; align-items: center; gap: 3.2mm; min-height: 12mm; }
    .agency-logo-img { max-width: 32mm; max-height: 12mm; object-fit: contain; }
    .agency-monogram { width: 11mm; height: 11mm; border: 1.2px solid var(--accent); display: grid; place-items: center; color: var(--accent); font-family: var(--serif); font-size: 11pt; font-weight: 600; line-height: 1; }
    .agency-wordmark strong, .agency-wordmark span { display: block; }
    .agency-wordmark strong { font-size: 10.2pt; font-weight: 600; letter-spacing: 0.08em; line-height: 1.15; text-transform: uppercase; }
    .agency-wordmark span { margin-top: 1mm; color: var(--muted); font-size: 7.2pt; letter-spacing: 0.11em; text-transform: uppercase; }
    .cover-document-type { color: var(--muted); font-size: 8pt; font-weight: 500; letter-spacing: 0.12em; text-transform: uppercase; }
    .cover-main { margin-top: 60mm; width: 155mm; }
    .cover-kicker { color: var(--accent); font-size: 8.5pt; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase; }
    .cover h1 { margin-top: 7mm; max-width: 145mm; font-family: var(--serif-display); font-size: 37pt; font-weight: 500; letter-spacing: -0.035em; line-height: 1.04; }
    .cover-role { margin-top: 8mm; color: var(--body); font-size: 15pt; font-weight: 400; line-height: 1.25; }
    .cover-accent-line { margin-top: 12mm; width: 27mm; height: 1.5px; background: var(--accent); }
    .cover-meta { margin-top: auto; display: grid; grid-template-columns: 1fr 1fr; gap: 14mm; padding-top: 8mm; border-top: 1px solid var(--hairline); }
    .cover .report-legal { margin-top: 6mm; }
    .meta-label { display: block; color: var(--muted); font-size: 7.8pt; font-weight: 600; letter-spacing: 0.13em; text-transform: uppercase; }
    .meta-value { display: block; margin-top: 2.2mm; color: var(--ink); font-family: var(--serif); font-size: 13pt; font-weight: 500; line-height: 1.25; }

    /* --- Executive summary --- */
    .summary-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 14mm; }
    .summary-header-copy { max-width: 124mm; }
    .summary-date { padding-top: 1mm; color: var(--muted); font-size: 8.2pt; text-align: right; white-space: nowrap; }
    .executive-narrative { margin-top: 7mm; padding: 5mm 0 5.5mm 6mm; border-left: 1.5px solid var(--accent); color: var(--body); font-family: var(--serif); font-size: 12.3pt; line-height: 1.48; }
    .candidate-grid { margin-top: 7mm; display: grid; gap: 7mm; }
    .candidate-card { min-width: 0; border: 1px solid var(--hairline); background: var(--paper); display: flex; flex-direction: column; }
    .candidate-card.lead { border-top: 2.2px solid var(--accent); }
    .candidate-card.alternate { border-top: 2.2px solid var(--ink); }
    .candidate-card-header { min-height: 28mm; padding: 4.6mm 5mm 4mm; }
    .candidate-index { display: block; color: var(--muted); font-size: 7.4pt; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; }
    .candidate-leadline { margin-top: 2mm; font-family: var(--serif); font-size: 13.4pt; font-weight: 650; letter-spacing: -0.012em; line-height: 1.22; }
    .candidate-leadline strong { color: var(--ink); font-weight: 750; }
    .score-support { min-height: 7.5mm; padding: 1.8mm 5mm; border-top: 1px solid var(--hairline); border-bottom: 1px solid var(--hairline); display: flex; align-items: center; justify-content: space-between; gap: 4mm; color: #858d98; font-size: 6.2pt; font-weight: 500; letter-spacing: 0.09em; text-transform: uppercase; }
    .score-support strong { color: #747d89; font-size: 6.6pt; font-weight: 500; font-variant-numeric: tabular-nums; letter-spacing: 0; text-transform: none; }
    .confidence-note { margin: 1.6mm 5mm 0; color: var(--muted); font-size: 6.4pt; line-height: 1.4; font-style: italic; }
    .radar-wrap { position: relative; width: 100%; height: 58mm; padding: 2.5mm 1.5mm 0.5mm; }
    .radar-wrap canvas { width: 100% !important; height: 100% !important; }
    .dimension-list { padding: 1mm 5mm 4mm; display: grid; gap: 2.2mm; }
    .dimension-row { display: grid; grid-template-columns: minmax(0, 1fr) 30mm; align-items: center; gap: 2.5mm; color: var(--body); font-size: 7.7pt; }
    .dimension-label { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .dimension-track { display: block; height: 1.4mm; background: #e8ebef; overflow: hidden; }
    .dimension-fill { display: block; height: 100%; background: var(--accent); }
    .alternate .dimension-fill { background: var(--ink); }
    .decision-strip { margin-top: 6mm; padding: 4.5mm 5mm; background: var(--soft-blue); display: grid; grid-template-columns: 37mm 1fr; gap: 6mm; align-items: start; }
    .decision-strip h3 { font-family: var(--serif); font-size: 11.8pt; font-weight: 500; line-height: 1.25; }
    .decision-strip p { color: var(--body); font-size: 8.7pt; line-height: 1.48; }

    /* --- Compact grid (>2 primary candidates) + backup bench --- */
    .cards-grid { display: flex; flex-wrap: wrap; gap: 4mm; margin-top: 7mm; }
    .compact-card { width: calc((100% - 8mm) / 3); box-sizing: border-box; border: 1px solid var(--hairline); background: var(--paper); padding: 3.5mm 4mm 4mm; break-inside: avoid; }
    .compact-card--primary { border-top: 2.2px solid var(--accent); }
    .compact-card--bench { background: var(--soft); }
    .compact-card__header { display: flex; align-items: center; gap: 2mm; margin-bottom: 1mm; }
    .compact-card__rank { flex-shrink: 0; width: 5mm; height: 5mm; border-radius: 999px; background: var(--ink); color: #fff; font-family: var(--sans); font-size: 6.5pt; font-weight: 700; display: flex; align-items: center; justify-content: center; }
    .compact-card__name { font-family: var(--serif); font-size: 10.5pt; font-weight: 650; color: var(--ink); }
    .compact-card__verdict { font-size: 7pt; color: var(--body); line-height: 1.35; margin-bottom: 1.5mm; min-height: 6mm; }
    .compact-card__score { font-size: 6.5pt; color: var(--muted); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 1mm; }
    .compact-card__score strong { color: var(--ink); text-transform: none; letter-spacing: 0; font-family: var(--serif); font-size: 8.5pt; }
    .compact-card__score-standalone { margin: 1mm 0; }
    .compact-card__score-value { font-family: var(--serif); font-size: 13pt; font-weight: 650; color: var(--ink); }
    .compact-card__score-unit { font-size: 7.5pt; color: var(--muted); margin-left: 1mm; }
    .compact-card__confidence-note { font-size: 5.6pt; color: var(--muted); line-height: 1.3; font-style: italic; margin-bottom: 1.5mm; }
    .compact-card__chart { height: 28mm; display: flex; justify-content: center; }
    .compact-card__bars { margin-top: 1.5mm; display: grid; gap: 1.1mm; }
    .compact-card__bar-row { display: grid; grid-template-columns: minmax(0, 1fr) 14mm; align-items: center; gap: 1.5mm; color: var(--body); font-size: 5.8pt; }
    .compact-card__bar-label { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .compact-card__bar-track { display: block; height: 1.1mm; background: #e8ebef; overflow: hidden; }
    .compact-card__bar-fill { display: block; height: 100%; background: var(--accent); }
    .compact-card:not(.compact-card--primary) .compact-card__bar-fill { background: var(--ink); }
    .bench-subtitle { margin-top: 2mm; color: var(--muted); font-size: 8.5pt; line-height: 1.45; max-width: 140mm; }
    .cutoff-note { margin-top: 4mm; color: var(--muted); font-size: 7.6pt; line-height: 1.45; }
    .bench-omitted { margin-top: 5mm; padding-top: 3mm; border-top: 1px dashed var(--hairline); color: var(--muted); font-size: 8pt; font-style: italic; }

    /* --- Interview kit --- */
    .interview-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 12mm; }
    .interview-header .section-title { font-size: 24pt; }
    .candidate-pill { margin-top: 1mm; padding: 2.2mm 3mm; border: 1px solid var(--hairline); color: var(--ink); font-size: 8pt; font-weight: 600; white-space: nowrap; }
    .candidate-brief { margin-top: 6mm; display: grid; grid-template-columns: 44mm 1fr; gap: 7mm; padding: 4.5mm 0; border-top: 1px solid var(--hairline); border-bottom: 1px solid var(--hairline); }
    .brief-label { color: var(--muted); font-size: 7.5pt; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; }
    .brief-title { margin-top: 1.5mm; font-family: var(--serif); font-size: 13pt; font-weight: 500; line-height: 1.25; }
    .brief-copy { color: var(--body); font-size: 9pt; line-height: 1.5; }
    .question-grid { margin-top: 6mm; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 5mm; }
    .question-card { min-height: 82mm; padding: 4.8mm 5mm 4.5mm; border: 1px solid var(--hairline); display: flex; flex-direction: column; background: var(--paper); }
    .question-topline { display: flex; align-items: center; justify-content: space-between; gap: 4mm; }
    .question-number { width: 7mm; height: 7mm; display: grid; place-items: center; background: var(--accent); color: #ffffff; font-size: 7.3pt; font-weight: 600; line-height: 1; }
    .question-focus { color: var(--accent); font-size: 7.2pt; font-weight: 600; letter-spacing: 0.09em; text-align: right; text-transform: uppercase; }
    .question-text { margin-top: 4mm; color: var(--ink); font-family: var(--serif); font-size: 11.4pt; font-weight: 500; line-height: 1.34; }
    .verify-block { margin-top: auto; padding-top: 4mm; }
    .verify-label { display: flex; align-items: center; gap: 2mm; color: var(--muted); font-size: 7.2pt; font-weight: 600; letter-spacing: 0.11em; text-transform: uppercase; }
    .verify-label::before { content: ""; width: 5mm; height: 1px; background: var(--accent); }
    .verify-copy { margin-top: 2mm; color: var(--body); font-size: 8.35pt; line-height: 1.45; }
    .interview-close { margin-top: 5.5mm; padding: 3.8mm 4.5mm; background: var(--soft); display: grid; grid-template-columns: 34mm 1fr; gap: 5mm; align-items: start; }
    .interview-close strong { font-family: var(--serif); font-size: 10.5pt; font-weight: 500; }
    .interview-close p { color: var(--body); font-size: 8.25pt; line-height: 1.45; }
    .engine-credit { color: var(--muted); }
    .engine-credit strong { color: var(--body); font-weight: 500; }

    @page { size: A4; margin: 0; }
    @media print {
      html, body { width: var(--page-w); background: var(--paper); }
      body { padding: 0; }
      .page { margin: 0; }
    }
  </style>
</head>
<body>
  ${coverPageHtml(data, c)}
  ${bodyPages}
  ${interviewPagesHtml}

  <script src="data:text/javascript;base64,${Buffer.from(chartJsSrc).toString("base64")}"></script>
  <script>
    window.__PDF_READY__ = false;

    function renderCharts() {
      var instances = ${toInlineJson(chartInstances)};
      instances.forEach(function (item) {
        var canvas = document.getElementById(item.canvasId);
        if (!canvas) return;
        new Chart(canvas.getContext("2d"), item.config);
      });
    }

    async function prepareForPrint() {
      try {
        await document.fonts.ready;
        var loadedFaces = await Promise.all([
          document.fonts.load('500 16px "Fraunces Display Local"'),
          document.fonts.load('500 16px "Fraunces Local"'),
          document.fonts.load('600 16px "Fraunces Local"'),
          document.fonts.load('700 16px "Fraunces Local"'),
          document.fonts.load('400 16px "Public Sans Local"'),
          document.fonts.load('500 16px "Public Sans Local"'),
          document.fonts.load('600 16px "Public Sans Local"'),
          document.fonts.load('700 16px "Public Sans Local"')
        ]);
        if (loadedFaces.some(function (faces) { return !faces.length; })) {
          throw new Error("Local report fonts did not load");
        }
        if (!window.Chart) {
          throw new Error("Chart.js did not load");
        }

        renderCharts();

        await new Promise(function (resolve) {
          requestAnimationFrame(function () { requestAnimationFrame(resolve); });
        });
        document.documentElement.dataset.pdfReady = "true";
        window.__PDF_READY__ = true;
      } catch (error) {
        document.documentElement.dataset.pdfReady = "error";
        window.__PDF_READY_ERROR__ = String(error && error.message ? error.message : error);
        console.error(error);
      }
    }

    prepareForPrint();
  </script>
</body>
</html>`;
}
