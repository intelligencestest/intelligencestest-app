import { createAdminClient, createServerSupabaseClient } from "@/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: project_id } = await params;

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  const { data: profile } = await admin.from("users").select("company_id").eq("id", user.id).single();
  if (!profile?.company_id) return NextResponse.json({ error: "No company" }, { status: 400 });

  const { data: project } = await admin
    .from("hiring_projects")
    .select("id")
    .eq("id", project_id)
    .eq("company_id", profile.company_id)
    .single();

  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const { assessment_id } = await request.json();
  if (!assessment_id) return NextResponse.json({ error: "assessment_id required" }, { status: 400 });

  const { data: assessment } = await admin
    .from("assessments")
    .select("id")
    .eq("id", assessment_id)
    .single();
  if (!assessment) return NextResponse.json({ error: "Assessment not found" }, { status: 404 });

  const { data: existing } = await admin
    .from("project_assessments")
    .select("assessment_id")
    .eq("project_id", project_id)
    .eq("assessment_id", assessment_id)
    .maybeSingle();

  if (existing) return NextResponse.json({ ok: true, already_linked: true });

  const { error } = await admin.from("project_assessments").insert({ project_id, assessment_id });
  if (error) {
    console.error("[projects/assessments] link FAILED:", error);
    return NextResponse.json({ error: error.message || "Failed to link assessment" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
