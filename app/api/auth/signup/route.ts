import { createAdminClient } from "@/lib/supabase-server";
import { sendAuthEmail } from "@/lib/auth-email";
import { toAppLocale } from "@/lib/i18n/locales";
import { NextRequest, NextResponse } from "next/server";

const APP_URL = "https://app.intelligencestest.com";

export async function POST(request: NextRequest) {
  const { email, password, full_name, company_name, language } = await request.json();

  if (!email || !password || !full_name || !company_name) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  const lang = toAppLocale(language);
  const normalizedEmail = email.toLowerCase().trim();

  const admin = createAdminClient();

  // Guard: check if email already registered
  const { data: existing } = await admin
    .from("users")
    .select("id")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
  }

  // 1. Create company
  const { data: company, error: companyError } = await admin
    .from("companies")
    .insert({ name: company_name, email: normalizedEmail, language: lang })
    .select("id")
    .single();

  if (companyError || !company) {
    return NextResponse.json({ error: "Failed to create company" }, { status: 500 });
  }

  // 2. Generate Supabase signup link, then send it through Resend.
  // The Admin API creates the auth user here but does not rely on Supabase's built-in email delivery.
  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: "signup",
    email: normalizedEmail,
    password,
    options: {
      data: { full_name, company_id: company.id },
      redirectTo: `${APP_URL}/auth/callback?next=/dashboard`,
    },
  });

  if (linkError || !linkData?.user || !linkData.properties?.action_link) {
    await admin.from("companies").delete().eq("id", company.id);
    return NextResponse.json(
      { error: linkError?.message ?? "Failed to create account" },
      { status: 400 }
    );
  }

  // 3. Create users row linking auth user → company
  const { error: userRowError } = await admin.from("users").insert({
    id: linkData.user.id,
    company_id: company.id,
    full_name,
    email: normalizedEmail,
    role: "admin",
  });

  if (userRowError) {
    await admin.auth.admin.deleteUser(linkData.user.id);
    await admin.from("companies").delete().eq("id", company.id);
    return NextResponse.json({ error: "Failed to link account" }, { status: 500 });
  }

  const emailResult = await sendAuthEmail({
    kind: "confirmation",
    locale: lang,
    to: normalizedEmail,
    name: full_name,
    actionUrl: linkData.properties.action_link,
  });

  if (emailResult.error) {
    await admin.auth.admin.deleteUser(linkData.user.id);
    await admin.from("companies").delete().eq("id", company.id);
    return NextResponse.json(
      { error: `Failed to send confirmation email: ${emailResult.error.message}` },
      { status: 502 }
    );
  }

  return NextResponse.json({ success: true });
}
