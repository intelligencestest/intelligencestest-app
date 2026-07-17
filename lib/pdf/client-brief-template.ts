import fs from "node:fs";
import path from "node:path";

/**
 * HTML generator for the client-facing shortlist brief. Rendered to PDF via
 * lib/pdf/render-pdf.ts (Puppeteer), completely separate from the internal
 * report's @react-pdf/renderer pipeline (lib/pdf/server.ts) — that pipeline
 * is untouched by this file.
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
  /** One-line verdict, e.g. "Strongest recommendation for this role". */
  verdict: string;
  isPrimary: boolean;
  radar: ClientBriefRadarPoint[];
}

/** Backup-bench row: rank + name + score + verdict only, no chart, no
 * interview-kit page. See lib/pdf/client-brief-selection.ts tierSelection. */
export interface ClientBriefBenchEntry {
  rank: number;
  name: string;
  /** 0-100. */
  score: number;
  verdict: string;
}

export interface ClientBriefInterviewQuestion {
  question: string;
  verifies: string;
}

export interface ClientBriefInterviewPage {
  name: string;
  verdict: string;
  isPrimary: boolean;
  questions: ClientBriefInterviewQuestion[];
}

export interface ShortlistData {
  locale: ClientBriefLocale;
  agencyName: string;
  /** http(s) URL or data: URI. Omitted -> agency-name-only cover, no placeholder mark. */
  agencyLogoUrl?: string;
  roleTitle: string;
  shortlistName: string;
  /** Optional and off by default — see lib/pdf/agency-brief/types.ts for the same convention. */
  clientName?: string;
  /** Pre-formatted display date, e.g. "July 2026". */
  date: string;
  /** 3-4 sentence narrative paragraph, generated per-shortlist (see lib/claude.ts). */
  narrative: string;
  /** Primary tier only (rank 1..openings_count) — full card treatment. */
  cards: ClientBriefCandidateCard[];
  /** Backup tier (rank openings_count+1..target) — compact rank/name/score/verdict row, no chart, own section. Omit or empty when there's no backup bench. */
  benchEntries?: ClientBriefBenchEntry[];
  /** Candidates that cleared the strong/proceed bar but were trimmed from
   * the backup bench to keep this document under the page budget (see
   * planClientBriefDocuments in client-brief-selection.ts). Must never be a
   * silent drop — when set and > 0, a visible line renders under the bench
   * section saying so. */
  benchOmittedCount?: number;
  /** One interview-kit page per PRIMARY candidate only — the backup bench never gets one. */
  interviewPages: ClientBriefInterviewPage[];
  /** Single accent color (agency brand color if available, otherwise a default blue). */
  accentColor?: string;
}

const DEFAULT_ACCENT = "#1D4ED8";
const NEUTRAL = "#6B7280";

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

function copy(locale: ClientBriefLocale) {
  const es = locale === "es";
  const fr = locale === "fr";
  return {
    preparedFor: es ? "Preparado exclusivamente para" : fr ? "Préparé exclusivement pour" : "Prepared exclusively for",
    executiveSummary: es ? "Resumen ejecutivo" : fr ? "Synthèse" : "Executive Summary",
    interviewKit: es ? "Guía de entrevista" : fr ? "Guide d'entretien" : "Interview Kit",
    questionFocus: es ? "Enfoque de la pregunta" : fr ? "Axe de la question" : "Question Focus",
    whatToVerify: es ? "Qué debe confirmar la respuesta" : fr ? "Ce que la réponse doit confirmer" : "What the Answer Should Verify",
    primary: es ? "Recomendación principal" : fr ? "Recommandation principale" : "Primary Recommendation",
    secondary: es ? "Recomendación secundaria" : fr ? "Recommandation secondaire" : "Secondary Recommendation",
    backupBench: es ? "Candidatos suplentes, clasificados" : fr ? "Candidats de réserve, classés" : "Backup Candidates, Ranked",
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
    poweredBy: es ? "Motor de evaluación por IntelligencesTest" : fr ? "Moteur d'évaluation par IntelligencesTest" : "Assessment engine by IntelligencesTest",
  };
}

