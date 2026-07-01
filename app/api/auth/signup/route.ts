import { createAdminClient } from "@/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { email, password, full_name, company_name, language } = await request.json();

  if (!email || !password || !full_name || !company_name) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  const lang = ["en", "es"].includes(language) ? language : "en";

  const admin = createAdminClient();

  // Guard: check if email already registered
  const { data: existing } = await admin
    .from("users")
    .select("id")
    .eq("email", email.toLowerCase())
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
  }

  // 1. Create company
  const { data: company, error: companyError } = await admin
    .from("companies")
    .insert({ name: company_name, email: email.toLowerCase(), language: lang })
    .select("id")
    .single();

  if (companyError || !company) {
    return NextResponse.json({ error: "Failed to create company" }, { status: 500 });
  }

  // 2. Create auth user — email_confirm:false sends a confirmation email
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email: email.toLowerCase(),
    password,
    email_confirm: false,
    user_metadata: { full_name, company_id: company.id },
  });

  if (authError || !authData.user) {
    await admin.from("companies").delete().eq("id", company.id);
    return NextResponse.json(
      { error: authError?.message ?? "Failed to create account" },
      { status: 400 }
    );
  }

  // 3. Create users row linking auth user → company
  const { error: userRowError } = await admin.from("users").insert({
    id: authData.user.id,
    company_id: company.id,
    full_name,
    email: email.toLowerCase(),
    role: "admin",
  });

  if (userRowError) {
    await admin.auth.admin.deleteUser(authData.user.id);
    await admin.from("companies").delete().eq("id", company.id);
    return NextResponse.json({ error: "Failed to link account" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
