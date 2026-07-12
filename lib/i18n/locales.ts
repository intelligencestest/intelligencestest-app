export const SUPPORTED_LOCALES = ["en", "es", "fr"] as const;
export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: AppLocale = "en";
export const LANGUAGE_COOKIE = "lang";

// Non-English locales each live under their own URL prefix; English is the
// unprefixed default. The prefix is the source of truth for the entry screens
// and keeps prefixed workspaces visibly under that prefix as they navigate
// (see proxy.ts). This header is how the proxy tells the render layer which
// locale a prefixed request forces.
export const LOCALE_HEADER = "x-app-locale";
export const LOCALE_PREFIXES: Partial<Record<AppLocale, string>> = {
  es: "/es",
  fr: "/fr",
};
export const LANGUAGE_OVERRIDE_COOKIE = "lang_explicit";
export const LANGUAGE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
export const LANGUAGE_STORAGE_KEY = "intelligencestest.lang";
export const LANGUAGE_OVERRIDE_STORAGE_KEY = "intelligencestest.langExplicit";

export function isAppLocale(value: unknown): value is AppLocale {
  return typeof value === "string" && (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

export function toAppLocale(value: unknown, fallback: AppLocale = DEFAULT_LOCALE): AppLocale {
  return isAppLocale(value) ? value : fallback;
}

// Prefix a SaaS path for a non-English locale; English paths stay unprefixed.
// Idempotent, so it is safe to feed an already-prefixed path back through it.
export function localePath(path: string, locale: AppLocale): string {
  const prefix = LOCALE_PREFIXES[locale];
  if (!prefix) return path;
  if (path === prefix || path.startsWith(`${prefix}/`)) return path;
  if (path === "/") return prefix;
  return `${prefix}${path}`;
}

// Which known prefix (if any) a pathname starts with, and the locale it maps to.
function matchLocalePrefix(pathname: string): { locale: AppLocale; prefix: string } | null {
  for (const [locale, prefix] of Object.entries(LOCALE_PREFIXES) as [AppLocale, string][]) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      return { locale, prefix };
    }
  }
  return null;
}

// Strip any known locale prefix to recover the logical (unprefixed) path the app routes on.
export function stripLocalePrefix(pathname: string): string {
  const match = matchLocalePrefix(pathname);
  if (!match) return pathname;
  if (pathname === match.prefix) return "/";
  return pathname.slice(match.prefix.length);
}

export function hasLocalePrefix(pathname: string): boolean {
  return matchLocalePrefix(pathname) !== null;
}

// Which locale (if any) a prefixed pathname forces. Null means the request is
// unprefixed and does not force a locale by itself.
export function localeFromPrefix(pathname: string): AppLocale | null {
  return matchLocalePrefix(pathname)?.locale ?? null;
}

export function detectLocaleFromHeader(acceptLanguage: string | null | undefined): AppLocale {
  const languages = (acceptLanguage ?? "")
    .toLowerCase()
    .split(",")
    .map((part) => part.trim());

  if (languages.some((part) => part === "fr" || part.startsWith("fr-"))) {
    return "fr";
  }

  if (languages.some((part) => part === "es" || part.startsWith("es-"))) {
    return "es";
  }

  return DEFAULT_LOCALE;
}
