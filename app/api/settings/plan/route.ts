import { NextResponse } from "next/server";
import { createAdminClient, createServerSupabaseClient } from "@/lib/supabase-server";
import { getPlanUsageSummary, PLAN_LIMITS, PLAN_PRICING } from "@/lib/plan/limits";

/** Read-only plan/trial/usage snapshot for the current user's company — feeds the dashboard trial banner and the Settings → Billing card. */
export async function GET() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: profile } = await admin.from("users").select("company_id").eq("id", user.id).single();

  if (!profile?.company_id) {
    return NextResponse.json({ error: "User has no company" }, { status: 400 });
  }

  const summary = await getPlanUsageSummary(admin, profile.company_id);
  if (!summary) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }

  return NextResponse.json({
    plan: summary.plan,
    planId: summary.planId,
    trialStatus: summary.trialStatus,
    trialStartedAt: summary.trialStartedAt,
    trialEndsAt: summary.trialEndsAt,
    trialDaysLeft: summary.trialDaysLeft,
    isTrialExpired: summary.isTrialExpired,
    subscriptionStatus: summary.subscriptionStatus,
    billingProvider: summary.billingProvider,
    limits: summary.limits,
    usage: summary.usage,
    pricing: summary.planId ? PLAN_PRICING[summary.planId] : null,
    planCatalog: {
      starter: { pricing: PLAN_PRICING.starter, limits: PLAN_LIMITS.starter },
      professional: { pricing: PLAN_PRICING.professional, limits: PLAN_LIMITS.professional },
      enterprise: { pricing: PLAN_PRICING.enterprise, limits: PLAN_LIMITS.enterprise },
    },
  });
}
