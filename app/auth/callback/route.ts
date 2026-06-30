import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=no_code", origin));
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(new URL("/login?error=auth_failed", origin));
  }

  // Password-reset recovery flow — next is set to /reset-password by the forgot-password page
  if (next === "/reset-password") {
    return NextResponse.redirect(new URL("/reset-password", origin));
  }

  // Check if this user has a company linked (new Google OAuth users won't)
  const admin = createAdminClient();
  const { data: userRow } = await admin
    .from("users")
    .select("company_id")
    .eq("id", data.user.id)
    .maybeSingle();

  if (!userRow?.company_id) {
    return NextResponse.redirect(new URL("/onboarding", origin));
  }

  return NextResponse.redirect(new URL(next, origin));
}