/** Wraps a label onto multiple lines at word boundaries — Chart.js accepts an
 * array of strings per pointLabel and renders each entry as its own line.
 * Never cuts a word mid-way, unlike a fixed-character slice. */
function wrapLabel(label: string, maxCharsPerLine = 11): string[] {
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

function radarChartConfig(radar: ClientBriefRadarPoint[], color: string, isPrimary: boolean, compact: boolean) {
  return {
    type: "radar",
    data: {
      labels: radar.map((point) => wrapLabel(point.label, compact ? 8 : 11)),
      datasets: [
        {
          data: radar.map((point) => point.value),
          backgroundColor: isPrimary ? `${color}40` : `${color}14`,
          borderColor: color,
          borderWidth: isPrimary ? 2.5 : 1.25,
          pointBackgroundColor: color,
          pointRadius: isPrimary ? 3 : 2,
        },
      ],
    },
    options: {
      responsive: false,
      animation: false,
      layout: compact
        ? { padding: { left: 22, right: 22, top: 16, bottom: 16 } }
        : { padding: { left: 44, right: 44, top: 32, bottom: 32 } },
      plugins: { legend: { display: false } },
      scales: {
        r: {
          min: 0,
          max: 5,
          ticks: { stepSize: 1, display: false },
          pointLabels: { font: { size: compact ? 6.5 : 8, family: "Outfit" }, color: "#374151" },
          grid: { color: "#E5E7EB" },
          angleLines: { color: "#E5E7EB" },
        },
      },
    },
  };
}

/** Returns the card markup only — chart instantiation is deferred to one consolidated
 * script (see buildClientBriefHTML) that waits for document.fonts.ready, so every
 * radar chart's point-label text is measured with the real fonts, not fallback
 * metrics from whichever canvas happens to draw first. */
function candidateCardHtml(card: ClientBriefCandidateCard, accent: string, canvasId: string, c: ReturnType<typeof copy>): string {
  return `
    <div class="candidate-card ${card.isPrimary ? "candidate-card--primary" : "candidate-card--secondary"}" style="${card.isPrimary ? `border-color:${accent};` : ""}">
      <div class="eyebrow" style="${card.isPrimary ? "" : `color:${NEUTRAL};`}">${escapeHtml(card.isPrimary ? c.primary : c.secondary)}</div>
      <div class="candidate-card__name">${escapeHtml(card.name)}</div>
      <div class="candidate-card__verdict">${escapeHtml(card.verdict)}</div>
      <div class="candidate-card__chart"><canvas id="${canvasId}" width="240" height="240"></canvas></div>
    </div>`;
}

/** Used instead of candidateCardHtml when there are more than 2 recommended
 * candidates (a multi-opening shortlist) — a repeating 3-per-row grid instead
 * of the 2-column detailed layout, so the executive summary scales to 15-20
 * names without becoming an unreadable wall of full-size cards. */
function compactCardHtml(card: ClientBriefCandidateCard, accent: string, canvasId: string, rank: number): string {
  return `
    <div class="compact-card${card.isPrimary ? " compact-card--primary" : ""}" style="${card.isPrimary ? `border-color:${accent};` : ""}">
      <div class="compact-card__header">
        <span class="compact-card__rank" style="${card.isPrimary ? `background:${accent};` : ""}">${rank}</span>
        <span class="compact-card__name">${escapeHtml(card.name)}</span>
      </div>
      <div class="compact-card__verdict">${escapeHtml(card.verdict)}</div>
      <div class="compact-card__chart"><canvas id="${canvasId}" width="150" height="150"></canvas></div>
    </div>`;
}

/** Backup-bench entry: same compact-card visual language as compactCardHtml
 * (border, rank badge, name) but no chart — just rank, name, score, verdict.
 * No interview-kit page is ever generated for these. */
function benchEntryHtml(entry: ClientBriefBenchEntry): string {
  return `
    <div class="compact-card compact-card--bench">
      <div class="compact-card__header">
        <span class="compact-card__rank">${entry.rank}</span>
        <span class="compact-card__name">${escapeHtml(entry.name)}</span>
      </div>
      <div class="compact-card__score"><span class="compact-card__score-value">${Math.round(entry.score)}</span><span class="compact-card__score-unit">/100</span></div>
      <div class="compact-card__verdict">${escapeHtml(entry.verdict)}</div>
    </div>`;
}

function interviewPageHtml(pageData: ClientBriefInterviewPage, c: ReturnType<typeof copy>, accent: string, isLast: boolean): string {
  const multi = pageData.questions.length > 1;
  const questions = pageData.questions
    .map(
      (q, index) => `
      <div class="interview-card">
        <div class="interview-card__number">${index + 1}</div>
        <div class="interview-card__body">
          <div class="interview-block__label">${escapeHtml(c.questionFocus)}${multi ? ` ${index + 1}` : ""}</div>
          <div class="interview-block__question">${escapeHtml(q.question)}</div>
          <div class="interview-card__divider"></div>
          <div class="interview-block__label interview-block__label--muted">${escapeHtml(c.whatToVerify)}</div>
          <div class="interview-block__verifies">${escapeHtml(q.verifies)}</div>
        </div>
      </div>`
    )
    .join("");

  return `
    <section class="page${isLast ? "" : " page--break"}">
      <div class="eyebrow">${escapeHtml(c.interviewKit)}</div>
      <h2 class="page3-name">${escapeHtml(pageData.name)}</h2>
      <div class="page3-verdict" style="${pageData.isPrimary ? `color:${accent};` : ""}">${escapeHtml(pageData.verdict)}</div>
      <div class="hairline"></div>
      ${questions}
      <div class="footer">
        <span>${escapeHtml(c.poweredBy)}</span>
      </div>
    </section>`;
}

export function buildClientBriefHTML(data: ShortlistData): string {
  const c = copy(data.locale);
  const accent = data.accentColor ?? DEFAULT_ACCENT;

  const preparedForLine = data.clientName
    ? `${c.preparedFor} ${escapeHtml(data.clientName)}`
    : escapeHtml(data.shortlistName);

  const compact = data.cards.length > 2;

  const cardsHtml = compact
    ? data.cards.map((card, index) => compactCardHtml(card, accent, `radar-${index}`, index + 1)).join("")
    : data.cards.map((card, index) => candidateCardHtml(card, accent, `radar-${index}`, c)).join("");

  const chartInstances = data.cards.map((card, index) => ({
    canvasId: `radar-${index}`,
    config: radarChartConfig(card.radar, card.isPrimary ? accent : NEUTRAL, card.isPrimary, compact),
  }));

  const benchEntries = data.benchEntries ?? [];
  const benchHtml = benchEntries.map((entry) => benchEntryHtml(entry)).join("");
  const benchOmittedCount = data.benchOmittedCount ?? 0;
  // Must never be a silent drop (see ShortlistData.benchOmittedCount) — show
  // the section header even if every backup candidate got trimmed, so the
  // omission line always has a labeled place to appear.
  const showBenchSection = benchEntries.length > 0 || benchOmittedCount > 0;

  const interviewPagesHtml = data.interviewPages
    .map((page, index) => interviewPageHtml(page, c, accent, index === data.interviewPages.length - 1))
    .join("");

  const chartJsPath = path.join(process.cwd(), "node_modules", "chart.js", "dist", "chart.umd.min.js");
  const chartJsSrc = fs.readFileSync(chartJsPath, "utf8");

  return `<!doctype html>
<html lang="${data.locale}">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(data.shortlistName)}</title>
<style>
  @page { size: A4; margin: 20mm 18mm; }

  @font-face {
    font-family: 'Playfair Display';
    font-weight: 400 700;
    font-style: normal;
    src: url('${fontFileUrl("playfair-display-latin.woff2")}') format('woff2');
  }
  @font-face {
    font-family: 'Outfit';
    font-weight: 400 700;
    font-style: normal;
    src: url('${fontFileUrl("outfit-latin.woff2")}') format('woff2');
  }

  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    font-family: 'Outfit', Helvetica, Arial, sans-serif;
    color: #1F2937;
    font-size: 10.5pt;
  }
  h1, h2, h3 { font-family: 'Playfair Display', Georgia, serif; font-weight: 700; margin: 0; }

  .page { position: relative; min-height: 257mm; }
  .page--break { page-break-after: always; break-after: page; }

  /* --- Page 1: cover --- */
  .cover {
    height: 257mm;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
  }
  .cover__logo { max-width: 120px; max-height: 64px; margin-bottom: 18px; object-fit: contain; }
  .cover__logo-placeholder {
    width: 56px; height: 56px; margin-bottom: 18px; border-radius: 8px;
    border: 1px dashed #D1D5DB; display: flex; align-items: center; justify-content: center;
    font-family: 'Outfit', sans-serif; font-size: 18px; font-weight: 600; color: #D1D5DB;
  }
  .cover__agency { font-family: 'Outfit', sans-serif; font-weight: 600; font-size: 13pt; letter-spacing: 0.02em; color: #111827; margin-bottom: 46px; }
  .cover__role { font-size: 27px; line-height: 1.3; color: #111827; margin-bottom: 20px; max-width: 480px; }
  .cover__prepared { font-family: 'Outfit', sans-serif; font-size: 11pt; color: #4B5563; }
  .cover__date { font-family: 'Outfit', sans-serif; font-size: 9.5pt; color: #9CA3AF; margin-top: 6px; }

  /* --- Page 2: executive summary --- */
  .eyebrow { font-family: 'Outfit', sans-serif; font-size: 8pt; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: ${accent}; margin-bottom: 8px; }
  .page2-title { font-size: 22px; margin-bottom: 22px; color: #111827; }
  .narrative { font-family: 'Playfair Display', Georgia, serif; font-size: 16px; line-height: 1.7; color: #1F2937; margin-bottom: 34px; white-space: pre-line; }

  .cards { display: flex; gap: 16px; }
  .candidate-card { flex: 1; border: 1px solid #E5E7EB; border-radius: 4px; padding: 18px; break-inside: avoid; page-break-inside: avoid; }
  .candidate-card--primary { border-width: 2px; }
  .candidate-card--secondary { border-color: #E5E7EB; }
  .candidate-card__name { font-family: 'Playfair Display', serif; font-size: 15px; font-weight: 700; color: #111827; margin-bottom: 4px; }
  .candidate-card__verdict { font-family: 'Outfit', sans-serif; font-size: 9pt; color: #4B5563; margin-bottom: 14px; min-height: 26px; }
  .candidate-card__chart { display: flex; justify-content: center; }

  /* --- Compact grid (>2 recommended candidates) --- */
  .cards-grid { display: flex; flex-wrap: wrap; gap: 12px; }
  .compact-card {
    width: calc((100% - 24px) / 3); box-sizing: border-box;
    border: 1px solid #E5E7EB; border-radius: 4px; padding: 10px 12px 12px;
    break-inside: avoid; page-break-inside: avoid;
  }
  .compact-card--primary { border-width: 2px; }
  .compact-card__header { display: flex; align-items: center; gap: 6px; margin-bottom: 3px; }
  .compact-card__rank {
    flex-shrink: 0; width: 16px; height: 16px; border-radius: 999px; background: ${NEUTRAL};
    color: #fff; font-family: 'Outfit', sans-serif; font-size: 8px; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
  }
  .compact-card__name { font-family: 'Playfair Display', serif; font-size: 11px; font-weight: 700; color: #111827; }
  .compact-card__verdict { font-family: 'Outfit', sans-serif; font-size: 7.5pt; color: #4B5563; line-height: 1.35; margin-bottom: 4px; min-height: 20px; }
  .compact-card__chart { display: flex; justify-content: center; }

  /* --- Backup bench entries (no chart) --- */
  .compact-card--bench { background: #FAFAFA; }
  .compact-card__score { margin: 2px 0 4px; }
  .compact-card__score-value { font-family: 'Playfair Display', serif; font-size: 15px; font-weight: 700; color: #111827; }
  .compact-card__score-unit { font-family: 'Outfit', sans-serif; font-size: 8pt; color: #9CA3AF; margin-left: 2px; }
  .bench-section { margin-top: 30px; }
  .bench-section__subtitle { font-family: 'Outfit', sans-serif; font-size: 9pt; color: #6B7280; margin: -4px 0 16px; max-width: 520px; }
  .bench-section__omitted {
    font-family: 'Outfit', sans-serif; font-size: 9pt; font-style: italic; color: #6B7280;
    margin-top: 14px; padding-top: 12px; border-top: 1px dashed #D1D5DB;
  }

  /* --- Page 3+: interview kit --- */
  .page3-name { font-size: 20px; color: #111827; margin-bottom: 4px; }
  .page3-verdict { font-family: 'Outfit', sans-serif; font-size: 10pt; font-weight: 600; color: #4B5563; margin-bottom: 16px; }
  .hairline { border-top: 1px solid #E5E7EB; margin-bottom: 24px; }

  .interview-card {
    display: flex; gap: 16px;
    border: 1px solid #E5E7EB; border-radius: 6px; background: #FAFAFA;
    padding: 20px 22px; margin-bottom: 18px;
    break-inside: avoid; page-break-inside: avoid;
  }
  .interview-card__number {
    flex-shrink: 0; width: 24px; height: 24px; border-radius: 999px;
    background: ${accent}; color: #fff; font-family: 'Outfit', sans-serif; font-size: 11px; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
  }
  .interview-card__body { flex: 1; }
  .interview-card__divider { border-top: 1px solid #E5E7EB; margin: 14px 0; }
  .interview-block__label { font-family: 'Outfit', sans-serif; font-size: 7.5pt; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: ${accent}; margin-bottom: 6px; }
  .interview-block__label--muted { color: #9CA3AF; }
  .interview-block__question { font-family: 'Playfair Display', serif; font-size: 16px; font-weight: 600; color: #111827; line-height: 1.4; }
  .interview-block__verifies { font-family: 'Outfit', sans-serif; font-size: 10pt; color: #374151; line-height: 1.55; }

  .footer { position: absolute; bottom: 0; left: 0; right: 0; font-family: 'Outfit', sans-serif; font-size: 11px; color: #9CA3AF; border-top: 1px solid #F3F4F6; padding-top: 8px; }
</style>
</head>
<body>
  <script>${chartJsSrc}</script>

  <section class="page page--break">
    <div class="cover">
      ${
        data.agencyLogoUrl
          ? `<img class="cover__logo" src="${escapeHtml(data.agencyLogoUrl)}" alt="" />`
          : `<div class="cover__logo-placeholder">${escapeHtml(data.agencyName.charAt(0).toUpperCase())}</div>`
      }
      <div class="cover__agency">${escapeHtml(data.agencyName)}</div>
      <h1 class="cover__role">${escapeHtml(data.roleTitle)}</h1>
      <div class="cover__prepared">${preparedForLine}</div>
      <div class="cover__date">${escapeHtml(data.date)}</div>
    </div>
  </section>

  <section class="page page--break">
    <div class="eyebrow">${escapeHtml(c.executiveSummary)}</div>
    <h2 class="page2-title">${escapeHtml(data.roleTitle)}</h2>
    <p class="narrative">${escapeHtml(data.narrative)}</p>
    <div class="${compact ? "cards-grid" : "cards"}">
      ${cardsHtml}
    </div>
    ${
      showBenchSection
        ? `<div class="bench-section">
            <div class="eyebrow">${escapeHtml(c.backupBench)}</div>
            <p class="bench-section__subtitle">${escapeHtml(c.backupBenchSubtitle)}</p>
            ${benchEntries.length > 0 ? `<div class="cards-grid">${benchHtml}</div>` : ""}
            ${benchOmittedCount > 0 ? `<p class="bench-section__omitted">${escapeHtml(c.benchOmitted(benchOmittedCount))}</p>` : ""}
          </div>`
        : ""
    }
  </section>

  ${interviewPagesHtml}

  <script>
    document.fonts.ready.then(function () {
      var instances = ${toInlineJson(chartInstances)};
      instances.forEach(function (item) {
        new Chart(document.getElementById(item.canvasId).getContext('2d'), item.config);
      });
    });
  </script>
</body>
</html>`;
}
