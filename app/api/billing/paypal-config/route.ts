import { NextResponse } from "next/server";

type PayPalPlan = "starter" | "professional";
type PayPalMode = "sandbox" | "live";

const SANDBOX_FALLBACK_CLIENT_ID =
  "AZRoQBDWp8KkLLLRl1z-9nttyd0OMEexEIA18Df1Vww6mbA-Z-eDnrbvKFS_uhW6hOVOtJN8mkFHzUhi";
const SANDBOX_FALLBACK_PLANS: Record<PayPalPlan, string> = {
  starter: "P-7NP11014340475318NJGPO4A",
  professional: "P-3UG84991X17673328NJGPSZI",
};

function readEnv(...names: string[]) {
  for (const name of names) {
    const value = process.env[name]?.trim();
    if (value) return value;
  }
  return null;
}

function getPayPalMode(): PayPalMode {
  const mode = process.env.PAYPAL_MODE?.trim().toLowerCase();
  return mode === "live" || mode === "production" ? "live" : "sandbox";
}

export async function GET() {
  const mode = getPayPalMode();
  const clientId =
    mode === "live"
      ? readEnv("NEXT_PUBLIC_PAYPAL_CLIENT_ID", "PAYPAL_CLIENT_ID", "PAYPAL_SANDBOX_CLIENT_ID")
      : readEnv("NEXT_PUBLIC_PAYPAL_CLIENT_ID", "PAYPAL_SANDBOX_CLIENT_ID", "PAYPAL_CLIENT_ID") ??
        SANDBOX_FALLBACK_CLIENT_ID;
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
  const missing = [
    !clientId ? (mode === "live" ? "PAYPAL_CLIENT_ID" : "PAYPAL_SANDBOX_CLIENT_ID") : null,
    !plans.starter ? "PAYPAL_STARTER_PLAN_ID" : null,
    !plans.professional ? "PAYPAL_PROFESSIONAL_PLAN_ID" : null,
  ].filter((value): value is string => Boolean(value));

  return NextResponse.json(
    {
      clientId,
      mode,
      configured: missing.length === 0,
      missing,
      plans,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
