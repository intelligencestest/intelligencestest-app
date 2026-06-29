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

  // Update candidate status
  await supabase
    .from("candidates")
    .update({ status: "completed" })
    .eq("id", candidate.id);

  return NextResponse.json({ success: true });
}
