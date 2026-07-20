import { PLAN_LIMITS } from "@/lib/plan/limits";
import type { createAdminClient } from "@/lib/supabase-server";
import type { PayPalPlan, PayPalSubscriptionConfig } from "./paypal";

type AdminClient = ReturnType<typeof createAdminClient>;

export type ActivationResult =
  | { outcome: "activated"; companyId: string; companyName: string | null; plan: PayPalPlan }
  | { outcome: "already_active"; companyId: string; companyName: string | null; plan: PayPalPlan }
  | { outcome: "company_not_found" }
  | { outcome: "foreign_plan" };

/** Maps a PayPal plan id from a webhook event to our plan, or null if it's
 * not one of the plans this app sells (e.g. a legacy or unrelated plan). */
export function planForPayPalPlanId(paypalPlanId: string, config: PayPalSubscriptionConfig): PayPalPlan | null {
  if (paypalPlanId === config.plans.starter) return "starter";
  if (paypalPlanId === config.plans.professional) return "professional";
  return null;
}

/**
 * The single activation write, shared by the webhook (automatic path) and
 * reusable for audit: flips the company that registered `subscriptionId`
 * onto `plan` with that plan's limits, marks the subscription active, and
 * clears the pending state. Idempotent — a duplicate webhook delivery
 * repeats the same write and reports `already_active`.
 */
export async function applySubscriptionActivation(
  admin: AdminClient,
  subscriptionId: string,
  plan: PayPalPlan
): Promise<ActivationResult> {
  const { data: company } = await admin
    .from("companies")
    .select("id, name, plan, subscription_status")
    .eq("paypal_subscription_id", subscriptionId)
    .maybeSingle();

  if (!company) return { outcome: "company_not_found" };

  const alreadyActive = company.plan === plan && company.subscription_status === "active";
  const limits = PLAN_LIMITS[plan];
  const now = new Date().toISOString();
  const { error } = await admin
    .from("companies")
    .update({
      plan,
      candidate_limit: limits.candidates,
      project_limit: limits.projects,
      recruiter_limit: limits.recruiters,
      trial_status: "converted",
      subscription_status: "active",
      billing_provider: "paypal",
      pending_plan: null,
      paypal_subscription_status: "ACTIVE",
      paypal_subscription_updated_at: now,
      updated_at: now,
    })
    .eq("id", company.id);

  if (error) throw new Error(`activation write failed: ${error.message}`);

  return {
    outcome: alreadyActive ? "already_active" : "activated",
    companyId: company.id,
    companyName: company.name ?? null,
    plan,
  };
}

/** Lifecycle downgrades driven by webhook events after activation. */
export async function applySubscriptionStatus(
  admin: AdminClient,
  subscriptionId: string,
  subscriptionStatus: "past_due" | "cancelled",
  paypalStatus: string
): Promise<"updated" | "company_not_found"> {
  const { data: company } = await admin
    .from("companies")
    .select("id")
    .eq("paypal_subscription_id", subscriptionId)
    .maybeSingle();
  if (!company) return "company_not_found";

  const now = new Date().toISOString();
  await admin
    .from("companies")
    .update({
      subscription_status: subscriptionStatus,
      paypal_subscription_status: paypalStatus,
      paypal_subscription_updated_at: now,
      updated_at: now,
    })
    .eq("id", company.id);
  return "updated";
}
