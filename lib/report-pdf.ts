import { jsPDF } from "jspdf";
import { assessmentName, assessmentShort } from "@/lib/i18n/assessment-terms";

// ─── Constants ───────────────────────────────────────────────────────────────
const PW = 210, PH = 297, M = 18, CW = PW - M * 2;
const HDR_H = 14, FTR_Y = 283;
const CT = HDR_H + 4; // content top Y
let reportPageTotal = 1;
let activeReportLocale: "en" | "es" = "es";

// ─── Types ───────────────────────────────────────────────────────────────────
export interface AssessmentScore {
  name: string;
  score: number;
  completedAt: string;
}

export interface ComprehensiveReportData {
  candidateName: string;
  candidateEmail: string;
  companyName: string;
  projectName: string;
  reportDate: string;
  reportId: string;
  assessments: AssessmentScore[];
  locale?: "en" | "es";
}

type Tier = "high" | "mid" | "low";

interface RecResult {
  label: string;
  rgb: [number, number, number];
  narrative: string;
}

interface Phrases {
  label: string;
  category: "Cognitive" | "Personality" | "EQ" | "Interpersonal" | "Professional";
  h: string; m: string; l: string;
  wh: string; wm: string; wl: string;
  bh: string[]; bm: string[]; bl: string[];
  coaching: string;
  questions: string[];
}

interface CompetencyItem extends AssessmentScore {
  phrases: Phrases | undefined;
  t: Tier;
}

type ReportCopy = {
  assessmentAverage: string;
  assessmentAvg: string;
  assessmentReport: string;
  assessmentScope: string;
  assessmentScopeBody: string;
  authorizedSignoff: string;
  candidateEmail: string;
  category: string;
  completed: string;
  completedAssessments: (count: number) => string;
  competencyDashboard: string;
  competencyProfileSummary: string;
  confidence: (count: number) => string;
  confidenceLevel: string;
  confidential: string;
  confidentialBar: string;
  confidentialFooter: string;
  company: string;
  developmentAreas: string;
  evidenceTiers: string;
  evidenceTiersBody: string;
  finalSummary: string;
  followUpFocus: string;
  headerReportId: string;
  hiringInsights: string;
  importantLimitations: string;
  importantLimitationsBody: string;
  insufficientStrengths: string;
  interviewGuide: string;
  interviewGuideSubtitle: string;
  methodology: string;
  notProvided: string;
  noDevelopmentAreas: (name: string) => string;
  noRisks: string;
  positiveReviewDefault: string;
  project: string;
  reportDate: string;
  reportGenerated: string;
  reportId: string;
  riskFactors: string;
  score: string;
  scoreBreakdown: string;
  scoreRangeReference: string;
  scoreTiers: string;
  scoreTiersBody: string;
  scoring: string;
  scoringBody: string;
  signature: string;
  strengthsProfile: string;
  tier: string;
  topStrengths: string;
  workplaceImplication: string;
  keyBehaviors: string;
  coachingRecommendation: string;
};

const REPORT_COPY: Record<"en" | "es", ReportCopy> = {
  es: {
    assessmentAverage: "Promedio de evaluaciones",
    assessmentAvg: "PROMEDIO",
    assessmentReport: "INFORME DE EVALUACION DEL CANDIDATO",
    assessmentScope: "Alcance del informe",
    assessmentScopeBody: "Este informe incluye únicamente evaluaciones con resultados completados y guardados para este candidato. Se excluyen evaluaciones no asignadas, incompletas o no relacionadas.",
    authorizedSignoff: "Firma del revisor autorizado",
    candidateEmail: "Correo del candidato",
    category: "Categoria",
    completed: "Completada",
    completedAssessments: (count) => `${count} evaluacion${count === 1 ? "" : "es"}`,
    competencyDashboard: "Panel de competencias",
    competencyProfileSummary: "Resumen del perfil de competencias",
    confidence: (count) => count >= 6 ? "Alta" : count >= 3 ? "Moderada" : "Baja",
    confidenceLevel: "Nivel de confianza",
    confidential: "CONFIDENCIAL",
    confidentialBar: "CONFIDENCIAL - SOLO PARA PERSONAL AUTORIZADO",
    confidentialFooter: "Este informe es confidencial. Solo para personal autorizado. Generado por Intelligences Test.",
    company: "Empresa",
    developmentAreas: "Areas de desarrollo",
    evidenceTiers: "Niveles de evidencia",
    evidenceTiersBody: "Evidencia solida (85+): resultados fuertes en las evaluaciones completadas. Evidencia positiva (70-84): perfil solido. Evidencia mixta (55-69): requiere revision dirigida. Evidencia de cautela (40-54): varios puntos a explorar. Soporte limitado (<40): evidencia debil segun los datos completados.",
    finalSummary: "Resumen final de evaluacion",
    followUpFocus: "Foco de revision posterior",
    headerReportId: "ID del informe",
    hiringInsights: "Lectura para seleccion",
    importantLimitations: "Limitaciones importantes",
    importantLimitationsBody: "Los datos de evaluacion son una entrada entre muchas en una decision de contratacion. Este informe debe revisarse junto con entrevistas estructuradas, referencias, pruebas de trabajo y otros datos relevantes. Las puntuaciones no garantizan desempeno laboral y no deben ser la unica base para una decision de empleo.",
    insufficientStrengths: "No hay datos suficientes para determinar un perfil de fortalezas. Se requieren mas evaluaciones completadas.",
    interviewGuide: "Guia de entrevista",
    interviewGuideSubtitle: "Preguntas conductuales orientadas a cada competencia evaluada.",
    methodology: "Metodologia e interpretacion",
    notProvided: "No proporcionado",
    noDevelopmentAreas: (name) => `${name} obtuvo resultados solidos en las competencias evaluadas. No se identifican areas criticas de desarrollo en las evaluaciones completadas.`,
    noRisks: "No se identifican factores de riesgo significativos. Todas las evaluaciones completadas estan por encima del umbral de cautela.",
    positiveReviewDefault: "Use una entrevista estructurada para validar el perfil de evaluacion antes de tomar una decision final.",
    project: "Proyecto",
    reportDate: "Fecha del informe",
    reportGenerated: "Informe generado",
    reportId: "ID del informe",
    riskFactors: "Factores de riesgo a explorar",
    score: "Puntuacion",
    scoreBreakdown: "Desglose de puntuacion por competencia",
    scoreRangeReference: "Referencia de rangos de puntuacion",
    scoreTiers: "Rangos de puntuacion",
    scoreTiersBody: "Alto (80-100): fortaleza observable. Sobre el promedio (65-79): competencia solida. En desarrollo (50-64): base adecuada que puede fortalecerse. Requiere foco (0-49): brecha que requiere revision estructurada y apoyo de desarrollo.",
    scoring: "Puntuacion",
    scoringBody: "Las puntuaciones se reportan en una escala estandarizada de 0 a 100. En evaluaciones de habilidad con respuestas correctas, representan desempeno porcentual. En evaluaciones conductuales o de personalidad, resumen el modelo de puntuacion configurado para el instrumento.",
    signature: "Firma: __________________________   Fecha: ______________",
    strengthsProfile: "Perfil de fortalezas",
    tier: "Nivel",
    topStrengths: "Fortalezas principales",
    workplaceImplication: "Implicacion laboral",
    keyBehaviors: "Conductas observables",
    coachingRecommendation: "Recomendacion de desarrollo",
  },
  en: {
    assessmentAverage: "Assessment average",
    assessmentAvg: "ASSESSMENT AVG",
    assessmentReport: "CANDIDATE ASSESSMENT REPORT",
    assessmentScope: "Assessment Scope",
    assessmentScopeBody: "This report includes only assessments with saved completed results for this candidate. Unassigned, unfinished, or unrelated assessments are excluded from the report.",
    authorizedSignoff: "Authorized Reviewer Signoff",
    candidateEmail: "Candidate Email",
    category: "Category",
    completed: "Completed",
    completedAssessments: (count) => `${count} assessment${count !== 1 ? "s" : ""}`,
    competencyDashboard: "Competency Dashboard",
    competencyProfileSummary: "Competency Profile Summary",
    confidence: (count) => count >= 6 ? "High" : count >= 3 ? "Moderate" : "Low",
    confidenceLevel: "Confidence Level",
    confidential: "CONFIDENTIAL",
    confidentialBar: "CONFIDENTIAL - FOR AUTHORIZED PERSONNEL ONLY",
    confidentialFooter: "This report is confidential. For authorized personnel only. Generated by Intelligences Test.",
    company: "Company",
    developmentAreas: "Development Areas",
    evidenceTiers: "Evidence Tiers",
    evidenceTiersBody: "Strong Assessment Evidence (85+): strong scores across completed assessments. Positive Assessment Evidence (70-84): solid assessment profile. Mixed Assessment Evidence (55-69): requires targeted review. Cautionary Assessment Evidence (40-54): several concerns to explore. Limited Assessment Support (<40): weak support from the completed assessment data.",
    finalSummary: "Final Assessment Summary",
    followUpFocus: "Follow-up Review Focus",
    headerReportId: "Report ID",
    hiringInsights: "Hiring Insights",
    importantLimitations: "Important Limitations",
    importantLimitationsBody: "Assessment data is one input among many in a hiring decision. This report should be reviewed alongside structured interviews, reference checks, work sample tests, and other relevant data. Assessment scores do not guarantee job performance and should not be the sole basis for any employment decision.",
    insufficientStrengths: "Insufficient data to determine strength profile. More assessments required.",
    interviewGuide: "Interview Question Guide",
    interviewGuideSubtitle: "Behavioral questions targeting each assessed competency, tailored to score tier.",
    methodology: "Methodology & Interpretation Guide",
    notProvided: "Not provided",
    noDevelopmentAreas: (name) => `${name} achieved strong scores across all assessed competencies. No significant development areas identified.`,
    noRisks: "No significant risk factors identified. All completed assessments scored above the caution threshold.",
    positiveReviewDefault: "Use a structured interview to validate the assessment profile before making a final decision.",
    project: "Project",
    reportDate: "Report Date",
    reportGenerated: "Report Generated",
    reportId: "Report ID",
    riskFactors: "Risk Factors To Explore",
    score: "Score",
    scoreBreakdown: "Score Breakdown By Competency",
    scoreRangeReference: "Score Range Reference",
    scoreTiers: "Score Tiers",
    scoreTiersBody: "High (80-100): A demonstrable strength with observable workplace impact. Above Average (65-79): Solid competency that can be leveraged immediately. Developing (50-64): Adequate foundation; targeted development may build this area. Needs Focus (0-49): A meaningful gap requiring structured review and development support.",
    scoring: "Scoring",
    scoringBody: "Scores are reported on a standardized 0-100 scale. For ability assessments with correct answers, scores represent percentage performance. For behavioral and personality assessments, scores summarize the instrument's configured scoring model.",
    signature: "Signature: __________________________   Date: ______________",
    strengthsProfile: "Strengths Profile",
    tier: "Tier",
    topStrengths: "Top Strengths",
    workplaceImplication: "Workplace Implication",
    keyBehaviors: "Key Observed Behaviors",
    coachingRecommendation: "Coaching Recommendation",
  },
};

function localeOf(data: ComprehensiveReportData): "en" | "es" {
  return data.locale === "en" ? "en" : "es";
}

function copyOf(data: ComprehensiveReportData): ReportCopy {
  return REPORT_COPY[localeOf(data)];
}

function displayAssessmentName(name: string, locale: "en" | "es", short = false): string {
  if (locale === "es") return short ? assessmentShort(name, BANK[name]?.label ?? name, "es") : assessmentName(name, "es");
  return short ? BANK[name]?.label ?? name : name;
}

function categoryDisplay(category: string, locale: "en" | "es"): string {
  if (locale === "en") return category;
  const labels: Record<string, string> = {
    Cognitive: "Capacidad cognitiva",
    Personality: "Perfil de personalidad",
    EQ: "Inteligencia emocional y conductual",
    Interpersonal: "Habilidades interpersonales",
    Professional: "Competencias profesionales",
  };
  return labels[category] ?? category;
}

function tierDisplay(t: Tier, locale: "en" | "es"): string {
  if (locale === "en") return t.charAt(0).toUpperCase() + t.slice(1);
  return t === "high" ? "Alto" : t === "mid" ? "Medio" : "Bajo";
}

// ─── Score utilities ─────────────────────────────────────────────────────────
function tier(score: number): Tier {
  return score >= 75 ? "high" : score >= 55 ? "mid" : "low";
}

function scoreRGB(score: number): [number, number, number] {
  if (score >= 80) return [16, 185, 129];
  if (score >= 65) return [59, 130, 246];
  if (score >= 50) return [245, 158, 11];
  return [239, 68, 68];
}

