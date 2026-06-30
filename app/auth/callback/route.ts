import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=no_code", origin));
  }

  // Create the redirect response first so we can write session cookies to it.
  // Route Handlers must write cookies to the Response object, NOT to the
  // next/headers cookie store (which is request-scoped and read-only here).
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
          // Write the session tokens onto the response that the browser will receive
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

    // Password-reset flow — forgot-password sets next=/reset-password
    if (next === "/reset-password") {
      response.headers.set("Location", new URL("/reset-password", origin).toString());
      return response;
    }

    // New Google OAuth users won't have a users row yet — send them to onboarding
    const admin = createAdminClient();
    const { data: userRow } = await admin
      .from("users")
      .select("company_id")
      .eq("id", data.user.id)
      .maybeSingle();

    const destination = userRow?.company_id ? next : "/onboarding";
    response.headers.set("Location", new URL(destination, origin).toString());
    return response;

  } catch (err) {
    console.error("[auth/callback] unexpected error:", err);
    return NextResponse.redirect(new URL("/login?error=server_error", origin));
  }
}
