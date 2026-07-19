import { Resend } from "resend";

/**
 * Internal ops notifications (not customer-facing). Used for events a human
 * must act on promptly — today that is exactly one: a PayPal subscription was
 * recorded and is waiting for manual activation in the admin console. Until a
 * billing webhook exists, this email is the only thing standing between a
 * real payment and it sitting unnoticed in pending_payment.
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
    `A PayPal subscription is waiting for activation (${alert.paypalMode} mode).`,
    "",
    `Company: ${alert.companyName ?? alert.companyId}`,
    `Plan: ${alert.plan}`,
    `PayPal subscription: ${alert.subscriptionId} (status ${alert.paypalStatus})`,
    "",
    `Activate it in the admin console: ${adminUrl}`,
    "",
    "Until activated, the customer keeps their previous limits.",
  ];

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to,
      subject: `[ACTION] PayPal ${alert.plan} subscription pending activation — ${alert.companyName ?? alert.companyId}`,
      text: lines.join("\n"),
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "unknown error" };
  }
}