function recTier(avg: number, firstName: string, locale: "en" | "es"): RecResult {
  if (locale === "es") {
    if (avg >= 85) return { label: "Evidencia solida", rgb: [16, 185, 129], narrative: `${firstName} obtuvo resultados excelentes en las evaluaciones completadas. La evidencia disponible respalda avanzar con una revision estructurada y una entrevista enfocada en los requisitos especificos del rol.` };
    if (avg >= 70) return { label: "Evidencia positiva", rgb: [59, 130, 246], narrative: `${firstName} muestra un perfil solido en las evaluaciones completadas. Los resultados respaldan continuar con la revision, usando preguntas de entrevista dirigidas a las areas de menor puntuacion.` };
    if (avg >= 55) return { label: "Evidencia mixta", rgb: [245, 158, 11], narrative: `${firstName} presenta un perfil mixto. Algunas areas son prometedoras y otras requieren validacion adicional mediante entrevista estructurada y evidencia del contexto laboral.` };
    if (avg >= 40) return { label: "Evidencia de cautela", rgb: [249, 115, 22], narrative: `${firstName} obtuvo puntuaciones por debajo del nivel preferido en varias evaluaciones completadas. Use estos resultados como senal para una revision mas profunda antes de tomar una decision.` };
    return { label: "Soporte limitado", rgb: [239, 68, 68], narrative: `Las puntuaciones completadas de ${firstName} muestran brechas relevantes. Este informe no respalda avanzar basandose solo en la evidencia de evaluacion; la decision final debe incorporar todos los insumos de seleccion relevantes.` };
  }
  if (avg >= 85) return { label: "Strong Assessment Evidence", rgb: [16, 185, 129], narrative: `${firstName} achieved exceptional scores across the completed assessments. The available evidence supports moving forward with a structured review and interview focused on role-specific requirements.` };
  if (avg >= 70) return { label: "Positive Assessment Evidence", rgb: [59, 130, 246], narrative: `${firstName} demonstrates solid competency across the completed assessments. The profile supports continued consideration, with interview questions targeted to the lower-scoring areas.` };
  if (avg >= 55) return { label: "Mixed Assessment Evidence", rgb: [245, 158, 11], narrative: `${firstName} shows a mixed assessment profile. Some areas are promising, while others require closer review through structured interview evidence and work-context validation.` };
  if (avg >= 40) return { label: "Cautionary Assessment Evidence", rgb: [249, 115, 22], narrative: `${firstName} scored below preferred levels on several completed assessments. Treat this as a signal for deeper structured review before making any hiring decision.` };
  return { label: "Limited Assessment Support", rgb: [239, 68, 68], narrative: `${firstName}'s completed assessment scores show material gaps. This report does not support advancement based on assessment evidence alone, but final decisions should include all relevant hiring inputs.` };
}

// ─── Drawing primitives ──────────────────────────────────────────────────────
function phdr(doc: jsPDF, name: string, rid: string) {
  const copy = REPORT_COPY[activeReportLocale];
  doc.setFillColor(7, 8, 15);
  doc.rect(0, 0, PW, HDR_H, "F");
  doc.setDrawColor(29, 78, 216); doc.setLineWidth(0.4);
  doc.line(0, HDR_H, PW, HDR_H);
  doc.setFontSize(7.5); doc.setFont("helvetica", "bold"); doc.setTextColor(255, 255, 255);
  doc.text(name.length > 32 ? name.slice(0, 31) + "…" : name, M, 9);
  doc.setFont("helvetica", "normal"); doc.setTextColor(140, 177, 255);
  doc.text(`${copy.headerReportId}: ${rid}`, M + 95, 9);
  doc.text(copy.confidential, PW - M, 9, { align: "right" });
}

function pftr(doc: jsPDF, pg: number, total = reportPageTotal) {
  const copy = REPORT_COPY[activeReportLocale];
  doc.setDrawColor(226, 232, 240); doc.setLineWidth(0.3);
  doc.line(M, FTR_Y, PW - M, FTR_Y);
  doc.setFontSize(6.5); doc.setFont("helvetica", "normal"); doc.setTextColor(148, 163, 184);
  doc.text(copy.confidentialFooter, M, FTR_Y + 5);
  doc.text(`${pg} / ${total}`, PW - M, FTR_Y + 5, { align: "right" });
}

function secHead(doc: jsPDF, text: string, y: number): number {
  doc.setFontSize(8); doc.setFont("helvetica", "bold"); doc.setTextColor(100, 116, 139);
  doc.text(text, M, y);
  doc.setDrawColor(226, 232, 240); doc.setLineWidth(0.4);
  doc.line(M, y + 2.5, PW - M, y + 2.5);
  return y + 8;
}

function hBar(doc: jsPDF, x: number, y: number, w: number, score: number, label?: string) {
  if (label) {
    const short = label.length > 30 ? label.slice(0, 29) + "…" : label;
    doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.setTextColor(30, 41, 59);
    doc.text(short, x, y - 1.5);
  }
  doc.setFillColor(241, 245, 249);
  doc.rect(x, y, w, 4, "F");
  const [r, g, b] = scoreRGB(score);
  if (score > 0) { doc.setFillColor(r, g, b); doc.rect(x, y, w * Math.min(score / 100, 1), 4, "F"); }
  doc.setFontSize(7.5); doc.setFont("helvetica", "bold"); doc.setTextColor(r, g, b);
  doc.text(`${score}`, x + w + 3, y + 3.5);
}

function gauge(doc: jsPDF, cx: number, cy: number, radius: number, score: number) {
  const steps = 90;
  doc.setLineWidth(6);
  doc.setDrawColor(226, 232, 240);
  for (let i = 0; i < steps; i++) {
    const a1 = Math.PI - (i / steps) * Math.PI, a2 = Math.PI - ((i + 1) / steps) * Math.PI;
    doc.line(cx + radius * Math.cos(a1), cy - radius * Math.sin(a1), cx + radius * Math.cos(a2), cy - radius * Math.sin(a2));
  }
  const [r, g, b] = scoreRGB(score);
  doc.setDrawColor(r, g, b);
  const filled = Math.round(steps * score / 100);
  for (let i = 0; i < filled; i++) {
    const a1 = Math.PI - (i / steps) * Math.PI, a2 = Math.PI - ((i + 1) / steps) * Math.PI;
    doc.line(cx + radius * Math.cos(a1), cy - radius * Math.sin(a1), cx + radius * Math.cos(a2), cy - radius * Math.sin(a2));
  }
  doc.setLineWidth(0.5);
  doc.setFontSize(28); doc.setFont("helvetica", "bold"); doc.setTextColor(r, g, b);
  doc.text(`${score}`, cx, cy - 5, { align: "center" });
  doc.setFontSize(7); doc.setFont("helvetica", "normal"); doc.setTextColor(148, 163, 184);
  doc.text("/100", cx, cy + 3, { align: "center" });
  doc.setFontSize(7); doc.setTextColor(100, 116, 139);
  doc.text(activeReportLocale === "es" ? "PROMEDIO" : "ASSESSMENT AVERAGE", cx, cy + 9, { align: "center" });
  doc.setFontSize(6.5); doc.setTextColor(148, 163, 184);
  doc.text("0", cx - radius - 2, cy + 1.5, { align: "right" });
  doc.text("50", cx, cy - radius - 3, { align: "center" });
  doc.text("100", cx + radius + 2, cy + 1.5);
}

function radar(doc: jsPDF, cx: number, cy: number, radius: number, data: { label: string; score: number }[]) {
  const n = data.length;
  if (n < 3) return;
  const step = (2 * Math.PI) / n;
  doc.setLineWidth(0.2);
  for (let ring = 1; ring <= 4; ring++) {
    const r = radius * ring / 4;
    const pts = data.map((_, i) => ({ x: cx + r * Math.cos(-Math.PI / 2 + i * step), y: cy + r * Math.sin(-Math.PI / 2 + i * step) }));
    doc.setDrawColor(226, 232, 240);
    for (let i = 0; i < n; i++) doc.line(pts[i].x, pts[i].y, pts[(i + 1) % n].x, pts[(i + 1) % n].y);
  }
  doc.setDrawColor(209, 213, 225);
  data.forEach((_, i) => {
    const ang = -Math.PI / 2 + i * step;
    doc.line(cx, cy, cx + radius * Math.cos(ang), cy + radius * Math.sin(ang));
  });
  const pts = data.map((d, i) => {
    const ang = -Math.PI / 2 + i * step, r = radius * d.score / 100;
    return { x: cx + r * Math.cos(ang), y: cy + r * Math.sin(ang) };
  });
  doc.setDrawColor(29, 78, 216); doc.setLineWidth(0.8);
  for (let i = 0; i < n; i++) doc.line(pts[i].x, pts[i].y, pts[(i + 1) % n].x, pts[(i + 1) % n].y);
  doc.setFillColor(29, 78, 216);
  pts.forEach(p => doc.circle(p.x, p.y, 1, "F"));
  data.forEach((d, i) => {
    const ang = -Math.PI / 2 + i * step;
    const lx = cx + (radius + 10) * Math.cos(ang), ly = cy + (radius + 10) * Math.sin(ang);
    const align: "left" | "center" | "right" = Math.cos(ang) > 0.3 ? "left" : Math.cos(ang) < -0.3 ? "right" : "center";
    const short = d.label.length > 13 ? d.label.slice(0, 12) + "…" : d.label;
    doc.setFontSize(6); doc.setFont("helvetica", "bold"); doc.setTextColor(71, 85, 105);
    doc.text(short, lx, ly, { align });
    doc.setFont("helvetica", "normal"); doc.setTextColor(59, 130, 246);
    doc.text(`${d.score}`, lx, ly + 4, { align });
  });
}

function ww(doc: jsPDF, text: string, x: number, y: number, maxW: number, size = 8.5, style: "normal" | "bold" | "italic" = "normal", color: [number, number, number] = [30, 41, 59]): number {
  doc.setFontSize(size); doc.setFont("helvetica", style); doc.setTextColor(...color);
  const lines = doc.splitTextToSize(text, maxW) as string[];
  doc.text(lines, x, y);
  return y + lines.length * (size * 0.38 + 0.5);
}

function bullets(doc: jsPDF, items: string[], x: number, y: number, maxW: number): number {
  items.forEach(item => {
    doc.setFillColor(148, 163, 184);
    doc.circle(x + 1.5, y - 1.3, 0.8, "F");
    const lines = doc.splitTextToSize(item, maxW - 6) as string[];
    doc.setFontSize(8.5); doc.setFont("helvetica", "normal"); doc.setTextColor(30, 41, 59);
    doc.text(lines, x + 5, y);
    y += lines.length * 3.7 + 2;
  });
  return y;
}

function tierBadge(doc: jsPDF, x: number, y: number, t: Tier) {
  const configs = activeReportLocale === "es"
    ? { high: { rgb: [16, 185, 129] as [number, number, number], label: "ALTO" }, mid: { rgb: [245, 158, 11] as [number, number, number], label: "MED" }, low: { rgb: [239, 68, 68] as [number, number, number], label: "BAJO" } }
    : { high: { rgb: [16, 185, 129] as [number, number, number], label: "HIGH" }, mid: { rgb: [245, 158, 11] as [number, number, number], label: "MID" }, low: { rgb: [239, 68, 68] as [number, number, number], label: "LOW" } };
  const { rgb, label } = configs[t];
  doc.setFillColor(...rgb);
  doc.rect(x, y - 3.5, 12, 5, "F");
  doc.setFontSize(6); doc.setFont("helvetica", "bold"); doc.setTextColor(255, 255, 255);
  doc.text(label, x + 6, y, { align: "center" });
}

