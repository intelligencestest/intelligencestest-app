import { NextResponse } from "next/server";

const STARTER_PLAN_ID = "P-7NP11014340475318NJGPO4A";
const PROFESSIONAL_PLAN_ID = "P-3UG84991X17673328NJGPSZI";

export async function GET() {
  const clientId =
    process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ??
    process.env.PAYPAL_SANDBOX_CLIENT_ID ??
    process.env.PAYPAL_CLIENT_ID ??
    null;

  return NextResponse.json(
    {
      clientId,
      plans: {
        starter: process.env.NEXT_PUBLIC_PAYPAL_STARTER_PLAN_ID ?? process.env.PAYPAL_STARTER_PLAN_ID ?? STARTER_PLAN_ID,
        professional:
          process.env.NEXT_PUBLIC_PAYPAL_PROFESSIONAL_PLAN_ID ??
          process.env.PAYPAL_PROFESSIONAL_PLAN_ID ??
          PROFESSIONAL_PLAN_ID,
      },
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
