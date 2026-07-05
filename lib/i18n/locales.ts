export const SUPPORTED_LOCALES = ["en", "es"] as const;
export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: AppLocale = "en";
export const LANGUAGE_COOKIE = "lang";

// Spanish lives under an /es URL prefix; English is the unprefixed default.
// The prefix is the source of truth for the entry screens and keeps Spanish
// workspaces visibly under /es as they navigate (see proxy.ts). This header is
// how the proxy tells the render layer which locale a prefixed request forces.
export const LOCALE_HEADER = "x-app-locale";
export const LOCALE_PREFIX = "/es";
export const LANGUAGE_OVERRIDE_COOKIE = "lang_explicit";
export const LANGUAGE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
export const LANGUAGE_STORAGE_KEY = "intelligencestest.lang";
export const LANGUAGE_OVERRIDE_STORAGE_KEY = "intelligencestest.langExplicit";

export function isAppLocale(value: unknown): value is AppLocale {
  return value === "en" || value === "es";
}

export function toAppLocale(value: unknown, fallback: AppLocale = DEFAULT_LOCALE): AppLocale {
  return isAppLocale(value) ? value : fallback;
}

// Prefix a SaaS path with /es for Spanish; English paths stay unprefixed.
// Idempotent, so it is safe to feed an already-prefixed path back through it.
export function localePath(path: string, locale: AppLocale): string {
  if (locale !== "es") return path;
  if (path === "/es" || path.startsWith("/es/")) return path;
  if (path === "/") return LOCALE_PREFIX;
  return `${LOCALE_PREFIX}${path}`;
}

// Strip the /es prefix to recover the logical (unprefixed) path the app routes on.
export function stripLocalePrefix(pathname: string): string {
  if (pathname === LOCALE_PREFIX) return "/";
  if (pathname.startsWith(`${LOCALE_PREFIX}/`)) return pathname.slice(LOCALE_PREFIX.length);
  return pathname;
}

export function hasLocalePrefix(pathname: string): boolean {
  return pathname === LOCALE_PREFIX || pathname.startsWith(`${LOCALE_PREFIX}/`);
}

export function detectLocaleFromHeader(acceptLanguage: string | null | undefined): AppLocale {
  const languages = (acceptLanguage ?? "")
    .toLowerCase()
    .split(",")
    .map((part) => part.trim());

  if (languages.some((part) => part === "es" || part.startsWith("es-"))) {
    return "es";
  }

  return DEFAULT_LOCALE;
}
