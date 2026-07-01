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
  if (Array.isArray(assessment_ids) && assessment_ids.length > 0) {
    console.log("[projects/create] linking assessments", { project_id: project.id, assessment_ids });
    const { error: linkError } = await admin.from("project_assessments").insert(
      assessment_ids.map((aid: string) => ({
        project_id: project.id,
        assessment_id: aid,
      }))
    );
    if (linkError) {
      console.error("[projects/create] assessment link FAILED:", linkError);
      // Project was created — return the project_id with a warning so the client can still navigate
      return NextResponse.json({ project_id: project.id, assessment_link_error: linkError.message });
    }
    console.log("[projects/create] assessment link OK, count:", assessment_ids.length);
  } else {
    console.log("[projects/create] no assessments to link, assessment_ids:", assessment_ids);
  }

  return NextResponse.json({ project_id: project.id });
}