// ─── Phrase banks ────────────────────────────────────────────────────────────
const BANK: Record<string, Phrases> = {
  "Critical Thinking Test": {
    label: "Critical Thinking", category: "Cognitive",
    h: "Demonstrates exceptional analytical reasoning and structured problem decomposition. Consistently identifies logical inconsistencies and evaluates evidence rigorously before reaching conclusions.",
    m: "Shows solid foundational logic with capacity to sharpen systematic analysis. Handles structured problems well; benefits from frameworks in highly ambiguous situations.",
    l: "Analytical skills are developing. Structured problem-solving frameworks and deliberate practice with evidence-based reasoning will build this core competency.",
    wh: "Will excel at diagnosing complex issues, building evidence-based proposals, and constructively challenging weak assumptions in team discussions.",
    wm: "Performs well on routine analysis; may need support navigating highly ambiguous or multi-variable problems under time pressure.",
    wl: "Benefits from clear checklists, defined procedures, and regular coaching on reasoning approaches before tackling high-stakes complex decisions.",
    bh: ["Structures complex problems before seeking solutions", "Challenges assumptions with evidence, not opinion", "Identifies root causes rather than surface symptoms"],
    bm: ["Applies structured approaches to familiar problem types", "Willing to question processes when prompted", "Improving at separating facts from inferences"],
    bl: ["Tends toward surface-level analysis", "May jump to conclusions without sufficient evidence", "Benefits from guided analysis frameworks and worked examples"],
    coaching: "Practice daily logical puzzles and case-analysis exercises. Use structured frameworks (e.g., 5 Whys, Issue Tree) in real work situations to build this habit.",
    questions: ["Describe a situation where you had to make a decision with incomplete information. What was your reasoning process?", "Walk me through how you approach a complex problem you've never encountered before.", "Tell me about a time you identified a flaw in a plan that others had missed."],
  },
  "Adversity Quotient (AQ) Test": {
    label: "Adversity Quotient", category: "EQ",
    h: "Demonstrates exceptional resilience and the ability to sustain performance under significant pressure. Views setbacks as temporary, contained, and within their influence to resolve.",
    m: "Shows reasonable resilience with capacity to recover from setbacks. May occasionally over-extend the perceived impact of difficulties beyond their actual scope.",
    l: "Resilience is an area for development. The emotional and practical impact of setbacks can affect performance consistency and requires deliberate management.",
    wh: "Handles high-pressure environments, role ambiguity, and rapid change with composure. A stabilizing influence during organizational challenges.",
    wm: "Performs reliably in moderately challenging environments. Extended periods of high pressure or sustained uncertainty may affect output quality.",
    wl: "Requires a stable, structured environment to maintain consistent performance. Additional support and manager check-ins during challenging periods will be beneficial.",
    bh: ["Maintains focus and output during organizational upheaval", "Frames difficulties as temporary learning opportunities", "Recovers quickly from setbacks without extended rumination"],
    bm: ["Generally bounces back from difficulties within reasonable time", "Can manage moderate stress when given clarity on priorities", "Developing self-awareness around personal stress triggers"],
    bl: ["May need extended time to recover from significant setbacks", "Challenges can impact morale beyond their actual scope", "Benefits from strong managerial support and a clear structured environment"],
    coaching: "Build resilience through regular reflection on past challenges you've overcome. Practice cognitive reframing — shifting from 'this is a crisis' to 'this is a solvable problem with a time limit.'",
    questions: ["Describe the most difficult professional setback you've faced. How did you respond and what did you learn?", "Tell me about a time you had to maintain high performance during a chaotic or uncertain period.", "How do you typically handle repeated failures or setbacks when working toward a long-term goal?"],
  },
  "Emotional Intelligence Test": {
    label: "Emotional Intelligence", category: "EQ",
    h: "Exhibits strong self-awareness, empathy, and effective navigation of interpersonal dynamics. Manages emotions constructively in high-stakes situations and supports team psychological safety.",
    m: "Demonstrates reasonable emotional self-regulation and interpersonal sensitivity. May benefit from developing greater consistency in empathetic communication under pressure.",
    l: "Emotional intelligence is an area for growth. Developing self-awareness and empathy will meaningfully strengthen professional relationships and conflict navigation.",
    wh: "A natural collaborator who builds trust quickly, navigates conflict productively, and brings emotional steadiness to challenging team dynamics.",
    wm: "Works well in stable team environments. May benefit from coaching on reading nuanced interpersonal cues and managing reactions in high-stress moments.",
    wl: "Requires intentional effort on self-regulation and perspective-taking. A coach or mentor can significantly accelerate development in this critical area.",
    bh: ["Reads interpersonal dynamics quickly and adapts communication style accordingly", "De-escalates tense situations with composure and curiosity", "Builds genuine rapport across diverse personality types"],
    bm: ["Aware of own emotional states in most familiar situations", "Generally empathetic to team members' perspectives", "Working on consistency in high-emotion or high-stakes scenarios"],
    bl: ["May react impulsively under stress, affecting team dynamics", "Interpersonal friction can arise from communication style", "Benefits from structured feedback on interpersonal impact"],
    coaching: "Practice 'pause-and-reflect' before responding in tense situations. Seek 360-degree feedback on your interpersonal impact and work with a coach on identified blind spots.",
    questions: ["Tell me about a time you had to work closely with someone whose communication style was very different from yours.", "Describe a situation where you had to manage your own emotional reaction to deliver an effective outcome.", "How do you approach giving feedback to someone who is visibly upset or resistant to hearing it?"],
  },
  "Leadership Styles Test": {
    label: "Leadership", category: "EQ",
    h: "Demonstrates a sophisticated, adaptable leadership repertoire. Can flex effectively between directive, coaching, and collaborative styles based on situational demands and team readiness.",
    m: "Shows a clear primary leadership style with developing ability to flex when needed. Benefits from deliberate practice in situations calling for a different approach.",
    l: "Leadership style awareness is developing. Broadening the leadership repertoire is critical for managing diverse teams and navigating complex organizational situations.",
    wh: "Will energize teams, navigate ambiguity, and make sound people decisions. Candidates who score at this level typically exceed expectations in people-manager roles.",
    wm: "Effective in situations that align with their dominant style. With coaching, can expand to handle a broader range of team and organizational challenges.",
    wl: "Will need significant leadership development investment if placed in a people-management role. Consider starting with team lead responsibilities before managing independently.",
    bh: ["Adapts communication and direction-setting to individual team members", "Balances short-term direction with long-term team development", "Creates psychological safety while maintaining clear accountability"],
    bm: ["Delivers strong results using their preferred leadership style", "Beginning to recognize when their default approach needs adjustment", "Open to feedback on leadership effectiveness from peers"],
    bl: ["Relies heavily on a single approach regardless of situation", "Team dynamics may suffer under sustained high-stress conditions", "Requires a structured leadership development program with coaching support"],
    coaching: "Shadow leaders known for different styles from your own. Study the Situational Leadership model and practice identifying team readiness before choosing an approach.",
    questions: ["Describe a time you had to shift your leadership approach to meet the needs of a specific team member or situation.", "Tell me about a situation where your initial leadership strategy wasn't working. How did you adapt?", "How do you balance giving team members autonomy with ensuring accountability and results?"],
  },
  "Numerical Intelligence Test": {
    label: "Numerical Reasoning", category: "Cognitive",
    h: "Demonstrates strong quantitative reasoning, pattern recognition in numerical data, and comfort with data-driven decision-making. Translates numbers into clear insights naturally.",
    m: "Shows solid numerical aptitude for standard analytical tasks. Complex data interpretation under time constraints may benefit from additional practice and structured tools.",
    l: "Numerical reasoning is an area for development. Basic calculations are manageable, but interpreting complex data sets and numerical trends requires support and structured guidance.",
    wh: "Will thrive in data-intensive environments, quickly translating numbers into actionable insights without significant support or extended processing time.",
    wm: "Handles routine quantitative tasks well. Structured analytical frameworks and visualization tools will help when dealing with complex or novel numerical problems.",
    wl: "Will need data analysis tools and a capable analytical partner when interpreting complex numerical information. Not a strong fit for data-intensive roles without development support.",
    bh: ["Comfortable interpreting charts, trends, and statistical summaries quickly", "Uses numerical data to support decisions and challenge intuition-based thinking", "Spots numerical inconsistencies or anomalies promptly"],
    bm: ["Handles standard calculations and basic data interpretation competently", "May slow down with complex multi-step numerical reasoning", "Building confidence through repeated exposure to data-heavy work"],
    bl: ["Prefers qualitative over quantitative information formats", "May avoid data-driven analysis when qualitative alternatives are available", "Benefits from Excel training, data literacy coaching, and structured practice"],
    coaching: "Practice interpreting data sets and charts daily. Work through numerical reasoning exercises and seek roles with moderate data requirements to build confidence and speed progressively.",
    questions: ["Describe a time you used data or numbers to make or challenge a business decision.", "Walk me through your approach to analyzing a complex data set you've never seen before.", "Tell me about a situation where your numerical analysis led to a conclusion that surprised the team."],
  },
  "Personality Type Test": {
    label: "Personality", category: "Personality",
    h: "Profile indicates strong alignment between natural personality tendencies and high-performing behavioral patterns. Self-awareness of strengths and blind spots is evident throughout.",
    m: "Personality profile shows a balanced mix of traits adaptable across work contexts. Developing awareness of how the profile impacts team dynamics will add significant value.",
    l: "Personality profile reveals traits that may create friction in certain work contexts. Deliberate self-awareness and behavioral management will support professional effectiveness.",
    wh: "Natural cultural fit with high-performance environments. Likely to integrate quickly, build strong relationships, and contribute positively to team dynamics from day one.",
    wm: "Will adapt well to most team environments with appropriate context-setting. Clear role expectations and regular feedback loops will support optimal performance.",
    wl: "Requires careful role placement to ensure personality fit. Clear boundaries, structured feedback, and careful team composition considerations are important.",
    bh: ["Demonstrates self-awareness about personal strengths and derailers", "Natural communication style suits collaborative team environments", "Balances task focus with meaningful relationship building"],
    bm: ["Shows reasonable self-awareness in familiar professional contexts", "Learning to adapt natural tendencies to different situational demands", "Responds well to direct feedback on behavioral impact"],
    bl: ["May need coaching to navigate situations that conflict with natural tendencies", "Benefits from structured self-reflection and 360-degree feedback", "Consider team composition carefully before onboarding"],
    coaching: "Take a validated personality assessment (e.g., Big Five, Hogan) with a debrief coach. Identify 2-3 behavioral tendencies to actively leverage and 1-2 to consciously manage in professional settings.",
    questions: ["How would your closest colleagues describe working with you on a challenging project?", "Describe a work environment where you've felt most energized and productive. What made it that way?", "Tell me about a time your natural work style created friction with others. How did you handle it?"],
  },
  "Situational Judgment Test": {
    label: "Situational Judgment", category: "Professional",
    h: "Demonstrates sound judgment in complex, multi-stakeholder scenarios. Choices reflect good risk calibration, ethical awareness, and practical organizational effectiveness.",
    m: "Shows reasonable situational judgment for most common work scenarios. Edge cases and high-stakes decisions benefit from structured deliberation and additional frameworks.",
    l: "Situational judgment is developing. Common scenarios with competing priorities and ethical nuance require additional structured decision-making frameworks and mentoring.",
    wh: "Will navigate workplace dilemmas, competing priorities, and interpersonal complexity with confidence, sound reasoning, and a clear values anchor.",
    wm: "Handles familiar work situations well. Benefits from exposure to edge cases and regular discussion of ethical scenarios to sharpen real-world judgment.",
    wl: "Requires close mentoring and clear escalation protocols in the early role stages. Frequent check-ins on decision-making approaches will accelerate development.",
    bh: ["Weighs multiple stakeholder perspectives before committing to a course of action", "Recognizes and avoids false dichotomies in complex situations", "Balances short-term pragmatism with long-term organizational values"],
    bm: ["Makes sound decisions in well-defined scenarios with clear parameters", "Seeks input before committing on high-ambiguity situations", "Growing capacity to handle genuinely competing priorities"],
    bl: ["May oversimplify complex situations with competing demands", "Risk calibration and stakeholder analysis need further development", "Benefits from worked examples and structured decision frameworks"],
    coaching: "Study case studies involving ethical dilemmas and competing priorities. Practice structured decision-making (e.g., DECIDE framework) before making judgments in new or high-stakes situations.",
    questions: ["Tell me about a time you faced a situation with no clearly right answer. How did you decide what to do?", "Describe a situation where you had to balance competing stakeholder needs. What was your approach?", "Tell me about a time you disagreed with a decision your team or manager made. How did you handle it?"],
  },
  "Attention to Detail Test": {
    label: "Attention to Detail", category: "Professional",
    h: "Exceptional accuracy in detecting errors, inconsistencies, and gaps in information. A natural tendency to verify before acting leads to consistently high-quality outputs.",
    m: "Catches most errors in familiar contexts. May miss subtle inconsistencies when working at pace or on complex multi-variable tasks under deadline pressure.",
    l: "Attention to detail requires development. A structured review process and systematic checklists are essential before submitting work products.",
    wh: "Will produce reliable, accurate work with minimal supervision — an asset in compliance, finance, quality control, documentation, and any precision-dependent role.",
    wm: "Quality is generally good; occasional errors arise under time pressure or in unfamiliar territory. A peer review step before submission is recommended.",
    wl: "Will require a quality gate before deliverables are shared externally or used for decision-making. Pairing with a detail-oriented colleague is strongly recommended.",
    bh: ["Spots errors and inconsistencies quickly even at high volume", "Builds and uses verification checklists as a natural habit", "Asks clarifying questions before committing to action"],
    bm: ["Generally produces accurate work in standard conditions", "Self-reviews before submitting but may miss edge-case errors", "Improving quality consistency under deadline pressure"],
    bl: ["May proceed without adequate verification of inputs or outputs", "Error rates increase noticeably under time pressure", "Benefits from structured quality review processes and accountability checkpoints"],
    coaching: "Implement a personal quality checklist for all deliverables. Practice 'slow it down to speed it up' — deliberate verification at submission points catches the majority of errors before they matter.",
    questions: ["Describe a situation where your attention to detail caught a significant error before it became a problem.", "How do you manage quality when you're working under very tight deadlines?", "Tell me about a time when you missed an important detail. What happened and what did you change afterward?"],
  },
  "Verbal Reasoning Test": {
    label: "Verbal Reasoning", category: "Cognitive",
    h: "Strong command of written language comprehension, inference, and logical deduction from text. Navigates complex documents quickly, accurately, and without losing key nuance.",
    m: "Solid reading comprehension for standard work materials. More nuanced inference or highly ambiguous text may require additional time or a second read-through.",
    l: "Verbal reasoning is developing. Complex written materials, abstract language, and implicit inferences present challenges that deliberate practice can address progressively.",
    wh: "Will process reports, proposals, contracts, and complex communications quickly and accurately. A reliable interpretation resource in text-heavy environments.",
    wm: "Handles standard written communication effectively. Highly complex or legally nuanced documents may benefit from a second review or peer check.",
    wl: "Written communication and document-intensive work may create bottlenecks. Simplified summaries, clear language, and verbal explanation will aid comprehension and reduce risk.",
    bh: ["Extracts key insights from complex text efficiently without losing detail", "Distinguishes main arguments from supporting evidence without confusion", "Comfortable with technical writing, formal documentation, and dense reports"],
    bm: ["Reads standard professional materials accurately and purposefully", "May need extra time with dense technical or regulatory documents", "Improving inference skills when working with unfamiliar content domains"],
    bl: ["Prefers simplified or visually structured information over dense prose", "Complex documentation may create comprehension bottlenecks and errors", "Benefits from structured reading guides, templates, and verbal briefings"],
    coaching: "Read diverse and complex material daily — business reports, research articles, legal summaries. Practice identifying the main claim, the supporting evidence, and the implicit assumptions in each piece.",
    questions: ["Describe a time when you had to quickly understand a complex document and act on it. How did you approach it?", "Tell me about a situation where miscommunication in written form caused a problem. What could have been different?", "How do you ensure accurate understanding when presented with technically complex written information?"],
  },
  "Abstract Reasoning Test": {
    label: "Abstract Reasoning", category: "Cognitive",
    h: "Excellent capacity for identifying patterns, rules, and relationships in novel non-verbal information. Adapts readily to new frameworks, systems, and conceptual models.",
    m: "Solid pattern recognition in familiar abstract contexts. Novel or rapidly changing rule systems may require additional processing time before full competence is established.",
    l: "Abstract reasoning is developing. Unfamiliar systems and non-verbal patterns take time to decode — concrete examples and visual aids will support the learning process.",
    wh: "Will adapt to new software, systems, processes, and roles rapidly. A genuinely quick learner who performs well in ambiguous or first-time contexts.",
    wm: "Adapts to new environments at a reasonable pace with appropriate onboarding. Benefits from structured introduction to new systems before fully independent operation.",
    wl: "Requires extended onboarding time for new systems and processes. Concrete, step-by-step guidance rather than general principles will accelerate initial adaptation.",
    bh: ["Rapidly builds accurate mental models of new systems and processes", "Identifies non-obvious patterns in complex data and processes", "Excels at innovation and creative problem-solving requiring fresh thinking"],
    bm: ["Builds competence in new domains with moderate structured support", "Comfortable with familiar patterns; growing confidence in novel contexts", "Responds well to concrete examples before generalizing to principles"],
    bl: ["Step-by-step instruction is more effective than principles-first approaches", "Needs concrete anchors when encountering abstract concepts", "Benefits significantly from visualization tools, diagrams, and worked examples"],
    coaching: "Practice abstract reasoning puzzles daily. When learning new systems, draw connection diagrams showing how components interact before diving into operational details.",
    questions: ["Describe a time you had to learn an entirely new system or framework quickly. What was your approach?", "Tell me about a situation where you identified a pattern that others in your team had missed.", "How do you approach a problem when the rules or parameters aren't clearly defined upfront?"],
  },
  "Mechanical Reasoning Test": {
    label: "Mechanical Reasoning", category: "Cognitive",
    h: "Strong spatial awareness and clear understanding of physical systems, forces, and mechanical principles. Applies this knowledge effectively to practical problem-solving.",
    m: "Adequate understanding of basic mechanical concepts. Complex or multi-component mechanical systems may require additional study or structured hands-on experience.",
    l: "Mechanical reasoning is an area for development. Roles requiring significant technical or mechanical understanding will need structured on-the-job training and close mentoring.",
    wh: "Well-suited for technical, engineering, or operations roles. Reduces training time in hands-on environments and applies mechanical reasoning proactively to problem prevention.",
    wm: "Competent in standard technical tasks with appropriate instruction. Hands-on exposure and structured technical training will build confidence with complex machinery.",
    wl: "Technical and mechanical roles will require significant training investment and close supervision. Role fit should be carefully considered given this profile.",
    bh: ["Intuitively understands how physical systems function", "Identifies mechanical failure points and risks proactively", "Translates technical diagrams and schematics into practical action confidently"],
    bm: ["Handles familiar mechanical tasks competently with clear instructions", "Builds understanding of new equipment through structured hands-on practice", "Growing comfort with reading technical diagrams and specifications"],
    bl: ["Requires hands-on demonstration to understand mechanical concepts", "Verbal or written technical explanations alone are typically insufficient", "Needs structured technical curriculum and ongoing mentoring"],
    coaching: "Study mechanical diagrams and engineering explainer content regularly. Seek hands-on experience with equipment relevant to the target role. Consider formal technical certification.",
    questions: ["Describe a situation where you had to troubleshoot a mechanical or technical problem. How did you approach it?", "Tell me about a time you had to understand how a complex physical system worked in order to solve a problem.", "How do you approach learning new technical or mechanical equipment in a role you haven't held before?"],
  },
  "Communication Skills Test": {
    label: "Communication", category: "Interpersonal",
    h: "Highly effective communicator across written and verbal channels. Adapts style and complexity to audience needs with natural skill, structuring messages for maximum clarity and impact.",
    m: "Generally clear and effective in familiar communication contexts. Complex or unfamiliar audiences may require additional preparation and deliberate structural planning.",
    l: "Communication skills are developing. Regular practice, targeted feedback, and structured communication frameworks will accelerate meaningful improvement.",
    wh: "Will represent the organization credibly in client, stakeholder, and team communications. Minimal oversight needed on even high-visibility communication tasks.",
    wm: "Handles day-to-day professional communication competently. High-stakes or cross-functional communication may benefit from pre-review and coaching support.",
    wl: "Requires oversight on external or high-visibility communications. Regular coaching sessions on both writing and presentation will be important development investments.",
    bh: ["Tailors language to audience background, expertise, and context naturally", "Delivers complex information clearly and without unnecessary jargon", "Comfortable and effective presenting to senior stakeholders and large groups"],
    bm: ["Communicates clearly in standard professional contexts", "Written communication generally accurate though benefits from review", "Building confidence and effectiveness in formal presentation settings"],
    bl: ["Written communication may contain unclear phrasing or structural issues", "Public speaking and formal presentations generate visible anxiety", "Benefits from communication coaching and structured practice (e.g., Toastmasters)"],
    coaching: "Join a presentation skills group. Write a daily professional-context paragraph and request structured feedback. Record and review your own presentations to identify specific improvement areas.",
    questions: ["Describe a time you had to present complex information to an audience with little background on the topic.", "Tell me about a situation where miscommunication caused a problem. What could have been done differently?", "How do you adapt your communication style when working with people from very different backgrounds or expertise levels?"],
  },
  "Problem Solving Test": {
    label: "Problem Solving", category: "Cognitive",
    h: "Excellent ability to identify, frame, and resolve complex problems through structured methods. Generates practical solutions that address root causes rather than symptoms.",
    m: "Competent problem-solver for familiar and moderately complex issues. Novel or multi-variable problems benefit from additional structured support and thinking frameworks.",
    l: "Problem-solving capability is developing. Structured frameworks, mentoring, and deliberate practice with worked examples will build this critical organizational skill.",
    wh: "Can be trusted with complex, ambiguous, first-time problems. Generates solutions that are practical, sustainable, and carefully consider downstream implications.",
    wm: "Reliable on standard problems; actively seeks support for novel or complex challenges. Will grow with appropriate coaching and progressive complexity exposure.",
    wl: "Needs structured guidance and step-by-step support for most complex problems. Best suited to well-defined roles until foundational problem-solving capability develops.",
    bh: ["Breaks complex problems into manageable components naturally and quickly", "Evaluates multiple solution pathways before committing to one", "Validates solutions at small scale before full-scale implementation"],
    bm: ["Uses familiar frameworks effectively for known problem types", "Expanding toolkit for novel and open-ended challenges", "Consults others proactively when problem complexity exceeds current experience"],
    bl: ["May attempt solutions before adequately defining and scoping the problem", "Shows pattern of addressing symptoms rather than root causes", "Benefits from structured problem-definition exercises and worked case studies"],
    coaching: "Practice structured problem-solving using the A3 or 5-Why frameworks. Spend at least 20% of problem-solving time on defining the problem clearly before generating any solutions.",
    questions: ["Walk me through a complex problem you solved from start to finish. What was your process?", "Tell me about a time your initial solution to a problem didn't work. What did you do next?", "Describe a situation where you identified the root cause of a recurring issue others had been treating symptomatically."],
  },
  "Work Style Assessment": {
    label: "Work Style", category: "Personality",
    h: "Work style strongly aligns with high-performance patterns. Demonstrates excellent self-management, effective prioritization, and adaptive capacity across different work demands.",
    m: "Work style is generally effective with some areas for development. Clear expectations and regular feedback loops will help optimize both output and satisfaction.",
    l: "Work style reveals areas requiring development. Structured onboarding, clear expectations, and regular manager check-ins are important for initial success.",
    wh: "Self-directed and productive with minimal oversight. Adapts to different work contexts and working styles effectively. Strong cultural contribution potential.",
    wm: "Performs well with clear expectations and reasonable structure. Benefits from regular feedback on priorities and confirmation that work quality meets standards.",
    wl: "Requires significant managerial investment in the early role stage. Structured daily and weekly check-ins and clear deliverable frameworks are essential.",
    bh: ["Prioritizes effectively and autonomously without requiring direction", "Adapts work approach to match the specific demands of each task", "Maintains quality and pace even in low-structure or ambiguous environments"],
    bm: ["Productive in structured and clearly defined environments", "Working on self-directing in more ambiguous conditions", "Responds positively and quickly to regular feedback and course corrections"],
    bl: ["May struggle with ambiguity, multiple simultaneous priorities, or unclear expectations", "Output quality can vary without regular structure and accountability check-ins", "Benefits from daily planning tools, accountability partners, and clear milestone setting"],
    coaching: "Use time-blocking techniques and a consistent daily planning ritual. Experiment with different productivity methods (GTD, Pomodoro, Eisenhower Matrix) to find what aligns best with your natural tendencies.",
    questions: ["Describe your ideal work environment. What conditions help you do your absolute best work?", "Tell me about a time you had to manage multiple competing priorities simultaneously. How did you decide what to focus on?", "How do you stay productive and motivated when working on long-term projects with distant or uncertain deadlines?"],
  },
  "Sales Aptitude Test": {
    label: "Sales Aptitude", category: "Interpersonal",
    h: "Strong commercial instinct, customer orientation, and persuasive communication ability. Natural capacity to identify genuine needs and connect solutions to real value.",
    m: "Reasonable sales aptitude with clear strengths to build on. Developing areas include objection handling, pipeline discipline, and pipeline-level strategic thinking.",
    l: "Sales aptitude is developing. Core skills such as active listening, needs identification, and confident value articulation need targeted and sustained development.",
    wh: "Will perform well in client-facing and revenue-generating roles. Strong consultative instinct and competitive tenacity in quota-bearing positions.",
    wm: "Effective in supportive or structured sales environments. Will grow with professional sales coaching, CRM tool adoption, and clearly defined territory.",
    wl: "Will need intensive sales training, scripting support, and close management. Consider non-quota-bearing commercial roles as a natural development pathway.",
    bh: ["Identifies customer pain points before pitching any solution", "Handles objections with curiosity and exploration rather than defensiveness", "Maintains consistent pipeline hygiene and disciplined follow-up habits"],
    bm: ["Builds authentic rapport with customers effectively", "Growing confidence and competence in consultative selling approach", "Pipeline consistency and strategic targeting are areas for development"],
    bl: ["Leads with product features rather than genuinely listening to customer needs", "Uncomfortable with objections and the natural rejection that comes with sales", "Benefits from structured scripts, regular role-play practice, and sales coaching"],
    coaching: "Shadow experienced sales representatives on customer calls. Practice the SPIN Selling or Challenger Sale model. Role-play objection handling weekly with an experienced sales coach or colleague.",
    questions: ["Tell me about a time you converted a skeptical prospect into a customer. What was your approach?", "Describe a significant sales loss. What did you learn from it and what would you do differently?", "How do you manage your pipeline and prioritize which opportunities to pursue when resources are limited?"],
  },
  "Customer Service Skills Test": {
    label: "Customer Service", category: "Interpersonal",
    h: "Excellent empathy, skilled conflict de-escalation, and strong service recovery capability. Instinctively centers the customer experience in every interaction.",
    m: "Good customer orientation with some areas to develop — particularly under sustained pressure or in emotionally complex complaint scenarios.",
    l: "Customer service skills are developing. Targeted training on empathy, active listening, and structured complaint resolution will build the foundation for success.",
    wh: "Will build genuine customer loyalty, handle escalations with composure, and represent the brand positively even in the most challenging interactions.",
    wm: "Performs well in routine service scenarios. Handling sustained escalations and emotionally charged interactions will benefit from additional coaching and practice.",
    wl: "Requires significant structured training and close supervision in customer-facing roles. Pairing with an experienced service professional during initial months is essential.",
    bh: ["De-escalates upset customers with genuine empathy and problem-solving focus", "Follows through on service commitments reliably without needing reminders", "Turns negative service experiences into genuine customer loyalty opportunities"],
    bm: ["Empathetic and attentive in most standard customer interactions", "Maintains composure in routine service scenarios effectively", "Building competence and confidence in handling complex complaints"],
    bl: ["May become defensive when challenged by customers", "Service quality and composure can drop under sustained pressure", "Benefits from structured service scripts and clear escalation guidelines"],
    coaching: "Study service recovery frameworks (LAST: Listen, Apologize, Solve, Thank). Practice active listening techniques and review recorded customer interactions with a coach for targeted feedback.",
    questions: ["Describe the most challenging customer interaction you've handled. How did you resolve it?", "Tell me about a time you successfully turned a dissatisfied customer into a loyal one.", "How do you maintain your composure and professionalism when a customer is being unreasonable or aggressive?"],
  },
  "Teamwork & Collaboration Test": {
    label: "Teamwork", category: "Interpersonal",
    h: "Natural collaborator who elevates team performance, navigates conflict constructively, and consistently prioritizes shared goals over individual recognition.",
    m: "Works effectively in team settings with reasonable collaboration skills. May benefit from developing more proactive conflict navigation and consistently inclusive behaviors.",
    l: "Collaboration skills are developing. Deliberate practice in active listening, communication, and shared goal ownership will meaningfully build team effectiveness.",
    wh: "Will enhance team culture, support colleagues generously, and navigate team dynamics constructively at any level of the organization.",
    wm: "Performs well in structured collaborative settings. Benefits from clarity on team roles, accountability structures, and team norms to maximize collaborative contribution.",
    wl: "May create unintentional friction in team settings. Clear role definition, explicit team norms, and regular feedback will support collaborative skill development.",
    bh: ["Surfaces team conflicts early and navigates them constructively without escalation", "Shares credit and acknowledges others' contributions proactively", "Adapts communication style to meet the needs of different team members"],
    bm: ["Generally cooperative, respectful, and considerate of colleagues", "Increasingly proactive in making discretionary team contributions", "Working on voicing disagreement constructively rather than avoiding conflict"],
    bl: ["May withdraw or compete rather than collaborate under pressure", "Team friction can arise from communication style or priority misalignment", "Benefits from team dynamics training and facilitated team-norms-setting exercises"],
    coaching: "Practice 'Disagree and Commit' in group decisions. Actively give explicit credit to colleagues in meetings and written communications. Request 360 feedback specifically on team contribution and impact.",
    questions: ["Describe a time you had to work closely with a difficult teammate to achieve a shared goal. How did you navigate it?", "Tell me about a situation where a team you were part of was struggling. What role did you play in addressing it?", "How do you handle it when you disagree with the direction the team has decided to take?"],
  },
  "Time Management Test": {
    label: "Time Management", category: "Professional",
    h: "Excellent ability to prioritize, plan, and execute across multiple tasks and timelines without sacrificing quality or composure under competing demands.",
    m: "Generally organized and productive with developing capacity for complex multi-project prioritization. Some time management habits need strengthening under high-load conditions.",
    l: "Time management is an area for significant development. Consistent use of planning tools and regular reflection on productivity patterns will build this foundational skill.",
    wh: "Self-manages deliverables reliably with minimal oversight. Will complete complex, multi-step projects on time and to the required standard consistently.",
    wm: "Meets deadlines consistently in standard conditions. High-complexity or unusually high-volume periods may require prioritization support and workload management.",
    wl: "Will struggle with deadline management without clear external structure. Regular task review sessions, clear milestones, and accountability check-ins are essential.",
    bh: ["Time-blocks proactively and fiercely protects focus time from interruption", "Escalates timeline risks early rather than managing deadline pressure silently", "Consistently delivers on time across multiple simultaneous complex projects"],
    bm: ["Meets most deadlines under standard workload conditions", "Increasingly proactive about flagging timeline risks before they become critical", "Working on planning tools and strategies for complex multi-project environments"],
    bl: ["Deadlines missed under sustained high workload without adequate support", "Reactive rather than proactive approach to planning and prioritization", "Benefits from daily planning rituals and trusted digital task management tools"],
    coaching: "Implement a consistent weekly planning ritual using a trusted task management system. Review priorities each morning and review outcomes each Friday. Time-block high-priority work daily without exception.",
    questions: ["Describe a period when you had more work than you could possibly complete. How did you prioritize what to do?", "Tell me about a project that ran significantly behind schedule. What caused it and what did you do to recover?", "How do you manage unexpected urgent tasks without completely derailing your planned work?"],
  },
  "Stress Tolerance Test": {
    label: "Stress Tolerance", category: "EQ",
    h: "Exceptional capacity to maintain performance, clarity, and composure under pressure. Stress is channeled productively rather than reactively, even under sustained or severe pressure.",
    m: "Generally tolerates moderate stress well. Extended high-pressure periods or multiple simultaneous stressors may affect output quality and interpersonal dynamics.",
    l: "Stress tolerance is an area for development. High-pressure environments may significantly impact performance and personal wellbeing without adequate support structures.",
    wh: "Thrives in fast-paced, high-stakes environments. A reliable and steady performer during organizational crises, change initiatives, and sustained operational pressure.",
    wm: "Performs well in moderately demanding environments. High-intensity roles should include clear workload monitoring and structured recovery periods to maintain performance.",
    wl: "Requires a calm, structured environment to deliver consistent results. High-pressure roles may create performance and wellbeing risks without very strong support structures.",
    bh: ["Maintains strategic perspective when operational pressure spikes suddenly", "Stress response is controlled and productively channeled into purposeful action", "Models calm composure that visibly stabilizes the team during difficult periods"],
    bm: ["Generally manages day-to-day pressure without significant impact on performance", "Demonstrates self-awareness about when stress is beginning to affect their output", "Working on effective recovery strategies for sustained high-pressure periods"],
    bl: ["High pressure visibly impacts communication quality and decision-making", "May withdraw or escalate interpersonally under sustained stress", "Benefits from stress management coaching and active workload monitoring"],
    coaching: "Develop a personal stress management toolkit: identify your top 3 stress triggers, your early warning signals, and your most effective recovery strategies. Practice these proactively, before you need them.",
    questions: ["Describe the most intense professional pressure you've ever faced. How did you manage through it?", "Tell me about a time stress meaningfully affected your performance at work. What did you learn?", "What specific practices do you use to maintain both performance and personal wellbeing during very demanding periods?"],
  },
  "Integrity & Ethics Test": {
    label: "Integrity & Ethics", category: "EQ",
    h: "Strong ethical compass with consistent alignment between stated values and observable behavior under all conditions. Will make the principled call even when it is the harder path.",
    m: "Generally ethical with strong baseline values. Some situational nuance or sustained pressure scenarios may benefit from clearer ethical frameworks and escalation clarity.",
    l: "Ethical reasoning is developing. Clear organizational values, accessible escalation paths, and structured ethics training will support sound decision-making in grey-area situations.",
    wh: "Can be trusted in roles with access to sensitive information, financial controls, and critical stakeholder relationships. A genuine ethical anchor for the broader team.",
    wm: "Sound ethical judgment in clear-cut situations. Benefits from explicit escalation protocols and structured ethical guidelines for ambiguous or grey-area scenarios.",
    wl: "Requires close oversight in roles involving sensitive data, financial authority, or vulnerable stakeholders. Ethics training and clear accountability structures are essential.",
    bh: ["Consistently honors commitments regardless of whether others are watching", "Proactively flags potential conflicts of interest and ethical concerns", "Creates psychological safety for others to raise ethical issues without fear"],
    bm: ["Behaves ethically and honestly in clear-cut professional situations", "Growing awareness of ethical complexity in nuanced or ambiguous scenarios", "Responds constructively to structured ethical reasoning frameworks and scenarios"],
    bl: ["May struggle to navigate competing interests in ethically ambiguous situations", "Requires very clear guidelines and understood consequences for ethical breaches", "Ethics training, mentoring, and clear organizational accountability structures are essential"],
    coaching: "Study organizational ethics frameworks and multi-stakeholder case studies. Before acting in ambiguous situations, apply the 'Front Page Test' — would you be comfortable seeing this decision reported publicly?",
    questions: ["Describe a situation where you faced a genuine ethical dilemma at work. What did you decide and why?", "Tell me about a time you witnessed something at work that didn't seem right. What did you do?", "How do you handle situations where the right thing to do is also the most costly or difficult option?"],
  },
  "Decision Making Test": {
    label: "Decision Making", category: "Professional",
    h: "Exceptional decision quality: balances appropriate speed with necessary rigor, calibrates risk accurately, and involves the right stakeholders at exactly the right moments.",
    m: "Sound decision-making in familiar contexts. Novel, high-stakes, or highly ambiguous decisions benefit from additional structured frameworks and deliberate deliberation time.",
    l: "Decision-making is developing. Structured frameworks and deliberate practice in varied scenarios will build both confidence and quality in the decision-making process.",
    wh: "Can be trusted with genuinely consequential decisions. Will make timely, well-reasoned calls and communicate the rationale clearly to build stakeholder alignment.",
    wm: "Reliable on day-to-day and moderately complex decisions. High-stakes or time-pressured decisions benefit from a thinking partner or explicit decision authority framework.",
    wl: "Decision paralysis or impulsive choices may occur in high-pressure or novel scenarios. Structured decision tools, clear escalation paths, and close mentoring are important.",
    bh: ["Calibrates decision speed to decision stakes quickly and accurately", "Separates reversible from irreversible decisions and treats them fundamentally differently", "Communicates decision rationale clearly to build stakeholder confidence and team alignment"],
    bm: ["Makes good decisions reliably in familiar and well-defined territory", "Increasingly deliberate about framing decisions before jumping to solutions", "Working on building confidence in high-ambiguity decision scenarios"],
    bl: ["Shows tendency toward either decision paralysis or impulsive action under pressure", "Rarely applies explicit and structured decision frameworks", "Benefits significantly from decision journaling practice and mentor review of key decisions"],
    coaching: "Keep a decision journal — record significant decisions made, the reasoning applied, and later outcomes. Study Jeff Bezos' Two-Way Door framework for calibrating decision reversibility before committing.",
    questions: ["Describe a significant decision you made under time pressure. What was your process and how did it turn out?", "Tell me about an important decision you made that turned out to be wrong. How did you handle it?", "How do you decide when to make a decision independently versus when to escalate or bring others in?"],
  },
  "Learning Agility Test": {
    label: "Learning Agility", category: "Professional",
    h: "Exceptional capacity to learn rapidly from experience, transfer knowledge creatively across different contexts, and apply new skills effectively to unfamiliar challenges.",
    m: "Good learning agility with developing capacity to apply lessons across very different contexts. Structured reflection and deliberate practice accelerates cross-domain transfer.",
    l: "Learning agility is developing. Deliberate practice, structured reflection, and progressive exposure to novel situations will build this increasingly critical professional capacity.",
    wh: "Will adapt to new roles, systems, technologies, and market conditions rapidly. A genuinely future-proof hire with high potential for growth and increased responsibility.",
    wm: "Adapts to new learning at a reasonable and consistent pace with appropriate structured support. Will thrive with well-designed onboarding and development programs.",
    wl: "Extended ramp-up time should be expected for new systems, roles, or organizational contexts. Structured training, patience, and regular check-ins are important investments.",
    bh: ["Actively seeks out challenging assignments that stretch current capability", "Applies lessons from one domain creatively and effectively to another", "Reflects deliberately on experience to extract transferable principles and patterns"],
    bm: ["Adapts to new learning in familiar domains quickly and confidently", "Building capacity for creative cross-domain transfer", "Open to feedback and iterates actively on approach when entering new contexts"],
    bl: ["Prefers familiar territory; genuinely novel situations require significant additional adjustment time", "Learning transfers slowly between functionally different contexts", "Benefits from structured exposure to diverse situations and deliberate cross-domain reflection"],
    coaching: "Adopt a 'deliberate discomfort' practice: regularly take on assignments in areas outside your current competence zone. Maintain a weekly learning journal recording insights and potential cross-domain applications.",
    questions: ["Tell me about a situation where you had to learn something completely new very quickly. How did you approach it?", "Describe a time you applied a lesson from one domain to successfully solve a problem in a completely different area.", "How do you approach getting up to speed when you start a new role or encounter an unfamiliar system?"],
  },
};

