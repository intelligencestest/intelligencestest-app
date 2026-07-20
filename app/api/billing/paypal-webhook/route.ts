import { NextRequest, NextResponse } from "next/server";
import {
  getPayPalSubscriptionConfig,
  verifyPayPalWebhookSignature,
} from "@/lib/billing/paypal";
import {
  applySubscriptionActivation,
  applySubscriptionStatus,
  planForPayPalPlanId,
} from "@/lib/billing/subscription-activation";
import { sendSubscriptionActivatedNotice } from "@/lib/ops-alert";
import { checkRateLimit, clientIpFrom } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase-server";

/**
 * PayPal webhook receiver — the automatic activation path. Every delivery is
 * verified with PayPal's verify-webhook-signature API before any state
 * changes; unverifiable requests are rejected, so this endpoint cannot be
 * used to spoof a paid plan. The admin console's manual Activate button
 * remains as backup/override only.
 *
 * Handled events:
 * - BILLING.SUBSCRIPTION.ACTIVATED  -> plan + limits unlocked immediately
 * - BILLING.SUBSCRIPTION.CANCELLED / EXPIRED -> subscription_status cancelled
 * - BILLING.SUBSCRIPTION.SUSPENDED / PAYMENT.FAILED -> past_due
 */

const STATUS_EVENTS: Record<string, { status: "past_due" | "cancelled"; paypalStatus: string }> = {
  "BILLING.SUBSCRIPTION.CANCELLED": { status: "cancelled", paypalStatus: "CANCELLED" },
  "BILLING.SUBSCRIPTION.EXPIRED": { status: "cancelled", paypalStatus: "EXPIRED" },
  "BILLING.SUBSCRIPTION.SUSPENDED": { status: "past_due", paypalStatus: "SUSPENDED" },
  "BILLING.SUBSCRIPTION.PAYMENT.FAILED": { status: "past_due", paypalStatus: "PAYMENT_FAILED" },
};

interface WebhookEvent {
  id?: string;
  event_type?: string;
  resource?: { id?: string; plan_id?: string; status?: string };
}

export async function POST(request: NextRequest) {
  // Generous per-IP limit: PayPal retries are sparse; only a spoof flood
  // would trip this, and each spoof attempt costs us a PayPal API call.
  const ip = clientIpFrom(request);
  if (!checkRateLimit(`paypal-webhook:${ip}`, 60, 60 * 1000)) {
    return NextResponse.json({ error: "rate limited" }, { status: 429 });
  }

  const config = getPayPalSubscriptionConfig();
  if (!config.webhookId || !config.clientId || !config.secret) {
    console.error("[paypal-webhook] not configured (webhook id or server credentials missing)");
    return NextResponse.json({ error: "webhook not configured" }, { status: 503 });
  }

  const rawBody = await request.text();
  let event: WebhookEvent;
  try {
    event = JSON.parse(rawBody) as WebhookEvent;
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  const eventType = event.event_type ?? "";
  const isHandled = eventType === "BILLING.SUBSCRIPTION.ACTIVATED" || eventType in STATUS_EVENTS;
  if (!isHandled) {
    // Unhandled event types change no state; acknowledge without the
    // verification round-trip so PayPal doesn't retry them forever.
    return NextResponse.json({ received: true, ignored: eventType });
  }

  let verified = false;
  try {
    verified = await verifyPayPalWebhookSignature(
      {
        transmissionId: request.headers.get("paypal-transmission-id"),
        transmissionTime: request.headers.get("paypal-transmission-time"),
        certUrl: request.headers.get("paypal-cert-url"),
        authAlgo: request.headers.get("paypal-auth-algo"),
        transmissionSig: request.headers.get("paypal-transmission-sig"),
      },
      rawBody,
      config
    );
  } catch (err) {
    // Verification infrastructure failure (not a bad signature): 503 so
    // PayPal retries later rather than dropping a real activation.
    console.error("[paypal-webhook] signature verification errored:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "verification unavailable" }, { status: 503 });
  }

  if (!verified) {
    console.warn(`[paypal-webhook] REJECTED unverified delivery from ${ip} (event_type ${eventType})`);
    return NextResponse.json({ error: "signature verification failed" }, { status: 400 });
  }

  const subscriptionId = event.resource?.id ?? "";
  if (!subscriptionId) {
    return NextResponse.json({ received: true, ignored: "no subscription id" });
  }

  const admin = createAdminClient();

  if (eventType === "BILLING.SUBSCRIPTION.ACTIVATED") {
    const plan = planForPayPalPlanId(event.resource?.plan_id ?? "", config);
    if (!plan) {
      // Signed, real PayPal event — but for a plan this app doesn't sell
      // (legacy/simulator). Nothing to activate.
      console.warn(`[paypal-webhook] ACTIVATED for foreign plan ${event.resource?.plan_id} — ignored`);
      return NextResponse.json({ received: true, ignored: "foreign plan" });
    }

    const result = await applySubscriptionActivation(admin, subscriptionId, plan);
    if (result.outcome === "company_not_found") {
      // Race: the webhook can outrun the browser's record call that stores
      // the subscription id. 503 makes PayPal redeliver in a few minutes,
      // by which time the company row is linked.
      console.warn(`[paypal-webhook] ACTIVATED ${subscriptionId}: no company linked yet — asking PayPal to retry`);
      return NextResponse.json({ error: "subscription not linked yet" }, { status: 503 });
    }

    if (result.outcome === "activated") {
      console.log(`[paypal-webhook] activated ${result.plan} for company ${result.companyId} (${subscriptionId})`);
      const notice = await sendSubscriptionActivatedNotice({
        companyId: result.companyId,
        companyName: result.companyName,
        plan: result.plan,
        subscriptionId,
        paypalMode: config.mode,
      });
      if (!notice.ok) console.error(`[paypal-webhook] activated-notice email failed: ${notice.error}`);
    }
    return NextResponse.json({ received: true, outcome: result.outcome });
  }

  const statusChange = STATUS_EVENTS[eventType];
  const outcome = await applySubscriptionStatus(admin, subscriptionId, statusChange.status, statusChange.paypalStatus);
  console.log(`[paypal-webhook] ${eventType} for ${subscriptionId}: ${outcome}`);
  return NextResponse.json({ received: true, outcome });
}
