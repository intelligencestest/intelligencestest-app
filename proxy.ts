import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  DEFAULT_LOCALE,
  LANGUAGE_COOKIE,
  LANGUAGE_COOKIE_MAX_AGE,
  LOCALE_HEADER,
  LOCALE_PREFIX,
  hasLocalePrefix,
  isAppLocale,
  stripLocalePrefix,
  type AppLocale,
} from "@/lib/i18n/locales";

const PROTECTED = [
  "/dashboard",
  "/inbox",
  "/projects",
  "/candidates",
  "/assessments",
  "/reports",
  "/settings",
  "/onboarding",
];

// Authenticated users visiting these are bounced to the dashboard.
const AUTH_PAGES = ["/login", "/signup"];

// Unprefixed public entry pages that must render in English regardless of any
// stale cookie, mirroring how /es forces Spanish. Their Spanish counterparts
// are reached via the /es prefix instead.
const ENGLISH_ENTRY = ["/login", "/signup", "/forgot-password", "/reset-password", "/verify-email"];

export async function proxy(request: NextRequest) {
  const rawPathname = request.nextUrl.pathname;
  const underEs = hasLocalePrefix(rawPathname);
  // The path the app actually routes on, with any /es prefix removed.
  const logicalPath = stripLocalePrefix(rawPathname);
  const prefix = underEs ? LOCALE_PREFIX : "";

  // A forced locale means the URL — not the cookie — decides the language for
  // this request: es under /es, en on the English entry pages.
  let forcedLocale: AppLocale | null = null;
  if (underEs) {
    forcedLocale = "es";
  } else if (ENGLISH_ENTRY.includes(logicalPath)) {
    forcedLocale = "en";
  }

  // Spanish is the default public experience: the bare homepage redirects to
  // /es unless the visitor carries an explicit English signal (lang=en cookie,
  // set by the English entry pages or an English workspace). DEFAULT_LOCALE
  // stays "en" so the many toAppLocale fallbacks keep their behavior.
  if (!underEs && logicalPath === "/") {
    const cookieLang = request.cookies.get(LANGUAGE_COOKIE)?.value;
    if (cookieLang !== "en") {
      return withLocaleCookie(NextResponse.redirect(new URL(LOCALE_PREFIX, request.url)), "es", request);
    }
  }

  // Downstream signal for i18n/request.ts. Cloned so we can also carry any auth
  // cookies Supabase refreshes below.
  const requestHeaders = new Headers(request.headers);
  if (forcedLocale) {
    requestHeaders.set(LOCALE_HEADER, forcedLocale);
    // Keep the cookie in step so signup reads the right language and later
    // unprefixed requests stay consistent.
    request.cookies.set(LANGUAGE_COOKIE, forcedLocale);
  }

  const buildResponse = () => {
    if (underEs) {
      const url = request.nextUrl.clone();
      url.pathname = logicalPath;
      return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
    }
    return NextResponse.next({ request: { headers: requestHeaders } });
  };

  let response = buildResponse();

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
          // Rebuild so the refreshed auth cookies (now on request) propagate.
          response = buildResponse();
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const isProtected = PROTECTED.some(
    (p) => logicalPath === p || logicalPath.startsWith(p + "/")
  );
  const isAuthPage = AUTH_PAGES.some((p) => logicalPath === p);
  const isHome = logicalPath === "/";
  const cookieLocale = request.cookies.get(LANGUAGE_COOKIE)?.value;

  if (isHome && user) {
    const target = request.nextUrl.clone();
    const dashboardPrefix = underEs || cookieLocale === "es" ? LOCALE_PREFIX : "";
    target.pathname = `${dashboardPrefix}/dashboard`;
    return withLocaleCookie(NextResponse.redirect(target), forcedLocale, request);
  }

  // Canonicalize Spanish workspaces onto the /es prefix. The lang cookie is a
  // cache of company.language, so an authenticated Spanish user who lands on an
  // unprefixed in-app route (e.g. a deep link that omitted the prefix) is sent
  // to its /es form — keeping the whole app visibly under /es. English (the
  // default) is never redirected.
  if (!underEs && isProtected && user && cookieLocale === "es") {
    const target = request.nextUrl.clone();
    target.pathname = `${LOCALE_PREFIX}${logicalPath}`;
    return NextResponse.redirect(target);
  }

  if (isProtected && !user) {
    return withLocaleCookie(NextResponse.redirect(new URL(`${prefix}/login`, request.url)), forcedLocale, request);
  }

  if (isAuthPage && user) {
    return withLocaleCookie(NextResponse.redirect(new URL(`${prefix}/dashboard`, request.url)), forcedLocale, request);
  }

  return withLocaleCookie(response, forcedLocale, request);
}

// Persist the language cookie: the forced locale on prefixed/entry requests, or
// the product default for anonymous visitors that have no valid cookie yet.
// Browser language never decides it.
function withLocaleCookie(
  response: NextResponse,
  forcedLocale: AppLocale | null,
  request: NextRequest
) {
  const value = forcedLocale ?? (isAppLocale(request.cookies.get(LANGUAGE_COOKIE)?.value)
    ? undefined
    : DEFAULT_LOCALE);

  if (value) {
    response.cookies.set(LANGUAGE_COOKIE, value, {
      path: "/",
      sameSite: "lax",
      maxAge: LANGUAGE_COOKIE_MAX_AGE,
    });
  }

  return response;
}

export const config = {
  // Exclude static assets, API routes, test routes, and the OAuth callback
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/|test/|auth/callback).*)"],
};
