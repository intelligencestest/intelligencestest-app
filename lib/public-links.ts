import type { AppLocale } from "@/lib/i18n/locales";

const CONTENT_SITE = "https://intelligencestest.com";

const spanishContent = {
  methodology: "/es/metodologia/",
  scientificFoundations: "/es/fundamentos-cientificos/",
  privacy: "/es/politica-de-privacidad/",
  terms: "/es/terminos-de-uso/",
};

const englishContent = {
  methodology: "/methodology/",
  scientificFoundations: "/scientific-foundations/",
  privacy: "/privacy-policy/",
  terms: "/terms-of-use/",
};

export type PublicContentKey = keyof typeof spanishContent;

export function publicContentUrl(key: PublicContentKey, locale: AppLocale) {
  const paths = locale === "es" ? spanishContent : englishContent;
  return `${CONTENT_SITE}${paths[key]}`;
}
