import { createAdminClient, createServerSupabaseClient } from "@/lib/supabase-server";
import { toAppLocale } from "@/lib/i18n/locales";
import { PLAN_LIMITS, TRIAL_DURATION_DAYS } from "@/lib/plan/limits";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { company_name, industry, company_size, hires_per_month, language } = await request.json();
  if (!company_name || !industry || !company_size || !hires_per_month) {
    return NextResponse.json({ error: "Company name, industry, company size, and hiring volume are required" }, { status: 400 });
  }
  const lang = toAppLocale(language);

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
      .update({
        name: company_name,
        industry,
        company_size,
        hires_per_month,
        language: lang,
        onboarding_completed: true,
      })
      .eq("id", userRow.company_id);
    return NextResponse.json({ success: true });
  }

  // New Google OAuth user — create company + users row
  const trialStartedAt = new Date();
  const trialEndsAt = new Date(trialStartedAt.getTime() + TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000);
  const trialLimits = PLAN_LIMITS.trial;

  const { data: company, error: companyError } = await admin
    .from("companies")
    .insert({
      name: company_name,
      email: user.email!,
      industry,
      company_size,
      hires_per_month,
      language: lang,
      onboarding_completed: true,
      plan: "trial",
      trial_started_at: trialStartedAt.toISOString(),
      trial_ends_at: trialEndsAt.toISOString(),
      trial_status: "active",
      subscription_status: "manual",
      billing_provider: "manual",
      candidate_limit: trialLimits.candidates,
      project_limit: trialLimits.projects,
      recruiter_limit: trialLimits.recruiters,
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
