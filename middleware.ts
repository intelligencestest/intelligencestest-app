import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED = [
  "/dashboard",
  "/projects",
  "/candidates",
  "/assessments",
  "/reports",
  "/settings",
  "/onboarding",
];

// Authenticated users visiting these are bounced to /dashboard
const AUTH_PAGES = ["/login", "/signup"];

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED.some((p) => pathname === p || pathname.startsWith(p + "/"));
  const isAuthPage = AUTH_PAGES.some((p) => pathname === p);

  if (isProtected && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthPage && user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  // Exclude static assets, API routes, test routes, and the OAuth callback
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/|test/|auth/callback).*)"],
};
