import { NextRequest, NextResponse } from "next/server";
import { getPayPalSubscriptionConfig, normalizePayPalCurrency } from "@/lib/billing/paypal";

export async function GET(request: NextRequest) {
  const requestedCurrency = normalizePayPalCurrency(request.nextUrl.searchParams.get("currency"));
  const { clientId, currency, missingCheckout, mode, plans } = getPayPalSubscriptionConfig(requestedCurrency);

  return NextResponse.json(
    {
      clientId,
      currency,
      mode,
      configured: missingCheckout.length === 0,
      missing: missingCheckout,
      plans,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