// ─── Category mapping ────────────────────────────────────────────────────────
function getCategory(name: string): string {
  return BANK[name]?.category ?? "Professional";
}

function phraseFor(c: CompetencyItem, locale: "en" | "es"): Phrases | undefined {
  if (locale === "en") return c.phrases;

  const label = displayAssessmentName(c.name, locale, true);
  const category = getCategory(c.name) as Phrases["category"];
  return {
    label,
    category,
    h: `El resultado muestra una fortaleza clara en ${label}. La evidencia disponible sugiere buen dominio de esta competencia dentro de las evaluaciones completadas.`,
    m: `El resultado muestra una base adecuada en ${label}. Conviene validar esta competencia con ejemplos concretos durante la entrevista estructurada.`,
    l: `El resultado indica que ${label} requiere revision adicional. Esta area deberia explorarse con preguntas conductuales, evidencia laboral y apoyo de desarrollo si la persona avanza.`,
    wh: `Puede aportar valor en tareas relacionadas con ${label}, especialmente si la entrevista confirma que el resultado se refleja en situaciones laborales reales.`,
    wm: `Puede desempenarse de forma adecuada en contextos relacionados con ${label}, con claridad de expectativas y seguimiento durante el inicio del rol.`,
    wl: `Puede requerir estructura, acompanamiento y revision frecuente en tareas donde ${label} sea critica para el puesto.`,
    bh: [
      `Muestra evidencia positiva en ${label}.`,
      "Tiende a responder mejor cuando los criterios de exito estan claros.",
      "Puede convertir esta fortaleza en impacto si el contexto del rol la exige.",
    ],
    bm: [
      `Muestra una base funcional en ${label}.`,
      "Puede beneficiarse de retroalimentacion y ejemplos especificos.",
      "La entrevista debe confirmar consistencia en situaciones reales de trabajo.",
    ],
    bl: [
      `El resultado bajo en ${label} merece exploracion adicional.`,
      "Puede necesitar procesos claros, practica y acompanamiento.",
      "No debe interpretarse de forma aislada sin entrevista y evidencia complementaria.",
    ],
    coaching: `Profundice en ${label} durante la entrevista. Solicite ejemplos especificos, decisiones tomadas, resultados obtenidos y aprendizaje posterior.`,
    questions: [
      `Cuente una situacion laboral donde ${label} haya sido importante. ¿Que hizo y cual fue el resultado?`,
      `Describa un momento en el que recibio retroalimentacion relacionada con ${label}. ¿Como respondio?`,
      `Si este rol exige ${label} bajo presion, ¿que habitos o metodos usaria para mantener un buen desempeno?`,
    ],
  };
}

