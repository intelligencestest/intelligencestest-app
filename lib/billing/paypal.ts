export type PayPalPlan = "starter" | "professional";
export type PayPalMode = "sandbox" | "live";

// Genuine SANDBOX app + sandbox plans (Starter $49 / Professional $109
// founding rates). The previous values here were, despite the name, the LIVE
// client ID and LIVE plans at stale EUR prices — meaning any deploy without
// explicit PayPal env vars rendered a real, chargeable checkout. These
// fallbacks must only ever point at sandbox artifacts.
const SANDBOX_FALLBACK_CLIENT_ID =
  "ASKEJrg83RgQYBRkKmyG-SO4BxmVQA6KWPwspJGnJaPuIMJmSFu51KAeWZxv-BLjVVIsT0RHNHw9Hytd";

const SANDBOX_FALLBACK_PLANS: Record<PayPalPlan, string> = {
  starter: "P-84E667415H591160RNJOQHVY",
  professional: "P-3H614029S9451523BNJOQHWA",
};

function readEnv(...names: string[]) {
  for (const name of names) {
    const value = process.env[name]?.trim();
    if (value) return value;
  }
  return null;
}

export function getPayPalMode(): PayPalMode {
  const mode = process.env.PAYPAL_MODE?.trim().toLowerCase();
  return mode === "live" || mode === "production" ? "live" : "sandbox";
}

export interface PayPalSubscriptionConfig {
  mode: PayPalMode;
  apiBase: string;
  clientId: string | null;
  secret: string | null;
  plans: Record<PayPalPlan, string | null>;
  /** PayPal webhook id (from webhook registration) — required to verify webhook signatures. */
  webhookId: string | null;
  missingCheckout: string[];
  missingServer: string[];
}

export function getPayPalSubscriptionConfig(): PayPalSubscriptionConfig {
  const mode = getPayPalMode();
  const apiBase = mode === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
  const clientId =
    mode === "live"
      ? readEnv("NEXT_PUBLIC_PAYPAL_CLIENT_ID", "PAYPAL_LIVE_CLIENT_ID", "PAYPAL_CLIENT_ID")
      : readEnv("NEXT_PUBLIC_PAYPAL_CLIENT_ID", "PAYPAL_SANDBOX_CLIENT_ID", "PAYPAL_CLIENT_ID") ??
        SANDBOX_FALLBACK_CLIENT_ID;
  const secret =
    mode === "live"
      ? readEnv("PAYPAL_LIVE_SECRET", "PAYPAL_SECRET")
      : readEnv("PAYPAL_SANDBOX_SECRET", "PAYPAL_SECRET");
  const plans: Record<PayPalPlan, string | null> = {
    starter:
      mode === "live"
        ? readEnv("NEXT_PUBLIC_PAYPAL_STARTER_PLAN_ID", "PAYPAL_LIVE_STARTER_PLAN_ID", "PAYPAL_STARTER_PLAN_ID")
        : readEnv("NEXT_PUBLIC_PAYPAL_STARTER_PLAN_ID", "PAYPAL_SANDBOX_STARTER_PLAN_ID", "PAYPAL_STARTER_PLAN_ID") ??
          SANDBOX_FALLBACK_PLANS.starter,
    professional:
      mode === "live"
        ? readEnv(
            "NEXT_PUBLIC_PAYPAL_PROFESSIONAL_PLAN_ID",
            "PAYPAL_LIVE_PROFESSIONAL_PLAN_ID",
            "PAYPAL_PROFESSIONAL_PLAN_ID"
          )
        : readEnv(
            "NEXT_PUBLIC_PAYPAL_PROFESSIONAL_PLAN_ID",
            "PAYPAL_SANDBOX_PROFESSIONAL_PLAN_ID",
            "PAYPAL_PROFESSIONAL_PLAN_ID"
          ) ?? SANDBOX_FALLBACK_PLANS.professional,
  };
  const webhookId =
    mode === "live"
      ? readEnv("PAYPAL_LIVE_WEBHOOK_ID", "PAYPAL_WEBHOOK_ID")
      : readEnv("PAYPAL_SANDBOX_WEBHOOK_ID", "PAYPAL_WEBHOOK_ID");
  const missingCheckout = [
    !clientId ? (mode === "live" ? "PAYPAL_CLIENT_ID" : "PAYPAL_SANDBOX_CLIENT_ID") : null,
    !plans.starter ? "PAYPAL_STARTER_PLAN_ID" : null,
    !plans.professional ? "PAYPAL_PROFESSIONAL_PLAN_ID" : null,
  ].filter((value): value is string => Boolean(value));
  const missingServer = [
    ...missingCheckout,
    !secret ? (mode === "live" ? "PAYPAL_SECRET" : "PAYPAL_SANDBOX_SECRET") : null,
  ].filter((value): value is string => Boolean(value));

  return { mode, apiBase, clientId, secret, plans, webhookId, missingCheckout, missingServer };
}

