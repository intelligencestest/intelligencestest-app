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
  /** Conclusion-first profile interpretation derived from the candidate's own evidence pattern. */
  profileConclusion: string;
  /** True only when the recommendation level itself is strong, independent of rank. */
  isPriorityRecommendation: boolean;
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
  /** Candidate-specific evidence implication shown top-right of the question card. */
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
const COMPACT_GRID_PAGE_SIZE = 4; // 2x2, preserving readable evidence labels and conclusions.

function escapeHtml(value: string): string {
  return value
    .replace(/[\u2010-\u2015\u2212]/g, "-")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatScore(score: number): string {
  return score.toFixed(1);
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
    shortlistRecommendation: es ? "Recomendación de shortlist" : fr ? "Recommandation de présélection" : "Shortlist recommendation",
    coverTitle: es ? "Recomendación de entrevista de candidatos" : fr ? "Recommandation d'entretiens avec les candidats" : "Candidate interview recommendation",
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
    shortlistDecisionBrief: es ? "Informe de decisión de shortlist" : fr ? "Note de décision — présélection" : "Shortlist decision brief",
    candidateLabel: (n: number) => (es ? `Candidato ${String(n).padStart(2, "0")}` : fr ? `Candidat ${String(n).padStart(2, "0")}` : `Candidate ${String(n).padStart(2, "0")}`),
    profileConclusion: es ? "Conclusión del perfil" : fr ? "Conclusion du profil" : "Profile conclusion",
    overall: es ? "Total" : fr ? "Total" : "Overall",
    recommendedPlan: es ? "Entrevistar primero" : fr ? "À rencontrer en premier" : "Interview first",
    recommendedPlanCopy: (names: string) =>
      es
        ? `Entreviste a ${names} con las guías específicas de las páginas siguientes. En cada pregunta, registre si la evidencia queda confirmada, debilitada o sin resolver para mantener una comparación clara y lista para la decisión.`
        : fr
        ? `Rencontrez ${names} à l'aide des guides qui suivent. Pour chaque question, notez si les éléments sont confirmés, affaiblis ou non résolus afin de conserver une comparaison exploitable.`
        : `Interview ${names} using the candidate-specific guides on the following pages. For each probe, record whether the evidence is confirmed, weakened, or unresolved so the comparison stays decision-ready.`,
    recommendedPlanCopyMany: (count: number) =>
      es
        ? `Entreviste a los ${count} candidatos principales con las guías específicas de las páginas siguientes. En cada pregunta, registre si la evidencia queda confirmada, debilitada o sin resolver para mantener una comparación clara y lista para la decisión.`
        : fr
        ? `Rencontrez les ${count} candidats prioritaires à l'aide des guides qui suivent. Pour chaque question, notez si les éléments sont confirmés, affaiblis ou non résolus afin de conserver une comparaison exploitable.`
        : `Interview the top ${count} candidates using the candidate-specific guides on the following pages. For each probe, record whether the evidence is confirmed, weakened, or unresolved so the comparison stays decision-ready.`,
    structuredInterviewGuide: es ? "Guía de entrevista estructurada" : fr ? "Guide d'entretien structuré" : "Structured interview guide",
    interviewObjective: es ? "Objetivo de la entrevista" : fr ? "Objectif de l'entretien" : "Interview objective",
    objectiveTitle: es
      ? "Traducir la evidencia en ejemplos específicos del puesto"
      : fr
      ? "Transposer les éléments d'évaluation en exemples liés au poste"
      : "Translate the assessment evidence into role-specific examples",
    decisionUse: es ? "Uso en la decisión" : fr ? "Utilité décisionnelle" : "Decision use",
    recordEvidence: es ? "Registrar evidencia, no impresiones" : fr ? "Consigner les preuves, pas les impressions" : "Record evidence, not impressions",
    useConsistentlyCopy: es
      ? "Para cada respuesta, anote la situación, la acción, la disyuntiva y el resultado. Marque la señal citada como confirmada, debilitada o no resuelta; no trate la fluidez por sí sola como confirmación."
      : fr
      ? "Pour chaque réponse, notez la situation, l'action, l'arbitrage et le résultat. Classez le signal comme confirmé, affaibli ou non résolu ; l'aisance seule ne suffit pas."
      : "For each answer, note the situation, action, trade-off, and result. Mark the cited signal confirmed, weakened, or unresolved; do not treat fluency alone as confirmation.",
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
    fullShortlist: es ? "Shortlist completa" : fr ? "Présélection complète" : "Full shortlist",
    poolContinuousNote: es
      ? "No apareció un corte natural claro, por lo que el margen operativo estándar definió el grupo de entrevista."
      : fr
      ? "Aucune rupture naturelle nette n'est apparue ; la marge opérationnelle standard a donc défini le groupe d'entretien."
      : "No clear natural score break appeared, so the standard operational buffer set the interview group.",
    percentileLabel: (n: number) => {
      if (es) return `percentil ${n} del grupo`;
      if (fr) return `${n}e percentile du vivier`;
      const suffix = n % 100 >= 11 && n % 100 <= 13 ? "th" : n % 10 === 1 ? "st" : n % 10 === 2 ? "nd" : n % 10 === 3 ? "rd" : "th";
      return `${n}${suffix} pool percentile`;
    },
    recommendedCandidates: (n: number) =>
      es ? `${n} candidatos recomendados` : fr ? `${n} candidats recommandés` : `${n} candidates recommended`,
    summaryConclusion: (names: string[]) => {
      const first = names[0] ?? (es ? "El candidato principal" : fr ? "Le candidat principal" : "The lead candidate");
      const second = names[1];
      if (!second) return es ? `${first} es la prioridad de entrevista` : fr ? `${first} est la priorité d'entretien` : `${first} is the interview priority`;
      return es ? `${first} lidera; ${second} es la siguiente prioridad` : fr ? `${first} arrive en tête ; ${second} est la priorité suivante` : `${first} leads; ${second} is the next priority`;
    },
    shortlistConclusion: (priorityCount: number, total: number) =>
      es
        ? `${priorityCount} de ${total} candidatos justifican prioridad inmediata`
        : fr
        ? `${priorityCount} candidats sur ${total} justifient une priorité immédiate`
        : `${priorityCount} of ${total} candidates warrant immediate priority`,
    methodologyHeading: es ? "Metodología" : fr ? "Méthodologie" : "Methodology",
    methodologyCutoff: es
      ? "El corte mantiene la selección operativa aprobada. El percentil compara cada puntuación exacta con el grupo evaluado en este proceso, no con una norma externa."
      : fr
      ? "Le seuil préserve la sélection opérationnelle approuvée. Le percentile compare chaque score exact à ce vivier, et non à une norme externe."
      : "The cutoff preserves the approved operational selection. Pool percentile compares the exact score with this evaluated cohort, not with an external norm.",
    methodologyConfidence: es
      ? "Base de confianza: refleja la consistencia de las respuestas que sustentan cada puntuación. No aumenta ni reduce la puntuación ni el percentil dentro del grupo."
      : fr
      ? "Base de confiance : cohérence des réponses étayant chaque score. Elle ne modifie ni le score ni le percentile du vivier."
      : "Confidence basis: response consistency supporting a score. It does not raise or lower the score or pool percentile.",
    evidenceScope: es
      ? "Alcance de la evidencia: este informe compara únicamente la evidencia de evaluación presentada. No evalúa el historial laboral, las referencias, la motivación, la disponibilidad, el encaje salarial ni el rendimiento en un ejercicio práctico en directo."
      : fr
      ? "Périmètre des éléments : cette note compare uniquement les résultats d'évaluation présentés. Elle ne couvre pas le parcours professionnel, les références, la motivation, la disponibilité, l'adéquation salariale ni la performance lors d'une mise en situation."
      : "Evidence scope: This brief compares the assessment evidence shown. It does not evaluate employment history, references, motivation, availability, compensation alignment, or performance in a live work sample.",
    roundedScoreNote: es
      ? "Las puntuaciones se muestran con un decimal; los percentiles usan valores exactos antes del redondeo."
      : fr
      ? "Les scores sont affichés avec une décimale ; les percentiles utilisent les valeurs exactes avant arrondi."
      : "Scores display to one decimal; percentiles use exact values before rounding.",
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

function assertPercentileConsistency(data: ShortlistData): void {
  const entries = [
    ...data.cards.map((card) => ({ name: card.name, score: card.overallScore, percentile: card.percentile })),
    ...(data.benchEntries ?? []).map((entry) => ({ name: entry.name, score: entry.score, percentile: entry.percentile })),
  ];
  for (let left = 0; left < entries.length; left += 1) {
    for (let right = left + 1; right < entries.length; right += 1) {
      const a = entries[left];
      const b = entries[right];
      if (Math.abs(a.score - b.score) < Number.EPSILON && a.percentile !== undefined && b.percentile !== undefined && a.percentile !== b.percentile) {
        throw new Error(`Client brief percentile mismatch: ${a.name} and ${b.name} have identical exact scores but different percentiles`);
      }
    }
  }
}

function hasRoundedScoreCollision(data: ShortlistData): boolean {
  const scores = [...data.cards.map((card) => card.overallScore), ...(data.benchEntries ?? []).map((entry) => entry.score)];
  return scores.some((score, index) => scores.slice(index + 1).some((other) => formatScore(score) === formatScore(other) && Math.abs(score - other) >= Number.EPSILON));
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
          pointLabels: { ...base.options.scales.r.pointLabels, padding: 5, font: { family: "Public Sans Local", size: 8.25, weight: "500", lineHeight: 1.1 } },
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
            <h3 class="candidate-leadline"><strong>${escapeHtml(card.name)}</strong> - ${escapeHtml(card.verdict)}</h3>
          </header>
          <div class="score-support"><span>${escapeHtml(card.profileConclusion)}</span><strong>${escapeHtml(c.overall)} ${formatScore(card.overallScore)} / 100${card.percentile !== undefined ? ` · ${escapeHtml(c.percentileLabel(card.percentile))}` : ""}</strong></div>
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
  const cardsHtml = spotlight.map((card, index) => detailedCandidateCardHtml(card, index, `spotlight-${index}`, c)).join("");
  const names = joinNames(data.locale, spotlight.map((card) => card.name));
  const title = c.summaryConclusion(spotlight.map((card) => card.name));
  const planCopy = data.cards.length > 2 ? c.recommendedPlanCopyMany(data.cards.length) : c.recommendedPlanCopy(names);
  const methodologyNote = `<p class="rounding-note">${escapeHtml(c.roundedScoreNote)}</p>`;

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
      <section class="methodology-panel" aria-label="${escapeHtml(c.methodologyHeading)}">
        <h3>${escapeHtml(c.methodologyHeading)}</h3>
        <p>${escapeHtml(c.methodologyCutoff)}${data.cutoffDecisionType === "policy_fallback" ? ` ${escapeHtml(c.poolContinuousNote)}` : ""}</p>
        <p>${escapeHtml(c.methodologyConfidence)}</p>
        ${methodologyNote}
        <p class="evidence-scope">${escapeHtml(c.evidenceScope)}</p>
      </section>

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
      <div class="compact-card__conclusion">${escapeHtml(card.profileConclusion)}</div>
      <div class="compact-card__score">${escapeHtml(c.overall)} <strong>${formatScore(card.overallScore)} / 100</strong>${card.percentile !== undefined ? ` · ${escapeHtml(c.percentileLabel(card.percentile))}` : ""}</div>
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
      <div class="compact-card__score-standalone"><span class="compact-card__score-value">${formatScore(entry.score)}</span><span class="compact-card__score-unit">/100</span>${entry.percentile !== undefined ? `<span class="compact-card__score-unit"> · ${escapeHtml(c.percentileLabel(entry.percentile))}</span>` : ""}</div>
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
            <h2 class="section-title" style="font-size: 22pt;">${escapeHtml(c.shortlistConclusion(data.cards.filter((card) => card.isPriorityRecommendation).length, data.cards.length + (data.benchEntries?.length ?? 0) + (data.benchOmittedCount ?? 0)))}</h2>
          </div>
          <div class="summary-date">${escapeHtml(data.roleTitle)}<br>${escapeHtml(data.date)}</div>
        </div>`
          : `<div class="eyebrow">${escapeHtml(c.fullShortlist)}</div>`
      }
      <div class="cards-grid">${cardsHtml}</div>
      ${isFirst && hasRoundedScoreCollision(data) ? `<p class="rounding-note grid-rounding-note">${escapeHtml(c.roundedScoreNote)}</p>` : ""}
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
            <div class="verify-label">${escapeHtml(c.decisionUse)}</div>
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
        <strong>${escapeHtml(c.recordEvidence)}</strong>
        <p>${escapeHtml(c.useConsistentlyCopy)}</p>
      </div>

      ${reportLegalHtml(
        c,
        escapeHtml(c.disclaimerShort),
        footerLeft,
        pageLabel,
        reportFooterText
      )}
    </div>
  </section>`;
}

export function buildClientBriefHTML(data: ShortlistData): string {
  assertPercentileConsistency(data);
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
        `${escapeHtml(c.confidential)} · ${escapeHtml(data.agencyName)}`,
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
      font-weight: 500;
      font-display: block;
    }
    @font-face {
      font-family: "Fraunces Local";
      src: url("${fontFileUrl("fraunces-text-medium.woff2")}") format("woff2");
      font-style: normal;
      font-weight: 500;
      font-display: block;
    }
    @font-face {
      font-family: "Fraunces Local";
      src: url("${fontFileUrl("fraunces-text-semibold.woff2")}") format("woff2");
      font-style: normal;
      font-weight: 600;
      font-display: block;
    }
    @font-face {
      font-family: "Fraunces Local";
      src: url("${fontFileUrl("fraunces-text-bold.woff2")}") format("woff2");
      font-style: normal;
      font-weight: 700;
      font-display: block;
    }
    @font-face {
      font-family: "Public Sans Local";
      src: url("${fontFileUrl("public-sans-regular.woff2")}") format("woff2");
      font-style: normal;
      font-weight: 400;
      font-display: block;
    }
    @font-face {
      font-family: "Public Sans Local";
      src: url("${fontFileUrl("public-sans-medium.woff2")}") format("woff2");
      font-style: normal;
      font-weight: 500;
      font-display: block;
    }
    @font-face {
      font-family: "Public Sans Local";
      src: url("${fontFileUrl("public-sans-semibold.woff2")}") format("woff2");
      font-style: normal;
      font-weight: 600;
      font-display: block;
    }
    @font-face {
      font-family: "Public Sans Local";
      src: url("${fontFileUrl("public-sans-bold.woff2")}") format("woff2");
      font-style: normal;
      font-weight: 700;
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
    .grid-page { overflow: hidden; }

    .page-inner { height: 100%; padding: 16mm 18mm 15mm; display: flex; flex-direction: column; }

    .eyebrow { color: var(--accent); font-size: 8.2pt; font-weight: 600; letter-spacing: 0.14em; line-height: 1.2; text-transform: uppercase; }
    .section-title { margin-top: 2.5mm; font-family: var(--serif-display); font-size: 22pt; font-weight: 500; letter-spacing: -0.025em; line-height: 1.08; }
    .page-footer { padding-top: 2.8mm; border-top: 1px solid var(--hairline); display: flex; align-items: center; justify-content: space-between; color: var(--muted); font-size: 7.7pt; letter-spacing: 0.015em; }
    .page-number { color: var(--ink); font-variant-numeric: tabular-nums; font-weight: 600; }
    .report-legal { margin-top: auto; }
    .report-custom-note { margin: 0 0 2.3mm; padding: 2.2mm 3mm; border-left: 1.5px solid var(--accent); background: var(--soft-blue); color: var(--body); font-size: 7.8pt; font-weight: 500; line-height: 1.4; white-space: pre-wrap; }
    .report-disclaimer { padding: 0 0 2.6mm; color: var(--muted); font-size: 7.5pt; line-height: 1.4; }
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
    .summary .page-inner { padding-top: 15mm; padding-bottom: 18mm; }
    .executive-narrative { margin-top: 2mm; max-width: 116mm; padding: 2.2mm 0 2.4mm 5mm; border-left: 1.5px solid var(--accent); color: var(--body); font-family: var(--sans); font-size: 10.25pt; line-height: 1.48; }
    .candidate-grid { margin-top: 2mm; display: grid; gap: 7mm; }
    .candidate-card { min-width: 0; border: 1px solid var(--hairline); background: var(--paper); display: flex; flex-direction: column; }
    .candidate-card.lead { border-top: 2.2px solid var(--accent); }
    .candidate-card.alternate { border-top: 2.2px solid var(--ink); }
    .candidate-card-header { min-height: 24mm; padding: 3.5mm 5mm 3.2mm; }
    .candidate-index { display: block; color: var(--muted); font-size: 7.4pt; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; }
    .candidate-leadline { margin-top: 2mm; font-family: var(--serif); font-size: 15.2pt; font-weight: 600; letter-spacing: -0.012em; line-height: 1.2; }
    .candidate-leadline strong { color: var(--ink); font-weight: 700; }
    .score-support { min-height: 12mm; padding: 2mm 5mm; border-top: 1px solid var(--hairline); border-bottom: 1px solid var(--hairline); display: grid; align-items: center; gap: 1mm; color: var(--body); font-size: 8.75pt; font-weight: 600; line-height: 1.3; }
    .score-support strong { color: var(--muted); font-size: 8.25pt; font-weight: 500; font-variant-numeric: tabular-nums; letter-spacing: 0; }
    .confidence-note { margin: 1.5mm 5mm 0; color: var(--muted); font-size: 8.25pt; line-height: 1.4; font-style: italic; }
    .radar-wrap { position: relative; width: 100%; height: 58mm; padding: 2.5mm 1.5mm 0.5mm; }
    .summary .radar-wrap { height: 32mm; }
    .radar-wrap canvas { width: 100% !important; height: 100% !important; }
    .dimension-list { padding: 1mm 5mm 3.5mm; display: grid; gap: 1.7mm; }
    .dimension-row { display: grid; grid-template-columns: minmax(0, 1fr) 30mm; align-items: center; gap: 2.5mm; color: var(--body); font-size: 8.25pt; }
    .dimension-label { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .dimension-track { display: block; height: 1.4mm; background: #e8ebef; overflow: hidden; }
    .dimension-fill { display: block; height: 100%; background: var(--accent); }
    .alternate .dimension-fill { background: var(--ink); }
    .decision-strip { margin-top: 2mm; padding: 2.8mm 5mm; background: var(--soft-blue); display: grid; grid-template-columns: 37mm 1fr; gap: 6mm; align-items: start; }
    .decision-strip h3 { font-family: var(--serif); font-size: 11.8pt; font-weight: 500; line-height: 1.25; }
    .decision-strip p { color: var(--body); font-size: 8.7pt; line-height: 1.45; }
    .methodology-panel { margin-top: 2mm; padding-top: 2mm; border-top: 1px solid var(--hairline); display: grid; grid-template-columns: 1fr 1fr; gap: 2mm 5mm; align-items: start; }
    .methodology-panel h3 { grid-column: 1 / -1; font-family: var(--sans); font-size: 10pt; font-weight: 600; line-height: 1.25; }
    .methodology-panel p { color: var(--body); font-size: 8.5pt; line-height: 1.42; }
    .methodology-panel .rounding-note { grid-column: 1 / -1; margin-top: -0.5mm; }
    .methodology-panel .evidence-scope { grid-column: 1 / -1; }
    .rounding-note { color: var(--muted); font-size: 8.5pt; line-height: 1.42; font-style: italic; }

    /* --- Compact grid (>2 primary candidates) + backup bench --- */
    .cards-grid { display: flex; flex-wrap: wrap; gap: 4mm 5mm; margin-top: 5mm; }
    .compact-card { width: calc((100% - 5mm) / 2); box-sizing: border-box; border: 1px solid var(--hairline); background: var(--paper); padding: 4mm 4.5mm 4.5mm; break-inside: avoid; }
    .compact-card--primary { border-top: 2.2px solid var(--accent); }
    .compact-card--bench { background: var(--soft); }
    .compact-card__header { display: flex; align-items: center; gap: 2mm; margin-bottom: 1mm; }
    .compact-card__rank { flex-shrink: 0; width: 6mm; height: 6mm; border-radius: 999px; background: var(--ink); color: #fff; font-family: var(--sans); font-size: 8.25pt; font-weight: 700; display: flex; align-items: center; justify-content: center; }
    .compact-card__name { font-family: var(--serif); font-size: 13pt; font-weight: 600; color: var(--ink); }
    .compact-card__verdict { font-size: 8.5pt; color: var(--body); line-height: 1.4; margin-bottom: 1.5mm; min-height: 7mm; }
    .compact-card__conclusion { min-height: 9mm; margin-bottom: 1.5mm; color: var(--ink); font-size: 8.75pt; font-weight: 600; line-height: 1.3; }
    .compact-card__score { font-size: 8.25pt; color: var(--muted); margin-bottom: 1mm; }
    .compact-card__score strong { color: var(--ink); letter-spacing: 0; font-family: var(--sans); font-size: 10pt; font-weight: 600; }
    .compact-card__score-standalone { margin: 1mm 0; }
    .compact-card__score-value { font-family: var(--serif); font-size: 13pt; font-weight: 650; color: var(--ink); }
    .compact-card__score-unit { font-size: 7.5pt; color: var(--muted); margin-left: 1mm; }
    .compact-card__confidence-note { font-size: 8.25pt; color: var(--muted); line-height: 1.35; font-style: italic; margin-bottom: 1.5mm; }
    .compact-card__chart { height: 30mm; display: flex; justify-content: center; }
    .compact-card__bars { margin-top: 1.5mm; display: grid; gap: 1.1mm; }
    .compact-card__bar-row { display: grid; grid-template-columns: minmax(0, 1fr) 18mm; align-items: center; gap: 1.8mm; color: var(--body); font-size: 8.25pt; }
    .compact-card__bar-label { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .compact-card__bar-track { display: block; height: 1.1mm; background: #e8ebef; overflow: hidden; }
    .compact-card__bar-fill { display: block; height: 100%; background: var(--accent); }
    .compact-card:not(.compact-card--primary) .compact-card__bar-fill { background: var(--ink); }
    .bench-subtitle { margin-top: 2mm; color: var(--muted); font-size: 8.5pt; line-height: 1.45; max-width: 140mm; }
    .cutoff-note { margin-top: 2.5mm; color: var(--muted); font-size: 8.25pt; line-height: 1.45; }
    .grid-rounding-note { margin-top: 3mm; }
    .bench-omitted { margin-top: 5mm; padding-top: 3mm; border-top: 1px dashed var(--hairline); color: var(--muted); font-size: 8pt; font-style: italic; }

    /* --- Interview kit --- */
    .interview-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 12mm; }
    .interview-header .section-title { font-size: 22pt; }
    .candidate-pill { margin-top: 1mm; padding: 2.2mm 3mm; border: 1px solid var(--hairline); color: var(--ink); font-size: 8.25pt; font-weight: 600; line-height: 1.2; white-space: nowrap; }
    .candidate-brief { margin-top: 4.5mm; display: grid; grid-template-columns: 50mm 1fr; gap: 7mm; padding: 4mm 0; border-top: 1px solid var(--hairline); border-bottom: 1px solid var(--hairline); }
    .brief-label { color: var(--muted); font-size: 7.8pt; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; }
    .brief-title { margin-top: 1.5mm; font-family: var(--serif); font-size: 13pt; font-weight: 500; line-height: 1.25; }
    .brief-copy { color: var(--body); font-size: 9.25pt; line-height: 1.48; }
    .question-grid { margin-top: 4mm; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 4.5mm; }
    .question-card { min-height: 72mm; padding: 4.2mm 4.8mm 4mm; border: 1px solid var(--hairline); display: flex; flex-direction: column; background: var(--paper); }
    .question-topline { display: flex; align-items: center; justify-content: space-between; gap: 4mm; }
    .question-number { width: 7mm; height: 7mm; display: grid; place-items: center; background: var(--accent); color: #ffffff; font-size: 7.3pt; font-weight: 600; line-height: 1; }
    .question-focus { color: var(--accent); font-family: var(--serif); font-size: 11.5pt; font-weight: 500; letter-spacing: 0; line-height: 1.35; text-align: right; }
    .question-text { margin-top: 3.2mm; color: var(--ink); font-family: var(--sans); font-size: 9.75pt; font-weight: 500; line-height: 1.42; }
    .verify-block { margin-top: auto; padding-top: 4mm; }
    .verify-label { display: flex; align-items: center; gap: 2mm; color: var(--muted); font-size: 7.8pt; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; }
    .verify-label::before { content: ""; width: 5mm; height: 1px; background: var(--accent); }
    .verify-copy { margin-top: 2mm; color: var(--body); font-size: 8.75pt; line-height: 1.45; }
    .interview-close { margin-top: 3.5mm; padding: 3.2mm 4.5mm; background: var(--soft); display: grid; grid-template-columns: 45mm 1fr; gap: 5mm; align-items: start; }
    .interview-close strong { font-family: var(--serif); font-size: 11.5pt; font-weight: 500; line-height: 1.3; }
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

    function assertPageLayout() {
      var pages = Array.from(document.querySelectorAll(".page"));
      pages.forEach(function (page, index) {
        var inner = page.querySelector(".page-inner");
        var legal = page.querySelector(".report-legal");
        if (!inner || !legal) {
          throw new Error("Client brief page " + (index + 1) + " is missing its layout or legal footer block");
        }

        var pageRect = page.getBoundingClientRect();
        var legalRect = legal.getBoundingClientRect();
        var hasVerticalOverflow = inner.scrollHeight > inner.clientHeight + 1;
        var footerOutsidePage = legalRect.bottom > pageRect.bottom + 1 || legalRect.top < pageRect.top - 1;
        var footerSafeGap = pageRect.bottom - legalRect.bottom;
        var minimumFooterSafeGap = (8 * 96) / 25.4;
        var footerTooLow = footerSafeGap < minimumFooterSafeGap;
        if (hasVerticalOverflow || footerOutsidePage || footerTooLow) {
          var label = page.getAttribute("aria-label") || "unnamed page";
          throw new Error(
            "Client brief layout overflow on page " +
              (index + 1) +
              " (" +
              label +
              "): content height " +
              inner.scrollHeight +
              "px exceeds " +
              inner.clientHeight +
              "px; footer safe gap " +
              footerSafeGap +
              "px"
          );
        }
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
        assertPageLayout();
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
