import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";
import {
  LANGUAGE_COOKIE,
  LANGUAGE_COOKIE_MAX_AGE,
  LANGUAGE_OVERRIDE_COOKIE,
  toAppLocale,
} from "@/lib/i18n/locales";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  // Behind a reverse proxy (Nginx → Node on localhost:3000), request.url has
  // the wrong host. Reconstruct the public origin from forwarded headers, with
  // NEXT_PUBLIC_SITE_URL as the explicit override and request.url as last resort.
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const fwdHost = request.headers.get("x-forwarded-host");
  const fwdProto = request.headers.get("x-forwarded-proto") ?? "https";
  const origin =
    siteUrl ??
    (fwdHost ? `${fwdProto}://${fwdHost}` : new URL(request.url).origin);

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=no_code", origin));
  }

  const response = NextResponse.redirect(new URL(next, origin));

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  try {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error || !data.user) {
      console.error("[auth/callback] exchangeCodeForSession error:", error?.message);
      return NextResponse.redirect(new URL("/login?error=auth_failed", origin));
    }

    if (next === "/reset-password") {
      response.headers.set("Location", new URL("/reset-password", origin).toString());
      return response;
    }

    const admin = createAdminClient();
    const { data: userRow } = await admin
      .from("users")
      .select("company_id")
      .eq("id", data.user.id)
      .maybeSingle();

    const destination = userRow?.company_id ? next : "/onboarding";

    // Workspace language is the single source of truth: the lang cookie is
    // only a cache of company.language, and personal overrides are cleared.
    let nextLocale = toAppLocale(request.cookies.get(LANGUAGE_COOKIE)?.value);

    if (userRow?.company_id) {
      const { data: company } = await admin
        .from("companies")
        .select("language")
        .eq("id", userRow.company_id)
        .single();
      nextLocale = toAppLocale(company?.language);
    }

    response.cookies.set(LANGUAGE_COOKIE, nextLocale, {
      path: "/",
      sameSite: "lax",
      maxAge: LANGUAGE_COOKIE_MAX_AGE,
    });
    response.cookies.set(LANGUAGE_OVERRIDE_COOKIE, "", { path: "/", maxAge: 0 });

    response.headers.set("Location", new URL(destination, origin).toString());
    return response;

  } catch (err) {
    console.error("[auth/callback] unexpected error:", err);
    return NextResponse.redirect(new URL("/login?error=server_error", origin));
  }
}
