import { createAdminClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function GET() {
  const admin = createAdminClient();
  const { data: assessments } = await admin
    .from("assessments")
    .select("id, name, category, description, duration_minutes, question_count, status")
    .order("category")
    .order("name");
  return NextResponse.json({ assessments: assessments ?? [] });
}
