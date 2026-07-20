import { Resend } from "resend";

/**
 * Internal ops notifications (not customer-facing) — a heads-up/audit trail,
 * not a required action: the PayPal webhook activates subscriptions
 * automatically, and the admin console's Activate button is backup only.
 *
 * Recipient comes from OPS_ALERT_EMAIL, falling back to the monitored support
 * mailbox. Failures are reported to the caller but must never block the
 * customer-facing flow.
 */
const OPS_FALLBACK_EMAIL = "support@intelligencestest.com";

export interface PendingSubscriptionAlert {
  companyId: string;
  companyName: string | null;
  plan: string;
  subscriptionId: string;
  paypalStatus: string;
  paypalMode: string;
}

export async function sendPendingSubscriptionAlert(alert: PendingSubscriptionAlert): Promise<{ ok: boolean; error?: string }> {
  const to = process.env.OPS_ALERT_EMAIL?.trim() || OPS_FALLBACK_EMAIL;
  const adminUrl = `https://app.intelligencestest.com/admin/companies/${alert.companyId}`;

  const lines = [
    `A PayPal subscription was recorded (${alert.paypalMode} mode).`,
    "",
    `Company: ${alert.companyName ?? alert.companyId}`,
    `Plan: ${alert.plan}`,
    `PayPal subscription: ${alert.subscriptionId} (status ${alert.paypalStatus})`,
    "",
    "The webhook activates it automatically once PayPal confirms — you should",
    "receive an \"activated\" email within minutes. If that email never arrives,",
    `activate manually in the admin console: ${adminUrl}`,
  ];

  return send(
    to,
    `[INFO] PayPal ${alert.plan} subscription recorded — ${alert.companyName ?? alert.companyId}`,
    lines
  );
}

export interface SubscriptionActivatedNotice {
  companyId: string;
  companyName: string | null;
  plan: string;
  subscriptionId: string;
  paypalMode: string;
}

/** Audit-trail notice: the webhook already activated the plan — no action needed. */
export async function sendSubscriptionActivatedNotice(notice: SubscriptionActivatedNotice): Promise<{ ok: boolean; error?: string }> {
  const to = process.env.OPS_ALERT_EMAIL?.trim() || OPS_FALLBACK_EMAIL;
  const adminUrl = `https://app.intelligencestest.com/admin/companies/${notice.companyId}`;
  const lines = [
    `PayPal activated a subscription and the plan was unlocked automatically (${notice.paypalMode} mode).`,
    "",
    `Company: ${notice.companyName ?? notice.companyId}`,
    `Plan: ${notice.plan} (limits applied immediately)`,
    `PayPal subscription: ${notice.subscriptionId}`,
    "",
    `No action needed. Company record: ${adminUrl}`,
  ];
  return send(
    to,
    `[OK] ${notice.plan} activated automatically — ${notice.companyName ?? notice.companyId}`,
    lines
  );
}

async function send(to: string, subject: string, lines: string[]): Promise<{ ok: boolean; error?: string }> {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to,
      subject,
      text: lines.join("\n"),
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "unknown error" };
  }
}
