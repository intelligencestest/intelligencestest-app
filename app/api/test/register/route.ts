import { createAdminClient } from "@/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";

// Public endpoint — no auth required.
// Used by the shared-link flow where candidates self-register before taking a test.
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, email, project_id, assessment_name } = body;

  if (!name || !email || !project_id || !assessment_name) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Verify the project exists and get company_id
  const { data: project, error: projectError } = await admin
    .from("hiring_projects")
    .select("id, company_id, status")
    .eq("id", project_id)
    .single();

  if (projectError || !project) {
    return NextResponse.json({ error: "Invalid assessment link" }, { status: 404 });
  }

  // Check if this email already completed this assessment for this project
  const { data: existing } = await admin
    .from("candidates")
    .select("id, status")
    .eq("project_id", project_id)
    .eq("email", email.toLowerCase().trim())
    .eq("status", "completed")
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: "You have already completed this assessment." },
      { status: 409 }
    );
  }

  const token = randomUUID();
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(); // 48 hrs

  const { data: candidate, error: insertError } = await admin
    .from("candidates")
    .insert({
      company_id: project.company_id,
      project_id,
      full_name: name.trim(),
      email: email.toLowerCase().trim(),
      status: "invited",
      token,
      token_expires_at: expiresAt,
    })
    .select("id, token")
    .single();

  if (insertError || !candidate) {
    return NextResponse.json({ error: "Failed to register. Please try again." }, { status: 500 });
  }

  // Ensure the project has the assessment linked
  const { data: assessment } = await admin
    .from("assessments")
    .select("id")
    .eq("name", assessment_name)
    .single();

  if (assessment) {
    await admin.from("project_assessments").upsert({
      project_id,
      assessment_id: assessment.id,
    });
  }

  return NextResponse.json({
    token: candidate.token,
    candidate_id: candidate.id,
    company_id: project.company_id,
  });
}
