export const SUPPORTED_LOCALES = ["en", "es"] as const;
export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: AppLocale = "es";
export const LANGUAGE_COOKIE = "lang";
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
