import { NextRequest, NextResponse } from "next/server";
import {
  fetchPayPalSubscription,
  getPayPalSubscriptionConfig,
  type PayPalPlan,
} from "@/lib/billing/paypal";
import { sendPendingSubscriptionAlert } from "@/lib/ops-alert";
import { normalizePlan } from "@/lib/plan/limits";
import { createAdminClient, createServerSupabaseClient } from "@/lib/supabase-server";

const ACCEPTED_PAYPAL_STATUSES = new Set(["APPROVAL_PENDING", "APPROVED", "ACTIVE"]);

function clean(value: unknown, max = 200) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function jsonError(message: string, status: number, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return jsonError("Unauthorized", 401);
  }

  const body = await request.json().catch(() => null);
  const plan = normalizePlan(clean(body?.plan));
  const subscriptionId = clean(body?.subscription_id, 128);

  if (plan !== "starter" && plan !== "professional") {
    return jsonError("Starter or Professional plan is required.", 400);
  }
  if (!subscriptionId) {
    return jsonError("PayPal subscription id is required.", 400);
  }

  const admin = createAdminClient();
  const { data: profile } = await admin.from("users").select("company_id").eq("id", user.id).single();

  if (!profile?.company_id) {
    return jsonError("User has no company.", 400);
  }

  const config = getPayPalSubscriptionConfig();
  const expectedPlanId = config.plans[plan as PayPalPlan];

  if (!config.clientId || !config.secret || !expectedPlanId) {
    return jsonError("PayPal server configuration is incomplete.", 503, { missing: config.missingServer });
  }

  let paypalSubscription;
  try {
    paypalSubscription = await fetchPayPalSubscription(subscriptionId, config);
  } catch {
    return jsonError("Could not verify the PayPal subscription.", 502);
  }

  const paypalStatus = paypalSubscription.status?.toUpperCase() ?? "UNKNOWN";
  if (paypalSubscription.plan_id !== expectedPlanId) {
    return jsonError("PayPal subscription does not match the selected plan.", 400);
  }
  if (!ACCEPTED_PAYPAL_STATUSES.has(paypalStatus)) {
    return jsonError("PayPal subscription is not approved yet.", 400, { paypalStatus });
  }

  const { data: duplicate } = await admin
    .from("companies")
    .select("id")
    .eq("paypal_subscription_id", subscriptionId)
    .neq("id", profile.company_id)
    .maybeSingle();

  if (duplicate) {
    return jsonError("This PayPal subscription is already linked to another workspace.", 409);
  }

  const now = new Date().toISOString();
  const { error } = await admin
    .from("companies")
    .update({
      pending_plan: plan,
      subscription_status: "pending_payment",
      billing_provider: "paypal",
      paypal_subscription_id: subscriptionId,
      paypal_subscription_status: paypalStatus,
      paypal_subscription_updated_at: now,
      updated_at: now,
    })
    .eq("id", profile.company_id);

  if (error) {
    return jsonError(error.message, 500);
  }

  // Activation is a manual ops step — make sure a human hears about it now.
  // A failed alert must not fail the customer's checkout, but it is logged
  // loudly because an unnoticed pending payment is the worst failure mode.
  const { data: company } = await admin
    .from("companies")
    .select("name")
    .eq("id", profile.company_id)
    .maybeSingle();
  const alertResult = await sendPendingSubscriptionAlert({
    companyId: profile.company_id,
    companyName: company?.name ?? null,
    plan,
    subscriptionId,
    paypalStatus,
    paypalMode: config.mode,
  });
  if (!alertResult.ok) {
    console.error(
      `[billing] ops alert failed for pending PayPal subscription ${subscriptionId} (company ${profile.company_id}): ${alertResult.error}`
    );
  }

  return NextResponse.json({
    ok: true,
    pendingPlan: plan,
    subscriptionId,
    paypalStatus,
  });
}
