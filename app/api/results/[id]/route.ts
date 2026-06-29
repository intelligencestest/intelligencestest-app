import { createAdminClient, createServerSupabaseClient } from "@/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  const { data: result, error } = await admin
    .from("results")
    .select("id, score, raw_answers, completed_at, candidates(full_name, email), assessments(name)")
    .eq("id", id)
    .single();

  if (error || !result) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(result);
}
