import { sendAuthEmail } from "@/lib/auth-email";
import { createAdminClient } from "@/lib/supabase-server";
import { toAppLocale } from "@/lib/i18n/locales";
import { NextRequest, NextResponse } from "next/server";

const APP_URL = "https://app.intelligencestest.com";

export async function POST(request: NextRequest) {
  const { email, language } = await request.json();
  const normalizedEmail = String(email ?? "").toLowerCase().trim();

  if (!normalizedEmail || !normalizedEmail.includes("@")) {
    return NextResponse.json({ error: "A valid email address is required" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("users")
    .select("full_name, company_id, companies(language)")
    .eq("email", normalizedEmail)
    .maybeSingle();

  // Avoid account enumeration. If the user does not exist, respond as if the email was sent.
  if (!profile) {
    return NextResponse.json({ success: true });
  }

  const profileCompany = Array.isArray(profile.companies) ? profile.companies[0] : profile.companies;
  const locale = language === "es" || language === "en" ? language : toAppLocale(profileCompany?.language);

  const { data, error } = await admin.auth.admin.generateLink({
    type: "recovery",
    email: normalizedEmail,
    options: {
      redirectTo: `${APP_URL}/auth/callback?next=/reset-password`,
    },
  });

  if (error || !data?.properties?.action_link) {
    return NextResponse.json(
      { error: error?.message ?? "Could not create reset link" },
      { status: 500 }
    );
  }

  const result = await sendAuthEmail({
    kind: "recovery",
    locale,
    to: normalizedEmail,
    name: profile.full_name,
    actionUrl: data.properties.action_link,
  });

  if (result.error) {
    return NextResponse.json(
      { error: `Could not send reset email: ${result.error.message}` },
      { status: 502 }
    );
  }

  return NextResponse.json({ success: true });
}
