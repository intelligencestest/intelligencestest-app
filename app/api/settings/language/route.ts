import { createAdminClient, createServerSupabaseClient } from "@/lib/supabase-server";
import { LANGUAGE_COOKIE, LANGUAGE_COOKIE_MAX_AGE, toAppLocale } from "@/lib/i18n/locales";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { language } = await request.json();
  const lang = toAppLocale(language);
  const admin = createAdminClient();

  const { data: userRow } = await admin
    .from("users")
    .select("company_id")
    .eq("id", user.id)
    .maybeSingle();

  if (!userRow?.company_id) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }

  const { error } = await admin
    .from("companies")
    .update({ language: lang })
    .eq("id", userRow.company_id);

  if (error) {
    return NextResponse.json({ error: "Failed to update language" }, { status: 500 });
  }

  const response = NextResponse.json({ success: true, language: lang });
  response.cookies.set(LANGUAGE_COOKIE, lang, {
    path: "/",
    sameSite: "lax",
    maxAge: LANGUAGE_COOKIE_MAX_AGE,
  });
  return response;
}
