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
  const missingCheckout = [
    !clientId ? (mode === "live" ? "PAYPAL_CLIENT_ID" : "PAYPAL_SANDBOX_CLIENT_ID") : null,
    !plans.starter ? "PAYPAL_STARTER_PLAN_ID" : null,
    !plans.professional ? "PAYPAL_PROFESSIONAL_PLAN_ID" : null,
  ].filter((value): value is string => Boolean(value));
  const missingServer = [
    ...missingCheckout,
    !secret ? (mode === "live" ? "PAYPAL_SECRET" : "PAYPAL_SANDBOX_SECRET") : null,
  ].filter((value): value is string => Boolean(value));

  return { mode, apiBase, clientId, secret, plans, missingCheckout, missingServer };
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
