import { createAdminClient, createServerSupabaseClient } from "@/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { company_name, industry, language } = await request.json();
  if (!company_name || !industry) {
    return NextResponse.json({ error: "Company name and industry are required" }, { status: 400 });
  }
  const lang = ["en", "es"].includes(language) ? language : "en";

  const admin = createAdminClient();

  // Check if user already has a company (email signup path — just update)
  const { data: userRow } = await admin
    .from("users")
    .select("company_id")
    .eq("id", user.id)
    .maybeSingle();

  if (userRow?.company_id) {
    await admin
      .from("companies")
      .update({ name: company_name, industry, language: lang, onboarding_completed: true })
      .eq("id", userRow.company_id);
    return NextResponse.json({ success: true });
  }

  // New Google OAuth user — create company + users row
  const { data: company, error: companyError } = await admin
    .from("companies")
    .insert({
      name: company_name,
      email: user.email!,
      industry,
      language: lang,
      onboarding_completed: true,
    })
    .select("id")
    .single();

  if (companyError || !company) {
    return NextResponse.json({ error: "Failed to create company" }, { status: 500 });
  }

  const fullName =
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    user.email!;

  await admin.from("users").upsert({
    id: user.id,
    company_id: company.id,
    full_name: fullName,
    email: user.email!,
    role: "admin",
  });

  return NextResponse.json({ success: true });
}
