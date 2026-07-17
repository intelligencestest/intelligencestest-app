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
  selectRecommended,
  sharedRadarDimensions,
  tierSelection,
  type RankedCandidate,
} from "@/lib/pdf/client-brief-selection";
import { renderHTMLToPDF } from "@/lib/pdf/render-pdf";

import { sanitizeLogoUrl } from "@/lib/security/logo-url";
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

// buildAssessmentIntelligence only has real es/en content; fr falls back to
// en (same convention as app/(dashboard)/projects/[id]/compare/page.tsx).
function engineLocale(language: unknown): "es" | "en" {
  return language === "es" ? "es" : "en";
}

function briefLocale(language: unknown): ClientBriefLocale {
  return language === "es" || language === "fr" ? language : "en";
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
    .select("name, logo_url, language")
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
  const locale = engineLocale(company.language);
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

      const report = buildAssessmentIntelligence({ locale, assessments });
      const competencyEvidence = report.competencyEvidence.map((e) => ({ label: e.label, score: e.score }));
      const overallScore = competencyEvidence.length
        ? competencyEvidence.reduce((sum, e) => sum + e.score, 0) / competencyEvidence.length
        : 0;
      return {
        name: candidate.full_name || "—",
        level: report.recommendation.level,
        score: overallScore,
        recommendationTitle: report.recommendation.title,
        rationale: report.recommendation.rationale,
        competencyEvidence,
        interviewQuestions: report.interviewQuestions.map((q) => ({ question: q.question, reason: q.reason })),
      };
    })
    .filter((c): c is RankedCandidate => c !== null);

  // Scales with openings_count instead of a fixed "first two" — a 1-role
  // search still gets ~2 names, a 10-role staffing run gets ~15-20, ranked
  // by score within the strong/proceed pool. review/caution/notRecommended
  // and no-results candidates never reach this document — that language and
  // those candidates are internal-brief only.
  const selected = selectRecommended(ranked, openingsCount);

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

  const cards: ClientBriefCandidateCard[] = mainPrimary.map((candidate, index) => ({
    name: candidate.name,
    verdict: candidate.recommendationTitle,
    isPrimary: index === 0,
    radar: radarForCandidate(candidate, dimensions),
  }));

  const benchEntries: ClientBriefBenchEntry[] = mainBackup.map((candidate) => ({
    rank: candidate.rank,
    name: candidate.name,
    score: candidate.score,
    verdict: candidate.recommendationTitle,
  }));

  const interviewPages: ClientBriefInterviewPage[] = mainPrimary.map((candidate, index) => ({
    name: candidate.name,
    verdict: candidate.recommendationTitle,
    isPrimary: index === 0,
    questions: candidate.interviewQuestions.slice(0, 3).map((q) => ({ question: q.question, verifies: q.reason })),
  }));

  const narrative = await generateShortlistNarrative({
    locale: clientLocale,
    roleTitle: project.role_title || project.name,
    totalCandidates: candidates.length,
    recommendedCount: selected.length,
    candidates: mainPrimary.slice(0, 2).map((candidate, index) => ({
      name: candidate.name,
      recommendationTitle: candidate.recommendationTitle,
      rationale: candidate.rationale,
      isPrimary: index === 0,
    })),
  });

  const dateFormatter = new Intl.DateTimeFormat(clientLocale === "es" ? "es-ES" : clientLocale === "fr" ? "fr-FR" : "en-US", {
    year: "numeric",
    month: "long",
  });

  const shortlistData: ShortlistData = {
    locale: clientLocale,
    agencyName: company.name,
    agencyLogoUrl: sanitizeLogoUrl(company.logo_url) ?? undefined,
    roleTitle: project.role_title || project.name,
    shortlistName: project.name,
    clientName: project.client_name || undefined,
    date: dateFormatter.format(new Date()),
    narrative,
    cards,
    benchEntries,
    benchOmittedCount: plan.overflow?.backup.length ?? 0,
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
    },
  });
}