function competencyLabel(c: CompetencyItem, locale: "en" | "es"): string {
  return locale === "es" ? displayAssessmentName(c.name, locale, true) : BANK[c.name]?.label ?? c.name;
}

// ─── Page 1 — Cover ──────────────────────────────────────────────────────────
function p1Cover(doc: jsPDF, data: ComprehensiveReportData, avg: number, rec: RecResult) {
  const copy = copyOf(data);
  doc.setFillColor(7, 8, 15);
  doc.rect(0, 0, PW, 128, "F");
  doc.setFillColor(20, 24, 48);
  doc.rect(0, 128, PW, PH - 128, "F");

  doc.setFontSize(7.5); doc.setFont("helvetica", "bold"); doc.setTextColor(140, 177, 255);
  doc.text(localeOf(data) === "es" ? "PLATAFORMA INTELLIGENCES TEST" : "INTELLIGENCES TEST PLATFORM", M, 20);

  doc.setFontSize(11); doc.setFont("helvetica", "normal"); doc.setTextColor(100, 116, 139);
  doc.text(copy.assessmentReport, M, 31);

  doc.setDrawColor(29, 78, 216); doc.setLineWidth(1.5);
  doc.line(M, 35, M + 36, 35); doc.setLineWidth(0.4);

  const nameFontSize = data.candidateName.length > 22 ? 22 : 28;
  doc.setFontSize(nameFontSize); doc.setFont("helvetica", "bold"); doc.setTextColor(255, 255, 255);
  const safeName = data.candidateName.length > 28 ? data.candidateName.slice(0, 27) + "…" : data.candidateName;
  doc.text(safeName, M, 55);

  doc.setFontSize(8.5); doc.setFont("helvetica", "normal"); doc.setTextColor(71, 85, 105);
  doc.text(data.candidateEmail || copy.notProvided, M, 65);
  doc.text(data.projectName, M, 73);

  // Score box (top right)
  const [sr, sg, sb] = rec.rgb;
  doc.setFillColor(sr, sg, sb);
  doc.rect(PW - M - 38, 34, 38, 22, "F");
  doc.setFontSize(22); doc.setFont("helvetica", "bold"); doc.setTextColor(255, 255, 255);
  doc.text(`${avg}`, PW - M - 19, 49, { align: "center" });
  doc.setFontSize(6.5); doc.setFont("helvetica", "normal");
  doc.text(copy.assessmentAvg, PW - M - 19, 55, { align: "center" });

  doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.setTextColor(sr, sg, sb);
  doc.text(rec.label.toUpperCase(), PW - M - 19, 66, { align: "center" });

  // White detail card
  doc.setFillColor(255, 255, 255);
  doc.rect(M, 100, CW, 82, "F");
  doc.setDrawColor(226, 232, 240); doc.setLineWidth(0.3);
  doc.rect(M, 100, CW, 82, "S");

  const rows: [string, string][] = [
    [copy.company, data.companyName],
    [copy.project, data.projectName.length > 38 ? data.projectName.slice(0, 37) + "…" : data.projectName],
    [copy.reportDate, data.reportDate],
    [copy.reportId, data.reportId],
    [localeOf(data) === "es" ? "Evaluaciones completadas" : "Assessments Completed", copy.completedAssessments(data.assessments.length)],
    [copy.candidateEmail, data.candidateEmail || copy.notProvided],
  ];
  rows.forEach(([lbl, val], i) => {
    const ry = 112 + i * 12;
    doc.setFontSize(7.5); doc.setFont("helvetica", "normal"); doc.setTextColor(148, 163, 184);
    doc.text(lbl, M + 5, ry);
    doc.setFont("helvetica", "bold"); doc.setTextColor(30, 41, 59);
    doc.text(val, M + 58, ry);
  });

  // Confidential bar
  doc.setFillColor(239, 68, 68);
  doc.rect(0, 265, PW, 8, "F");
  doc.setFontSize(7); doc.setFont("helvetica", "bold"); doc.setTextColor(255, 255, 255);
  doc.text(copy.confidentialBar, PW / 2, 270, { align: "center" });
  doc.setFontSize(6.5); doc.setFont("helvetica", "normal"); doc.setTextColor(148, 163, 184);
  doc.text(localeOf(data) === "es" ? "Este informe contiene datos confidenciales de evaluacion. Su distribucion esta restringida a personal autorizado." : "This report contains proprietary assessment data. Distribution is restricted to authorized personnel only.", M, 283);
  doc.text("Intelligences Test  ·  intelligencestest.com", PW - M, 283, { align: "right" });
}

