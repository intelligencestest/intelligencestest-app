import { createAdminClient } from "@/lib/supabase-server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { toAppLocale } from "@/lib/i18n/locales";
import { assertWithinLimit } from "@/lib/plan/limits";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, description, deadline, assessment_ids, client_name, role_title } = body;

  if (!name) {
    return NextResponse.json({ error: "Project name is required" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: profile } = await admin.from("users").select("company_id").eq("id", user.id).single();

  if (!profile?.company_id) {
    return NextResponse.json({ error: "User has no company" }, { status: 400 });
  }

  const limitCheck = await assertWithinLimit(admin, profile.company_id, "project");
  if (!limitCheck.ok) {
    const { data: company } = await admin.from("companies").select("language").eq("id", profile.company_id).maybeSingle();
    const lang = toAppLocale(company?.language);
    return NextResponse.json({ error: limitCheck.message?.[lang], reason: limitCheck.reason }, { status: 403 });
  }

  const { data: project, error } = await admin
    .from("hiring_projects")
    .insert({
      company_id: profile.company_id,
      name,
      description: description || null,
      deadline: deadline || null,
      status: "active",
      client_name: client_name?.trim() || null,
      role_title: role_title?.trim() || null,
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
      await admin.from("hiring_projects").delete().eq("id", project.id);
      return NextResponse.json(
        { error: `Failed to link selected assessments: ${linkError.message}` },
        { status: 500 }
      );
    }
    console.log("[projects/create] assessment link OK, count:", assessment_ids.length);
  } else {
    console.log("[projects/create] no assessments to link, assessment_ids:", assessment_ids);
  }

  return NextResponse.json({ project_id: project.id });
}
