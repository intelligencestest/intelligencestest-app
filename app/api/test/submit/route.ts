import { createAdminClient } from "@/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { token, assessment_name, score, raw_answers } = body;

  if (!token || !assessment_name || score === undefined) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Validate the token and get candidate info
  const { data: candidate, error: candidateError } = await supabase
    .from("candidates")
    .select("id, company_id, project_id, status, token_expires_at")
    .eq("token", token)
    .single();

  if (candidateError || !candidate) {
    return NextResponse.json({ error: "Invalid token" }, { status: 404 });
  }

  if (candidate.status === "completed") {
    return NextResponse.json({ error: "Assessment already submitted" }, { status: 409 });
  }

  if (candidate.token_expires_at && new Date(candidate.token_expires_at) < new Date()) {
    return NextResponse.json({ error: "Invitation link has expired" }, { status: 410 });
  }

  // Look up the assessment by name
  const { data: assessment, error: assessmentError } = await supabase
    .from("assessments")
    .select("id")
    .eq("name", assessment_name)
    .single();

  if (assessmentError || !assessment) {
    return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
  }

  const { data: projectAssessments } = await supabase
    .from("project_assessments")
    .select("assessment_id")
    .eq("project_id", candidate.project_id);

  const assignedAssessmentIds = new Set((projectAssessments ?? []).map((row) => row.assessment_id));
  if (assignedAssessmentIds.size > 0 && !assignedAssessmentIds.has(assessment.id)) {
    return NextResponse.json({ error: "Assessment is not assigned to this candidate" }, { status: 403 });
  }

  const { data: existingResult } = await supabase
    .from("results")
    .select("id")
    .eq("candidate_id", candidate.id)
    .eq("assessment_id", assessment.id)
    .maybeSingle();

  if (existingResult) {
    return NextResponse.json({ error: "Assessment already submitted" }, { status: 409 });
  }

  // Save the result
  const { error: resultError } = await supabase.from("results").insert({
    company_id: candidate.company_id,
    candidate_id: candidate.id,
    assessment_id: assessment.id,
    project_id: candidate.project_id,
    score,
    raw_answers,
    completed_at: new Date().toISOString(),
  });

  if (resultError) {
    return NextResponse.json({ error: "Failed to save result" }, { status: 500 });
  }

  const { data: completedResults } = await supabase
    .from("results")
    .select("assessment_id")
    .eq("candidate_id", candidate.id)
    .eq("project_id", candidate.project_id);

  const completedAssessmentIds = new Set((completedResults ?? []).map((row) => row.assessment_id));
  const hasAssignmentList = assignedAssessmentIds.size > 0;
  const allAssignedAssessmentsComplete = hasAssignmentList
    ? [...assignedAssessmentIds].every((id) => completedAssessmentIds.has(id))
    : true;

  // Update candidate status + pipeline stage only when the assigned battery is complete.
  await supabase
    .from("candidates")
    .update({
      status: allAssignedAssessmentsComplete ? "completed" : "started",
      pipeline_stage: allAssignedAssessmentsComplete ? "completed" : "started",
      stage_changed_at: new Date().toISOString(),
    })
    .eq("id", candidate.id);

  return NextResponse.json({
    success: true,
    all_assessments_completed: allAssignedAssessmentsComplete,
    remaining_assessment_count: hasAssignmentList
      ? Math.max(assignedAssessmentIds.size - completedAssessmentIds.size, 0)
      : 0,
  });
}
