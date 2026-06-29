import { createAdminClient } from "@/lib/supabase-server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";

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

  // Ensure the project has the correct assessment linked
  if (assessment_type) {
    const { data: assessment } = await admin
      .from("assessments")
      .select("id")
      .eq("name", assessment_type)
      .single();

    if (assessment) {
      await admin.from("project_assessments").upsert({
        project_id,
        assessment_id: assessment.id,
      });
    }
  }

  const testPath = assessment_type === "Adversity Quotient (AQ) Test" ? "aq" : "critical-thinking";
  const testUrl = `/test/${testPath}?token=${candidate.token}`;

  return NextResponse.json({ candidate_id: candidate.id, test_url: testUrl });
}
