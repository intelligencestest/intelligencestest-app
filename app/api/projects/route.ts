import { createAdminClient } from "@/lib/supabase-server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, description, deadline, assessment_ids } = body;

  if (!name) {
    return NextResponse.json({ error: "Project name is required" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: profile } = await admin.from("users").select("company_id").eq("id", user.id).single();

  if (!profile?.company_id) {
    return NextResponse.json({ error: "User has no company" }, { status: 400 });
  }

  const { data: project, error } = await admin
    .from("hiring_projects")
    .insert({
      company_id: profile.company_id,
      name,
      description: description || null,
      deadline: deadline || null,
      status: "active",
    })
    .select("id")
    .single();

  if (error || !project) {
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }

  // Link selected assessments
  if (assessment_ids?.length > 0) {
    await admin.from("project_assessments").insert(
      assessment_ids.map((aid: string) => ({
        project_id: project.id,
        assessment_id: aid,
      }))
    );
  }

  return NextResponse.json({ project_id: project.id });
}