// ─── Page 2 — Executive Summary ──────────────────────────────────────────────
function p2Executive(doc: jsPDF, data: ComprehensiveReportData, avg: number, rec: RecResult, comps: CompetencyItem[], pageNum: number) {
  const copy = copyOf(data);
  const locale = localeOf(data);
  phdr(doc, data.candidateName, data.reportId);
  let y = CT + 2;

  doc.setFontSize(14); doc.setFont("helvetica", "bold"); doc.setTextColor(15, 23, 42);
  doc.text(locale === "es" ? "Resumen ejecutivo" : "Executive Summary", M, y); y += 12;

  // Overall score row
  const [sr, sg, sb] = rec.rgb;
  doc.setFillColor(248, 250, 252); doc.rect(M, y, CW, 22, "F");
  doc.setDrawColor(226, 232, 240); doc.setLineWidth(0.3); doc.rect(M, y, CW, 22, "S");
  doc.setFontSize(26); doc.setFont("helvetica", "bold"); doc.setTextColor(sr, sg, sb);
  doc.text(`${avg}`, M + 10, y + 15);
  doc.setFontSize(8.5); doc.setFont("helvetica", "normal"); doc.setTextColor(100, 116, 139);
  doc.text(`/100 ${locale === "es" ? "promedio de evaluaciones completadas" : "average of completed assessments"}`, M + 10 + doc.getTextWidth(`${avg}`) + 2, y + 15);
  doc.setFillColor(sr, sg, sb);
  doc.rect(PW - M - 45, y + 5, 45, 13, "F");
  doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.setTextColor(255, 255, 255);
  doc.text(rec.label.toUpperCase(), PW - M - 22.5, y + 13, { align: "center" });
  y += 28;

  // Assessments count + confidence
  doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.setTextColor(100, 116, 139);
  doc.text(`${copy.completedAssessments(comps.length)}  ·  ${copy.confidenceLevel}: ${copy.confidence(comps.length)}  ·  ${copy.reportGenerated}: ${data.reportDate}`, M, y); y += 10;

  const sorted = [...comps].sort((a, b) => b.score - a.score);
  const strengths = sorted.slice(0, Math.min(4, sorted.length));
  const devAreas = sorted.slice(-Math.min(3, sorted.length)).reverse().filter(c => c.score < 70);

  y = secHead(doc, copy.topStrengths.toUpperCase(), y);
  strengths.forEach(c => {
    const p = phraseFor(c, locale);
    const [cr, cg, cb] = scoreRGB(c.score);
    doc.setFillColor(cr, cg, cb);
    doc.circle(M + 1.5, y - 1.3, 0.9, "F");
    doc.setFontSize(8.5); doc.setFont("helvetica", "bold"); doc.setTextColor(30, 41, 59);
    doc.text(`${competencyLabel(c, locale)} (${c.score})`, M + 5, y);
    doc.setFont("helvetica", "normal"); doc.setTextColor(71, 85, 105);
    const phrase = p ? p[c.t === "high" ? "h" : c.t === "mid" ? "m" : "l"] : "";
    const lines = doc.splitTextToSize(phrase.split(".")[0] + ".", CW - 5) as string[];
    doc.text(lines, M + 5, y + 4);
    y += lines.length * 3.8 + 7;
  });

  if (devAreas.length > 0) {
    y += 2;
    y = secHead(doc, copy.developmentAreas.toUpperCase(), y);
    devAreas.forEach(c => {
      const p = phraseFor(c, locale);
      doc.setFillColor(245, 158, 11);
      doc.circle(M + 1.5, y - 1.3, 0.9, "F");
      doc.setFontSize(8.5); doc.setFont("helvetica", "bold"); doc.setTextColor(30, 41, 59);
      doc.text(`${competencyLabel(c, locale)} (${c.score})`, M + 5, y);
      doc.setFont("helvetica", "normal"); doc.setTextColor(71, 85, 105);
      const phrase = p ? p[c.t === "high" ? "h" : c.t === "mid" ? "m" : "l"] : "";
      const lines = doc.splitTextToSize(phrase.split(".")[0] + ".", CW - 5) as string[];
      doc.text(lines, M + 5, y + 4);
      y += lines.length * 3.8 + 7;
    });
  }

  y += 4;
  y = secHead(doc, locale === "es" ? "LECTURA GENERAL" : "SUMMARY NARRATIVE", y);
  ww(doc, rec.narrative, M, y, CW, 8.5, "normal", [30, 41, 59]);

  pftr(doc, pageNum);
}

