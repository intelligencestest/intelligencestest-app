import { createAdminClient, createServerSupabaseClient } from "@/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  const { data: profile } = await admin.from("users").select("company_id").eq("id", user.id).single();
  if (!profile?.company_id) return NextResponse.json({ error: "No company" }, { status: 400 });

  const { data: existing } = await admin
    .from("hiring_projects")
    .select("id")
    .eq("id", id)
    .eq("company_id", profile.company_id)
    .single();
  if (!existing) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const body = await request.json();
  const { name, description, deadline } = body;
  if (!name?.trim()) return NextResponse.json({ error: "Project name is required" }, { status: 400 });

  const { error } = await admin
    .from("hiring_projects")
    .update({
      name: name.trim(),
      description: description?.trim() || null,
      deadline: deadline || null,
    })
    .eq("id", id)
    .eq("company_id", profile.company_id);

  if (error) return NextResponse.json({ error: "Failed to update project" }, { status: 500 });

  return NextResponse.json({ ok: true });
}
