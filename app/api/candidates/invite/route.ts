import { createAdminClient } from "@/lib/supabase-server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";

const testPaths: Record<string, string> = {
  "Critical Thinking Test": "critical-thinking",
  "Adversity Quotient (AQ) Test": "aq",
  "Emotional Intelligence Test": "emotional-intelligence",
  "Leadership Styles Test": "leadership-styles",
  "Numerical Intelligence Test": "numerical-intelligence",
  "Personality Type Test": "personality-type",
  "Situational Judgment Test": "situational-judgment",
  "Attention to Detail Test": "attention-detail",
  "Verbal Reasoning Test": "verbal-reasoning",
  "Abstract Reasoning Test": "abstract-reasoning",
  "Mechanical Reasoning Test": "mechanical-reasoning",
  "Communication Skills Test": "communication-skills",
  "Problem Solving Test": "problem-solving",
  "Work Style Assessment": "work-style",
  "Sales Aptitude Test": "sales-aptitude",
  "Customer Service Skills Test": "customer-service-skills",
  "Teamwork & Collaboration Test": "teamwork-collaboration",
  "Time Management Test": "time-management",
  "Stress Tolerance Test": "stress-tolerance",
  "Integrity & Ethics Test": "integrity-ethics",
  "Decision Making Test": "decision-making",
  "Learning Agility Test": "learning-agility",
};

export async function POST(request: NextRequest) {
  // Verify the caller is authenticated
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { full_name, email, project_id, assessment_type } = body;

  if (!full_name || !email || !project_id) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Get user's company_id
  const { data: userProfile } = await admin
    .from("users")
    .select("company_id")
    .eq("id", user.id)
    .single();

  if (!userProfile?.company_id) {
    return NextResponse.json({ error: "User has no company" }, { status: 400 });
  }

  // Look up company language for the invite link
  const { data: company } = await admin
    .from("companies")
    .select("language")
    .eq("id", userProfile.company_id)
    .single();
  const lang = company?.language && ["en", "es"].includes(company.language) ? company.language : "en";

  // Validate the assessment is in this project before creating any records
  if (!assessment_type) {
    return NextResponse.json({ error: "Assessment type is required" }, { status: 400 });
  }

  const { data: assessment } = await admin
    .from("assessments")
    .select("id")
    .eq("name", assessment_type)
    .single();

  if (!assessment) {
    return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
  }

  const { data: linked } = await admin
    .from("project_assessments")
    .select("assessment_id")
    .eq("project_id", project_id)
    .eq("assessment_id", assessment.id)
    .maybeSingle();

  if (!linked) {
    return NextResponse.json({ error: "This assessment is not part of the selected project" }, { status: 403 });
  }

  const token = randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

  const { data: candidate, error } = await admin
    .from("candidates")
    .insert({
      company_id: userProfile.company_id,
      project_id,
      full_name,
      email,
      status: "invited",
      token,
      token_expires_at: expiresAt,
    })
    .select("id, token")
    .single();

  if (error) {
    return NextResponse.json({ error: "Failed to create candidate" }, { status: 500 });
  }

  const testPath = testPaths[assessment_type] ?? "critical-thinking";
  const langParam = lang !== "en" ? `&lang=${lang}` : "";
  const testUrl = `/test/${testPath}?token=${candidate.token}${langParam}`;

  return NextResponse.json({ candidate_id: candidate.id, test_url: testUrl });
}
