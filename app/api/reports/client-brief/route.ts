import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, createServerSupabaseClient } from "@/lib/supabase-server";
import { buildAssessmentIntelligence, type AssessmentResultInput } from "@/lib/assessment-intelligence";
import { generateShortlistNarrative } from "@/lib/claude";
import {
  buildClientBriefHTML,
  type ClientBriefBenchEntry,
  type ClientBriefCandidateCard,
  type ClientBriefInterviewPage,
  type ClientBriefLocale,
  type ShortlistData,
} from "@/lib/pdf/client-brief-template";
import {
  planClientBriefDocuments,
  radarForCandidate,
  selectShortlist,
  sharedRadarDimensions,
  tierSelection,
  type RankedCandidate,
} from "@/lib/pdf/client-brief-selection";
import { buildCandidateInterviewPlan, executiveSummaryEvidence } from "@/lib/pdf/client-brief-copy";
import { renderHTMLToPDF } from "@/lib/pdf/render-pdf";
import { normalizePrimaryColor, validateReportFooterTextInput } from "@/lib/security/company-branding";
import { sanitizeLogoUrl } from "@/lib/security/logo-url";
import { displayedPercentile } from "@/lib/assessment-intelligence/evidence-methodology";

// Separate, parallel pipeline for the client-facing brief only. Does not
// touch app/api/reports/pdf/route.ts (internal brief, @react-pdf/renderer) —
// that stays exactly as-is.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CandidateRow = {
  id: string;
  full_name: string;
  status: string;
  results: {
    id: string;
    score: number;
    completed_at: string;
    raw_answers: unknown;
    assessment_id: string;
    assessments: { id: string; name: string; category: string | null } | null;
  }[];
};

// ClientBriefLocale and IntelligenceLocale are both "en" | "es" | "fr", so
// the same resolved locale drives both the wrapper copy and the underlying
// assessment-intelligence content (evidence labels, interview questions).
function briefLocale(language: unknown): ClientBriefLocale {
  return language === "es" || language === "fr" ? language : "en";
}

