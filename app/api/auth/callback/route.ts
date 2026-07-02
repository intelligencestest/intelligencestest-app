import { createServerSupabaseClient } from "@/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";
import {
  LANGUAGE_COOKIE,
  LANGUAGE_COOKIE_MAX_AGE,
  detectLocaleFromHeader,
  isAppLocale,
} from "@/lib/i18n/locales";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  const response = NextResponse.redirect(`${origin}/dashboard`);
  const cookieLocale = request.cookies.get(LANGUAGE_COOKIE)?.value;
  response.cookies.set(
    LANGUAGE_COOKIE,
    isAppLocale(cookieLocale) ? cookieLocale : detectLocaleFromHeader(request.headers.get("accept-language")),
    {
      path: "/",
      sameSite: "lax",
      maxAge: LANGUAGE_COOKIE_MAX_AGE,
    }
  );

  return response;
}
