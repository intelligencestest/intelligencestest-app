import { NextResponse } from "next/server";
import { getPayPalSubscriptionConfig } from "@/lib/billing/paypal";

export async function GET() {
  const { clientId, missingCheckout, mode, plans } = getPayPalSubscriptionConfig();

  return NextResponse.json(
    {
      clientId,
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