function confidenceVerdict(locale: ClientBriefLocale, confidence?: string): string | null {
  if (!confidence) return null;
  const labels: Record<string, Record<ClientBriefLocale, string>> = {
    high: { es: "confianza alta", en: "high confidence", fr: "confiance élevée" },
    moderate: { es: "confianza media", en: "moderate confidence", fr: "confiance moyenne" },
    low: { es: "confianza baja", en: "low confidence", fr: "confiance faible" },
  };
  return labels[confidence]?.[locale] ?? null;
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const projectId = body?.projectId;
  if (!projectId || typeof projectId !== "string") {
    return NextResponse.json({ error: "projectId is required" }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  const { data: profile } = await admin.from("users").select("company_id").eq("id", user.id).single();
  const companyId = profile?.company_id;
  if (!companyId) return NextResponse.json({ error: "No company" }, { status: 400 });

  const { data: company } = await admin
    .from("companies")
    .select("name, logo_url, language, primary_color, report_footer_text")
    .eq("id", companyId)
    .maybeSingle();
  if (!company) return NextResponse.json({ error: "Company not found" }, { status: 404 });

  const { data: project } = await admin
    .from("hiring_projects")
    .select("id, name, client_name, role_title, openings_count")
    .eq("id", projectId)
    .eq("company_id", companyId)
    .maybeSingle();
  if (!project) return NextResponse.json({ error: "Shortlist not found" }, { status: 404 });

  const openingsCount = project.openings_count ?? 1;

  const { data: candidateRows } = await admin
    .from("candidates")
    .select(
      "id, full_name, status, results(id, score, completed_at, raw_answers, assessment_id, assessments(id, name, category))"
    )
    .eq("project_id", projectId)
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })
    .returns<CandidateRow[]>();

  const candidates = candidateRows ?? [];
  const clientLocale = briefLocale(company.language);

  const ranked: RankedCandidate[] = candidates
    .map((candidate): RankedCandidate | null => {
      const results = candidate.results ?? [];
      if (results.length === 0) return null; // no completed assessments -> excluded entirely from the client brief

      const assessments: AssessmentResultInput[] = results.map((r) => ({
        id: r.id,
        assessmentId: r.assessment_id,
        name: r.assessments?.name ?? "Assessment",
        category: r.assessments?.category ?? undefined,
        score: r.score,
        completedAt: r.completed_at,
        rawAnswers: r.raw_answers,
      }));

      const report = buildAssessmentIntelligence({ locale: clientLocale, assessments });
      const competencyEvidence = report.competencyEvidence.map((e) => ({ label: e.label, score: e.score }));
      const overallScore = competencyEvidence.length
        ? competencyEvidence.reduce((sum, e) => sum + e.score, 0) / competencyEvidence.length
        : 0;
      return {
        name: candidate.full_name || "—",
        confidence: report.confidence.level as string,
        level: report.recommendation.level,
        score: overallScore,
        recommendationTitle: report.recommendation.title,
        rationale: report.recommendation.rationale,
        competencyEvidence,
        interviewQuestions: report.interviewQuestions.map((q) => ({ question: q.question, reason: q.reason, competency: q.competency })),
      };
    })
    .filter((c): c is RankedCandidate => c !== null);

  // Scales with openings_count instead of a fixed "first two" — a 1-role
  // search still gets ~2 names, a 10-role staffing run gets ~15-20, ranked
  // by score within the strong/proceed pool. review/caution/notRecommended
  // and no-results candidates never reach this document — that language and
  // those candidates are internal-brief only.
  const cohortScores = ranked.map((c) => c.score);
  const { selected, cutoff } = selectShortlist(ranked, openingsCount);
  if (cutoff) console.log(`[client-brief] cutoff ${cutoff.decisionType}: recommended ${cutoff.recommendedCount} (gap ${cutoff.selectedGap ?? "n/a"}, ratio ${cutoff.gapRatio?.toFixed(2) ?? "n/a"})`);

  if (selected.length === 0) {
    return NextResponse.json(
      { error: "No candidates in this shortlist are ready for a client-facing recommendation yet." },
      { status: 422 }
    );
  }

  // Tier the selected set: primary (rank 1..openings_count) gets full
  // treatment, backup (the rest of the target) is a compact bench with no
  // interview-kit page. Then check whether the backup bench alone would push
  // this document past a reasonable page budget — if so, trim it and note
  // the overflow rather than silently ballooning the PDF.
  const { primary, backup } = tierSelection(selected, openingsCount);
  const plan = planClientBriefDocuments(primary, backup);
  if (plan.overflow) {
    // Known follow-up: delivering the overflow backup bench as its own
    // document (second download, zip, etc.) isn't wired up yet — this is a
    // UX decision, not a data one. For now the main document is trimmed to
    // stay under the budget and the omission is surfaced via a header.
    console.warn(
      `[client-brief] backup bench trimmed: ${plan.overflow.backup.length} candidates omitted to stay under the ${plan.estimatedMainPages}-page-estimate budget`
    );
  }
  const mainPrimary = plan.main.primary;
  const mainBackup = plan.main.backup;

  const dimensions = sharedRadarDimensions(mainPrimary);
  const interviewPlans = new Map(
    mainPrimary.map((candidate) => [
      candidate,
      buildCandidateInterviewPlan({
        locale: clientLocale,
        candidateName: candidate.name,
        confidence: candidate.confidence,
        competencyEvidence: candidate.competencyEvidence,
        roleTitle: project.role_title || project.name,
        sourceQuestions: candidate.interviewQuestions.map((question) => ({
          competency: question.competency,
          question: question.question,
        })),
      }),
    ])
  );

  const cards: ClientBriefCandidateCard[] = mainPrimary.map((candidate, index) => {
    const radar = radarForCandidate(candidate, dimensions);
    // Must be derived from the same score that drives ranking (candidate.score,
    // the full competency-evidence average), not the radar's dimension subset.
    // sharedRadarDimensions only plots the 5 dimensions with the best cohort-wide
    // scores, so averaging just those points produced a different "Overall X/5"
    // number than the one candidates were actually ranked by -- visibly
    // contradicting the displayed order (a lower-ranked candidate could show a
    // higher partial-dimension average than the candidate above them).
    // 0-100, unscaled -- matches ClientBriefBenchEntry.score so the primary
    // shortlist and the backup bench never show two different scales for the
    // same "overall score" concept in one document (the radar chart itself
    // stays on its own 0-5 axis, a plot convention, not the headline number).
    const overallScore = candidate.score;
    const interviewPlan = interviewPlans.get(candidate)!;

    // "Why" behind the confidence label -- derived only from competencyEvidence,
    // the exact scores already rendered as this card's radar/bars, using the
    // same MAD-based robustSD the real confidence score is built on (spec
    // Stage 2). Never reads confidenceCaveat/limitations/risks, which stay
    // internal-only; this is a presentational summary of data already on the
    // client-safe side of that boundary.
    const competencyScores = candidate.competencyEvidence.map((e) => e.score);
    const confidenceNote: ClientBriefCandidateCard["confidenceNote"] =
      competencyScores.length < 2
        ? undefined
        : candidate.confidence === "high"
          ? { kind: "consistent", competencyCount: competencyScores.length }
          : {
              kind: "spread",
              lowestLabel: candidate.competencyEvidence.reduce((lowest, e) => (e.score < lowest.score ? e : lowest)).label,
            };

    return {
      name: candidate.name,
      verdict: confidenceVerdict(clientLocale, candidate.confidence)
        ? `${candidate.recommendationTitle} · ${confidenceVerdict(clientLocale, candidate.confidence)}`
        : candidate.recommendationTitle,
      isPrimary: index === 0,
      profileConclusion: interviewPlan.profileConclusion,
      isPriorityRecommendation: candidate.level === "strong",
      overallScore,
      percentile: displayedPercentile(candidate.score, cohortScores),
      radar,
      confidenceNote,
    };
  });

  const benchEntries: ClientBriefBenchEntry[] = mainBackup.map((candidate) => ({
    rank: candidate.rank,
    name: candidate.name,
    score: candidate.score,
    percentile: displayedPercentile(candidate.score, cohortScores),
    verdict: candidate.recommendationTitle,
  }));

  const interviewPages: ClientBriefInterviewPage[] = mainPrimary.map((candidate, index) => {
    const interviewPlan = interviewPlans.get(candidate)!;

    return {
      name: candidate.name,
      verdict: candidate.recommendationTitle,
      isPrimary: index === 0,
      objectiveTitle: interviewPlan.objectiveTitle,
      objectiveCopy: interviewPlan.objectiveCopy,
      questions: interviewPlan.questions,
    };
  });

  const narrative = await generateShortlistNarrative({
    locale: clientLocale,
    roleTitle: project.role_title || project.name,
    totalCandidates: candidates.length,
    recommendedCount: selected.length,
    candidates: mainPrimary.slice(0, 2).map((candidate, index) => ({
      name: candidate.name,
      recommendationTitle: candidate.recommendationTitle,
      executiveEvidence: executiveSummaryEvidence({
        locale: clientLocale,
        candidateName: candidate.name,
        confidence: candidate.confidence,
        competencyEvidence: candidate.competencyEvidence,
        narrativePosition: index === 0 ? "lead" : "alternate",
      }),
      isPrimary: index === 0,
    })),
  });

  const dateFormatter = new Intl.DateTimeFormat(clientLocale === "es" ? "es-ES" : clientLocale === "fr" ? "fr-FR" : "en-US", {
    year: "numeric",
    month: "long",
  });
  const reportFooterText = validateReportFooterTextInput(company.report_footer_text);

  const shortlistData: ShortlistData = {
    locale: clientLocale,
    agencyName: company.name,
    agencyLogoUrl: sanitizeLogoUrl(company.logo_url) ?? undefined,
    accentColor: normalizePrimaryColor(company.primary_color) ?? undefined,
    reportFooterText: reportFooterText.ok ? reportFooterText.value ?? undefined : undefined,
    roleTitle: project.role_title || project.name,
    shortlistName: project.name,
    clientName: project.client_name || undefined,
    date: dateFormatter.format(new Date()),
    narrative,
    cards,
    benchEntries,
    benchOmittedCount: plan.overflow?.backup.length ?? 0,
    cutoffDecisionType: cutoff?.decisionType === "natural_break" || cutoff?.decisionType === "policy_fallback" ? cutoff.decisionType : undefined,
    interviewPages,
  };

  const html = buildClientBriefHTML(shortlistData);
  const pdf = await renderHTMLToPDF(html);

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Cache-Control": "no-store",
      "Content-Disposition": `attachment; filename="client-brief-${project.id}.pdf"`,
      "Content-Type": "application/pdf",
      "X-Robots-Tag": "noindex, nofollow",
      ...(plan.overflow ? { "X-Client-Brief-Backup-Omitted": String(plan.overflow.backup.length) } : {}),
      ...(cutoff ? { "X-Client-Brief-Cutoff": cutoff.decisionType } : {}),
    },
  });
}
