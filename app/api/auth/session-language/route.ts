import { createAdminClient, createServerSupabaseClient } from "@/lib/supabase-server";
import {
  DEFAULT_LOCALE,
  LANGUAGE_COOKIE,
  LANGUAGE_COOKIE_MAX_AGE,
  toAppLocale,
} from "@/lib/i18n/locales";
import { NextResponse } from "next/server";

export async function POST() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: userRow } = await admin
    .from("users")
    .select("company_id")
    .eq("id", user.id)
    .maybeSingle();

  let language = DEFAULT_LOCALE;

  if (userRow?.company_id) {
    const { data: company } = await admin
      .from("companies")
      .select("language")
      .eq("id", userRow.company_id)
      .maybeSingle();

    language = toAppLocale(company?.language);
  }

  const response = NextResponse.json({ success: true, language });
  response.cookies.set(LANGUAGE_COOKIE, language, {
    path: "/",
    sameSite: "lax",
    maxAge: LANGUAGE_COOKIE_MAX_AGE,
  });

  return response;
}
