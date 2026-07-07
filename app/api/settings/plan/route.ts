import { NextResponse } from "next/server";
import { createAdminClient, createServerSupabaseClient } from "@/lib/supabase-server";
import { getPlanUsageSummary, PLAN_LIMITS, PLAN_PRICE_EUR } from "@/lib/plan/limits";

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
    priceEur: summary.planId ? PLAN_PRICE_EUR[summary.planId] : null,
    planCatalog: {
      starter: { priceEur: PLAN_PRICE_EUR.starter, limits: PLAN_LIMITS.starter },
      professional: { priceEur: PLAN_PRICE_EUR.professional, limits: PLAN_LIMITS.professional },
      enterprise: { priceEur: PLAN_PRICE_EUR.enterprise, limits: PLAN_LIMITS.enterprise },
    },
  });
}
