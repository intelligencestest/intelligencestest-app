import { createAdminClient } from "@/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

interface CandidateRow {
  id: string;
  full_name: string;
  email: string;
  status: string;
  project_id: string;
  company_id: string;
  token_expires_at: string | null;
  hiring_projects: { name: string } | null;
}

interface ProjectAssessmentRow {
  assessment_id: string;
  assessments: { id: string; name: string; duration_minutes: number; question_count: number } | null;
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Token is required" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: candidate, error } = await supabase
    .from("candidates")
    .select("id, full_name, email, status, project_id, company_id, token_expires_at, hiring_projects(name)")
    .eq("token", token)
    .returns<CandidateRow[]>()
    .maybeSingle();

  if (error || !candidate) {
    return NextResponse.json({ error: "Invalid or expired invitation link" }, { status: 404 });
  }

  if (candidate.token_expires_at && new Date(candidate.token_expires_at) < new Date()) {
    return NextResponse.json({ error: "This invitation link has expired" }, { status: 410 });
  }

  if (candidate.status === "completed") {
    return NextResponse.json({ error: "You have already completed this assessment" }, { status: 409 });
  }

  // Opening a valid test link moves the candidate from invited to started.
  if (candidate.status === "invited") {
    await supabase
      .from("candidates")
      .update({ status: "started", pipeline_stage: "started", stage_changed_at: new Date().toISOString() })
      .eq("id", candidate.id)
      .eq("status", "invited");
  }

  const { data: projectAssessments } = await supabase
    .from("project_assessments")
    .select("assessment_id, assessments(id, name, duration_minutes, question_count)")
    .eq("project_id", candidate.project_id)
    .returns<ProjectAssessmentRow[]>();

  return NextResponse.json({
    candidate: {
      id: candidate.id,
      full_name: candidate.full_name,
      email: candidate.email,
      status: candidate.status,
      project_id: candidate.project_id,
      company_id: candidate.company_id,
    },
    project: candidate.hiring_projects,
    assessments: projectAssessments?.map((pa) => pa.assessments) ?? [],
  });
}