// ─── Page 3 — Competency Dashboard ───────────────────────────────────────────
function p3Dashboard(doc: jsPDF, data: ComprehensiveReportData, avg: number, comps: CompetencyItem[], pageNum: number) {
  const copy = copyOf(data);
  const locale = localeOf(data);
  phdr(doc, data.candidateName, data.reportId);
  let y = CT + 2;

  doc.setFontSize(14); doc.setFont("helvetica", "bold"); doc.setTextColor(15, 23, 42);
  doc.text(copy.competencyDashboard, M, y); y += 10;

  // Gauge (right side)
  const gaugeCX = PW - M - 30, gaugeCY = y + 30, gaugeR = 26;
  gauge(doc, gaugeCX, gaugeCY, gaugeR, avg);

  // Left: score color legend
  const legend = [
    { rgb: [16, 185, 129] as [number, number, number], label: locale === "es" ? "80-100 · Alto (fortaleza)" : "80-100 · High (Strength)" },
    { rgb: [59, 130, 246] as [number, number, number], label: locale === "es" ? "65-79 · Sobre el promedio" : "65-79 · Above Average" },
    { rgb: [245, 158, 11] as [number, number, number], label: locale === "es" ? "50-64 · En desarrollo" : "50-64 · Developing" },
    { rgb: [239, 68, 68] as [number, number, number], label: locale === "es" ? "Menos de 50 · Requiere foco" : "Below 50 · Needs Focus" },
  ];
  let ly = y + 10;
  legend.forEach(({ rgb, label }) => {
    doc.setFillColor(...rgb); doc.rect(M, ly, 3, 3, "F");
    doc.setFontSize(7); doc.setFont("helvetica", "normal"); doc.setTextColor(71, 85, 105);
    doc.text(label, M + 5, ly + 2.5);
    ly += 7;
  });

  y = gaugeCY + gaugeR + 14;

  if (comps.length >= 3) {
    const radarData = comps.slice(0, Math.min(8, comps.length)).map(c => ({ label: competencyLabel(c, locale), score: c.score }));
    const rcx = PW / 2, rcy = y + 35, rr = 30;
    radar(doc, rcx, rcy, rr, radarData);
    y = rcy + rr + 18;
  }

  y = secHead(doc, copy.scoreBreakdown.toUpperCase(), y);

  const barW = CW - 20;
  comps.forEach(c => {
    if (y > 270) return;
    hBar(doc, M, y + 2, barW, c.score, competencyLabel(c, locale));
    tierBadge(doc, M + barW + 8, y + 5, c.t);
    y += 13;
  });

  pftr(doc, pageNum);
}

// ─── Category page helper ────────────────────────────────────────────────────
function categoryPage(doc: jsPDF, data: ComprehensiveReportData, comps: CompetencyItem[], category: string, pageTitle: string, pageNum: number) {
  const copy = copyOf(data);
  const locale = localeOf(data);
  phdr(doc, data.candidateName, data.reportId);
  let y = CT + 2;

  doc.setFontSize(14); doc.setFont("helvetica", "bold"); doc.setTextColor(15, 23, 42);
  doc.text(pageTitle, M, y); y += 8;
  doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.setTextColor(100, 116, 139);
  doc.text(`${copy.category}: ${categoryDisplay(category, locale)}`, M, y); y += 10;

  const catComps = comps.filter(c => getCategory(c.name) === category);

  if (catComps.length === 0) {
    pftr(doc, pageNum);
    return;
  }

  catComps.forEach(c => {
    if (y > 260) return;
    const p = c.phrases;
    const [cr, cg, cb] = scoreRGB(c.score);

    // Assessment name + score
    doc.setFillColor(248, 250, 252); doc.rect(M, y, CW, 8, "F");
    doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.setTextColor(15, 23, 42);
    doc.text(displayAssessmentName(c.name, locale), M + 3, y + 5.5);
    doc.setFont("helvetica", "bold"); doc.setTextColor(cr, cg, cb);
    doc.text(`${c.score}`, PW - M - 3, y + 5.5, { align: "right" });
    y += 10;

    // Bar
    hBar(doc, M, y, CW - 10, c.score);
    y += 9;

    if (!p) { y += 5; return; }

    // Summary phrase
    const pLocalized = phraseFor(c, locale);
    const summaryKey = c.t === "high" ? "h" : c.t === "mid" ? "m" : "l";
    y = ww(doc, (pLocalized ?? p)[summaryKey], M, y, CW, 8.5, "normal", [30, 41, 59]);
    y += 3;

    // Workplace implication
    const wKey = c.t === "high" ? "wh" : c.t === "mid" ? "wm" : "wl";
    doc.setFontSize(7.5); doc.setFont("helvetica", "bold"); doc.setTextColor(100, 116, 139);
    doc.text(copy.workplaceImplication.toUpperCase(), M, y); y += 4;
    y = ww(doc, (pLocalized ?? p)[wKey], M, y, CW, 8, "normal", [71, 85, 105]);
    y += 3;

    // Key behaviors
    const bKey = c.t === "high" ? "bh" : c.t === "mid" ? "bm" : "bl";
    doc.setFontSize(7.5); doc.setFont("helvetica", "bold"); doc.setTextColor(100, 116, 139);
    doc.text(copy.keyBehaviors.toUpperCase(), M, y); y += 4;
    y = bullets(doc, (pLocalized ?? p)[bKey], M, y, CW);

    doc.setDrawColor(241, 245, 249); doc.setLineWidth(0.5);
    doc.line(M, y, PW - M, y); y += 7;
  });

  pftr(doc, pageNum);
}

// ─── Page 8 — Strengths ──────────────────────────────────────────────────────
function p8Strengths(doc: jsPDF, data: ComprehensiveReportData, comps: CompetencyItem[], pageNum: number) {
  const copy = copyOf(data);
  const locale = localeOf(data);
  phdr(doc, data.candidateName, data.reportId);
  let y = CT + 2;
  doc.setFontSize(14); doc.setFont("helvetica", "bold"); doc.setTextColor(15, 23, 42);
  doc.text(copy.strengthsProfile, M, y); y += 12;

  const highs = [...comps].sort((a, b) => b.score - a.score).filter(c => c.score >= 60).slice(0, 6);
  if (highs.length === 0) {
    doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.setTextColor(148, 163, 184);
    doc.text(copy.insufficientStrengths, M, y);
    pftr(doc, pageNum); return;
  }

  highs.forEach(c => {
    if (y > 265) return;
    const p = phraseFor(c, locale);
    const [cr, cg, cb] = scoreRGB(c.score);
    doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.setTextColor(15, 23, 42);
    doc.text(competencyLabel(c, locale), M, y);
    doc.setTextColor(cr, cg, cb);
    doc.text(`${c.score}`, PW - M, y, { align: "right" });
    y += 5;
    hBar(doc, M, y, CW - 10, c.score); y += 8;
    if (p) {
      const bKey = c.t === "high" ? "bh" : c.t === "mid" ? "bm" : "bl";
      y = bullets(doc, p[bKey], M, y, CW);
    }
    doc.setDrawColor(241, 245, 249); doc.setLineWidth(0.4); doc.line(M, y, PW - M, y); y += 8;
  });

  pftr(doc, pageNum);
}

// ─── Page 9 — Development Areas ──────────────────────────────────────────────
function p9Development(doc: jsPDF, data: ComprehensiveReportData, comps: CompetencyItem[], pageNum: number) {
  const copy = copyOf(data);
  const locale = localeOf(data);
  phdr(doc, data.candidateName, data.reportId);
  let y = CT + 2;
  doc.setFontSize(14); doc.setFont("helvetica", "bold"); doc.setTextColor(15, 23, 42);
  doc.text(copy.developmentAreas, M, y); y += 12;

  const lows = [...comps].sort((a, b) => a.score - b.score).filter(c => c.score < 75).slice(0, 6);
  if (lows.length === 0) {
    doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.setTextColor(71, 85, 105);
    doc.text(copy.noDevelopmentAreas(data.candidateName.split(" ")[0] || data.candidateName), M, y);
    pftr(doc, pageNum); return;
  }

  lows.forEach(c => {
    if (y > 265) return;
    const p = phraseFor(c, locale);
    doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.setTextColor(15, 23, 42);
    doc.text(competencyLabel(c, locale), M, y);
    const [cr, cg, cb] = scoreRGB(c.score);
    doc.setTextColor(cr, cg, cb);
    doc.text(`${c.score}`, PW - M, y, { align: "right" });
    y += 5;
    hBar(doc, M, y, CW - 10, c.score); y += 8;
    if (p) {
      doc.setFontSize(7.5); doc.setFont("helvetica", "bold"); doc.setTextColor(100, 116, 139);
      doc.text(copy.coachingRecommendation.toUpperCase(), M, y); y += 5;
      y = ww(doc, p.coaching, M, y, CW, 8.5, "normal", [30, 41, 59]);
    }
    doc.setDrawColor(241, 245, 249); doc.setLineWidth(0.4); doc.line(M, y, PW - M, y); y += 8;
  });

  pftr(doc, pageNum);
}

// ─── Page 10 — Hiring Insights ───────────────────────────────────────────────
function p10Hiring(doc: jsPDF, data: ComprehensiveReportData, avg: number, rec: RecResult, comps: CompetencyItem[], pageNum: number) {
  const copy = copyOf(data);
  const locale = localeOf(data);
  phdr(doc, data.candidateName, data.reportId);
  let y = CT + 2;
  doc.setFontSize(14); doc.setFont("helvetica", "bold"); doc.setTextColor(15, 23, 42);
  doc.text(copy.hiringInsights, M, y); y += 12;

  const [sr, sg, sb] = rec.rgb;
  doc.setFillColor(sr, sg, sb);
  doc.rect(M, y, CW, 14, "F");
  doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.setTextColor(255, 255, 255);
  doc.text(`${locale === "es" ? "Evidencia de evaluacion" : "Assessment evidence"}: ${rec.label}`, M + 5, y + 9);
  doc.setFontSize(8); doc.setFont("helvetica", "normal");
  doc.text(`${copy.assessmentAverage}: ${avg} / 100`, PW - M - 5, y + 9, { align: "right" });
  y += 20;

  y = ww(doc, rec.narrative, M, y, CW, 8.5, "normal", [30, 41, 59]);
  y += 8;

  y = secHead(doc, copy.riskFactors.toUpperCase(), y);
  const risks = comps.filter(c => c.score < 60);
  if (risks.length === 0) {
    y = ww(doc, copy.noRisks, M, y, CW, 8.5, "italic", [71, 85, 105]);
  } else {
    risks.forEach(c => {
      const p = phraseFor(c, locale);
      if (y > 272) return;
      const [cr, cg, cb] = scoreRGB(c.score);
      doc.setFillColor(cr, cg, cb);
      doc.circle(M + 1.5, y - 1.3, 0.9, "F");
      doc.setFontSize(8.5); doc.setFont("helvetica", "bold"); doc.setTextColor(15, 23, 42);
      doc.text(`${competencyLabel(c, locale)} (${c.score})`, M + 5, y);
      doc.setFont("helvetica", "normal"); doc.setTextColor(71, 85, 105);
      const wKey = c.t === "high" ? "wh" : c.t === "mid" ? "wm" : "wl";
      const wl = doc.splitTextToSize(p ? p[wKey] : "", CW - 5) as string[];
      doc.text(wl, M + 5, y + 4);
      y += wl.length * 3.7 + 8;
    });
  }

  y += 4;
  y = secHead(doc, copy.followUpFocus.toUpperCase(), y);
  const catCounts: Record<string, { total: number; avgScore: number }> = {};
  comps.forEach(c => {
    const cat = getCategory(c.name);
    if (!catCounts[cat]) catCounts[cat] = { total: 0, avgScore: 0 };
    catCounts[cat].total++;
    catCounts[cat].avgScore += c.score;
  });
  const suggestions: string[] = [];
  Object.entries(catCounts).forEach(([cat, { total, avgScore }]) => {
    const catAvg = Math.round(avgScore / total);
    const catLabel = categoryDisplay(cat, locale).toLowerCase();
    if (catAvg < 60) suggestions.push(locale === "es" ? `Explore evidencia de ${catLabel} en una entrevista estructurada y solicite ejemplos concretos de trabajo previo.` : `Explore ${catLabel} evidence in a structured interview and request concrete examples from prior work.`);
    else if (catAvg >= 80) suggestions.push(locale === "es" ? `Valide la senal fuerte en ${catLabel} con preguntas especificas del rol o muestras de trabajo.` : `Validate the strong ${catLabel} signal with role-specific interview questions or work samples.`);
  });
  if (suggestions.length === 0) suggestions.push(copy.positiveReviewDefault);
  bullets(doc, suggestions, M, y, CW);

  pftr(doc, pageNum);
}