export async function getPayPalAccessToken(config: PayPalSubscriptionConfig): Promise<string> {
  if (!config.clientId || !config.secret) {
    throw new Error("PayPal server credentials are missing.");
  }
  const tokenResponse = await fetch(`${config.apiBase}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${config.clientId}:${config.secret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });
  if (!tokenResponse.ok) {
    throw new Error("PayPal access token request failed.");
  }
  const tokenPayload = (await tokenResponse.json()) as { access_token?: string };
  if (!tokenPayload.access_token) {
    throw new Error("PayPal access token was missing.");
  }
  return tokenPayload.access_token;
}

export interface PayPalWebhookHeaders {
  transmissionId: string | null;
  transmissionTime: string | null;
  certUrl: string | null;
  authAlgo: string | null;
  transmissionSig: string | null;
}

/**
 * Verifies a webhook delivery via PayPal's verify-webhook-signature API —
 * PayPal itself checks the transmission signature against the registered
 * webhook, so spoofed posts (whatever their body claims) come back INVALID.
 * `rawBody` is embedded verbatim so the signed bytes are exactly what we
 * received, not a re-serialization.
 */
export async function verifyPayPalWebhookSignature(
  headers: PayPalWebhookHeaders,
  rawBody: string,
  config: PayPalSubscriptionConfig
): Promise<boolean> {
  if (!config.webhookId) throw new Error("PAYPAL_WEBHOOK_ID is not configured.");
  if (
    !headers.transmissionId ||
    !headers.transmissionTime ||
    !headers.certUrl ||
    !headers.authAlgo ||
    !headers.transmissionSig
  ) {
    return false;
  }

  const token = await getPayPalAccessToken(config);
  const body =
    `{"transmission_id":${JSON.stringify(headers.transmissionId)},` +
    `"transmission_time":${JSON.stringify(headers.transmissionTime)},` +
    `"cert_url":${JSON.stringify(headers.certUrl)},` +
    `"auth_algo":${JSON.stringify(headers.authAlgo)},` +
    `"transmission_sig":${JSON.stringify(headers.transmissionSig)},` +
    `"webhook_id":${JSON.stringify(config.webhookId)},` +
    `"webhook_event":${rawBody}}`;

  const response = await fetch(`${config.apiBase}/v1/notifications/verify-webhook-signature`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body,
    cache: "no-store",
  });
  if (!response.ok) return false;
  const result = (await response.json()) as { verification_status?: string };
  return result.verification_status === "SUCCESS";
}

export interface PayPalSubscriptionDetails {
  id?: string;
  status?: string;
  plan_id?: string;
}

export async function fetchPayPalSubscription(
  subscriptionId: string,
  config: PayPalSubscriptionConfig
): Promise<PayPalSubscriptionDetails> {
  if (!config.clientId || !config.secret) {
    throw new Error("PayPal server credentials are missing.");
  }

  const tokenResponse = await fetch(`${config.apiBase}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${config.clientId}:${config.secret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });

  if (!tokenResponse.ok) {
    throw new Error("PayPal access token request failed.");
  }

  const tokenPayload = (await tokenResponse.json()) as { access_token?: string };
  if (!tokenPayload.access_token) {
    throw new Error("PayPal access token was missing.");
  }

  const subscriptionResponse = await fetch(
    `${config.apiBase}/v1/billing/subscriptions/${encodeURIComponent(subscriptionId)}`,
    {
      headers: {
        Authorization: `Bearer ${tokenPayload.access_token}`,
      },
      cache: "no-store",
    }
  );

  if (!subscriptionResponse.ok) {
    throw new Error("PayPal subscription lookup failed.");
  }

  return (await subscriptionResponse.json()) as PayPalSubscriptionDetails;
}