// ─── Page 11 — Interview Guide ───────────────────────────────────────────────
function p11Interview(doc: jsPDF, data: ComprehensiveReportData, comps: CompetencyItem[], pageNum: number) {
  const copy = copyOf(data);
  const locale = localeOf(data);
  phdr(doc, data.candidateName, data.reportId);
  let y = CT + 2;
  doc.setFontSize(14); doc.setFont("helvetica", "bold"); doc.setTextColor(15, 23, 42);
  doc.text(copy.interviewGuide, M, y); y += 8;
  doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.setTextColor(100, 116, 139);
  doc.text(copy.interviewGuideSubtitle, M, y); y += 10;

  const priority = [...comps].sort((a, b) => a.score - b.score);
  priority.slice(0, Math.min(5, priority.length)).forEach(c => {
    const p = phraseFor(c, locale);
    if (y > 265 || !p) return;
    const [cr, cg, cb] = scoreRGB(c.score);
    doc.setFillColor(cr, cg, cb);
    doc.rect(M, y, 3, 8, "F");
    doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.setTextColor(15, 23, 42);
    doc.text(`${competencyLabel(c, locale)}  ·  ${copy.score}: ${c.score}`, M + 6, y + 6);
    y += 11;
    p.questions.forEach((q, qi) => {
      if (y > 272) return;
      doc.setFontSize(7.5); doc.setFont("helvetica", "bold"); doc.setTextColor(100, 116, 139);
      doc.text(`Q${qi + 1}`, M, y + 3.5);
      const lines = doc.splitTextToSize(q, CW - 8) as string[];
      doc.setFont("helvetica", "normal"); doc.setTextColor(30, 41, 59);
      doc.text(lines, M + 7, y + 3.5);
      y += lines.length * 3.7 + 5;
    });
    doc.setDrawColor(241, 245, 249); doc.setLineWidth(0.4); doc.line(M, y, PW - M, y); y += 7;
  });

  pftr(doc, pageNum);
}

// ─── Page 13 — Assessment Details ────────────────────────────────────────────
function p13Details(doc: jsPDF, data: ComprehensiveReportData, comps: CompetencyItem[], pageNum: number) {
  const copy = copyOf(data);
  const locale = localeOf(data);
  phdr(doc, data.candidateName, data.reportId);
  let y = CT + 2;
  doc.setFontSize(14); doc.setFont("helvetica", "bold"); doc.setTextColor(15, 23, 42);
  doc.text(locale === "es" ? "Detalle de evaluaciones" : "Assessment Details", M, y); y += 12;

  const colW = [CW * 0.42, CW * 0.15, CW * 0.15, CW * 0.14, CW * 0.14];
  const headers = [locale === "es" ? "Evaluacion" : "Assessment", copy.score, copy.tier, copy.category, copy.completed];
  doc.setFillColor(248, 250, 252); doc.rect(M, y, CW, 8, "F");
  doc.setFontSize(7.5); doc.setFont("helvetica", "bold"); doc.setTextColor(71, 85, 105);
  let cx = M;
  headers.forEach((h, i) => { doc.text(h, cx + 2, y + 5.5); cx += colW[i]; });
  y += 10;

  comps.forEach((c, ci) => {
    if (y > 270) return;
    if (ci % 2 === 0) { doc.setFillColor(248, 250, 252); doc.rect(M, y, CW, 8, "F"); }
    const [cr, cg, cb] = scoreRGB(c.score);
    const vals = [
      displayAssessmentName(c.name, locale).length > 28 ? displayAssessmentName(c.name, locale).slice(0, 27) + "…" : displayAssessmentName(c.name, locale),
      `${c.score}`,
      tierDisplay(c.t, locale),
      categoryDisplay(getCategory(c.name), locale),
      new Date(c.completedAt).toLocaleDateString(locale === "es" ? "es-ES" : "en-US", { month: "short", day: "numeric", year: "numeric" }),
    ];
    doc.setFontSize(7.5); doc.setFont("helvetica", "normal"); doc.setTextColor(30, 41, 59);
    cx = M;
    vals.forEach((v, i) => {
      if (i === 1) doc.setTextColor(cr, cg, cb);
      else doc.setTextColor(30, 41, 59);
      doc.text(v, cx + 2, y + 5.5);
      cx += colW[i];
    });
    y += 9;
  });

  y += 8;
  doc.setFontSize(8.5); doc.setFont("helvetica", "bold"); doc.setTextColor(100, 116, 139);
  doc.text(copy.scoreRangeReference.toUpperCase(), M, y); y += 6;
  const ranges = [
    [16, 185, 129, locale === "es" ? "80-100 - Alto (fortaleza)" : "80-100 - High (Strength)"],
    [59, 130, 246, locale === "es" ? "65-79 - Sobre el promedio" : "65-79 - Above Average"],
    [245, 158, 11, locale === "es" ? "50-64 - En desarrollo" : "50-64 - Developing"],
    [239, 68, 68, locale === "es" ? "0-49 - Requiere foco" : "0-49 - Needs Focus"],
  ] as [number, number, number, string][];
  ranges.forEach(([r, g, b, lbl]) => {
    doc.setFillColor(r, g, b); doc.rect(M, y, 3, 3, "F");
    doc.setFontSize(7.5); doc.setFont("helvetica", "normal"); doc.setTextColor(71, 85, 105);
    doc.text(lbl, M + 5, y + 2.5); y += 7;
  });

  pftr(doc, pageNum);
}

// ─── Page 14 — Methodology ───────────────────────────────────────────────────
function p14Method(doc: jsPDF, data: ComprehensiveReportData, pageNum: number) {
  const copy = copyOf(data);
  phdr(doc, data.candidateName, data.reportId);
  let y = CT + 2;
  doc.setFontSize(14); doc.setFont("helvetica", "bold"); doc.setTextColor(15, 23, 42);
  doc.text(copy.methodology, M, y); y += 12;

  const sections: [string, string][] = [
    [copy.assessmentScope, copy.assessmentScopeBody],
    [copy.scoring, copy.scoringBody],
    [copy.scoreTiers, copy.scoreTiersBody],
    [copy.evidenceTiers, copy.evidenceTiersBody],
    [copy.confidenceLevel, localeOf(data) === "es" ? "La confianza refleja la amplitud de la bateria completada. Alta: 6+ evaluaciones. Moderada: 3-5 evaluaciones. Baja: 1-2 evaluaciones. Una bateria reducida debe interpretarse como indicadores parciales, no como un perfil completo." : "Confidence reflects the breadth of the assessment battery completed. High confidence: 6+ assessments. Moderate confidence: 3-5 assessments. Low confidence: 1-2 assessments. Scores from a narrow battery should be interpreted as partial indicators rather than complete profiles."],
    [copy.importantLimitations, copy.importantLimitationsBody],
  ];

  sections.forEach(([title, content]) => {
    if (y > 265) return;
    doc.setFontSize(8.5); doc.setFont("helvetica", "bold"); doc.setTextColor(30, 41, 59);
    doc.text(title, M, y); y += 5;
    y = ww(doc, content, M, y, CW, 8, "normal", [71, 85, 105]);
    y += 7;
  });

  pftr(doc, pageNum);
}

// ─── Page 15 — Final Recommendation ─────────────────────────────────────────
function p15Final(doc: jsPDF, data: ComprehensiveReportData, avg: number, rec: RecResult, comps: CompetencyItem[], pageNum: number) {
  const copy = copyOf(data);
  const locale = localeOf(data);
  phdr(doc, data.candidateName, data.reportId);
  let y = CT + 2;
  doc.setFontSize(14); doc.setFont("helvetica", "bold"); doc.setTextColor(15, 23, 42);
  doc.text(copy.finalSummary, M, y); y += 12;

  // Large recommendation box
  const [sr, sg, sb] = rec.rgb;
  doc.setFillColor(sr, sg, sb);
  doc.rect(M, y, CW, 30, "F");
  doc.setFontSize(22); doc.setFont("helvetica", "bold"); doc.setTextColor(255, 255, 255);
  doc.text(rec.label.toUpperCase(), M + CW / 2, y + 14, { align: "center" });
  doc.setFontSize(10); doc.setFont("helvetica", "normal");
  doc.text(`${copy.assessmentAverage}: ${avg} / 100  ·  ${locale === "es" ? "Evaluaciones" : "Assessments"}: ${comps.length}  ·  ${data.reportDate}`, M + CW / 2, y + 23, { align: "center" });
  y += 36;

  y = ww(doc, rec.narrative, M, y, CW, 9, "normal", [15, 23, 42]);
  y += 10;

  // Competency summary bars
  y = secHead(doc, copy.competencyProfileSummary.toUpperCase(), y);
  const sorted = [...comps].sort((a, b) => b.score - a.score);
  const halfLen = Math.ceil(sorted.length / 2);
  const col1 = sorted.slice(0, halfLen);
  const col2 = sorted.slice(halfLen);
  const colW2 = (CW - 8) / 2;
  const startY = y;
  col1.forEach(c => {
    hBar(doc, M, y + 2, colW2 - 10, c.score, competencyLabel(c, locale));
    y += 11;
  });
  y = startY;
  col2.forEach(c => {
    hBar(doc, M + colW2 + 8, y + 2, colW2 - 10, c.score, competencyLabel(c, locale));
    y += 11;
  });
  y += Math.max(col1.length, col2.length) * 11 - Math.min(col1.length, col2.length) * 11 + 15;

  // Signoff
  doc.setFillColor(248, 250, 252); doc.rect(M, y, CW, 28, "F");
  doc.setDrawColor(226, 232, 240); doc.setLineWidth(0.3); doc.rect(M, y, CW, 28, "S");
  doc.setFontSize(8.5); doc.setFont("helvetica", "bold"); doc.setTextColor(30, 41, 59);
  doc.text(copy.authorizedSignoff, M + 5, y + 9);
  doc.setFont("helvetica", "normal"); doc.setTextColor(148, 163, 184);
  doc.text(locale === "es" ? "Nombre del revisor: ___________________________________" : "Reviewer Name: ___________________________________", M + 5, y + 18);
  doc.text(copy.signature, M + 5, y + 25);

  pftr(doc, pageNum);
}

const CATEGORY_SECTIONS = ["Cognitive", "Personality", "EQ", "Interpersonal", "Professional"] as const;

function normalizeAssessments(assessments: AssessmentScore[]): AssessmentScore[] {
  const seen = new Set<string>();
  return assessments
    .filter((assessment) => assessment.name && Number.isFinite(assessment.score))
    .map((assessment) => ({
      ...assessment,
      score: Math.max(0, Math.min(100, Math.round(assessment.score))),
    }))
    .filter((assessment) => {
      const key = `${assessment.name}:${assessment.completedAt}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

// ─── Main export ─────────────────────────────────────────────────────────────
export function downloadComprehensiveReport(data: ComprehensiveReportData): void {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  activeReportLocale = localeOf(data);
  const completedAssessments = normalizeAssessments(data.assessments);
  const reportData: ComprehensiveReportData = { ...data, locale: activeReportLocale, assessments: completedAssessments };

  const avg = completedAssessments.length
    ? Math.round(completedAssessments.reduce((s, a) => s + a.score, 0) / completedAssessments.length)
    : 0;
  const rec = recTier(avg, reportData.candidateName.split(" ")[0] || reportData.candidateName, activeReportLocale);

  const comps: CompetencyItem[] = completedAssessments.map(a => ({
    ...a,
    phrases: BANK[a.name],
    t: tier(a.score),
  }));
  const activeCategories = CATEGORY_SECTIONS.filter((category) => comps.some(c => getCategory(c.name) === category));
  reportPageTotal = 3 + activeCategories.length + 7;

  // Page 1 — Cover (no header/footer)
  p1Cover(doc, reportData, avg, rec);

  // Page 2 — Executive Summary
  let pageNum = 2;
  doc.addPage(); p2Executive(doc, reportData, avg, rec, comps, pageNum++);

  // Page 3 — Competency Dashboard
  doc.addPage(); p3Dashboard(doc, reportData, avg, comps, pageNum++);

  activeCategories.forEach((category) => {
    doc.addPage(); categoryPage(doc, reportData, comps, category, categoryDisplay(category, activeReportLocale), pageNum++);
  });

  // Page 8 — Strengths
  doc.addPage(); p8Strengths(doc, reportData, comps, pageNum++);

  // Page 9 — Development Areas
  doc.addPage(); p9Development(doc, reportData, comps, pageNum++);

  // Page 10 — Hiring Insights
  doc.addPage(); p10Hiring(doc, reportData, avg, rec, comps, pageNum++);

  // Page 11 — Interview Guide
  doc.addPage(); p11Interview(doc, reportData, comps, pageNum++);

  // Page 13 — Assessment Details
  doc.addPage(); p13Details(doc, reportData, comps, pageNum++);

  // Page 14 — Methodology
  doc.addPage(); p14Method(doc, reportData, pageNum++);

  // Page 15 — Final Recommendation
  doc.addPage(); p15Final(doc, reportData, avg, rec, comps, pageNum++);

  const safeName = reportData.candidateName.replace(/[^a-zA-Z0-9]+/g, "_");
  doc.save(`${safeName}_Assessment_Report_${reportData.reportId}.pdf`);
}
