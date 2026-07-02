import { getLocale } from "next-intl/server";
import { LegalLayout } from "@/components/public/PublicSite";
import { toAppLocale } from "@/lib/i18n/locales";
import { getPublicCopy } from "@/lib/public-site-copy";

export default async function CookiesPage() {
  const locale = toAppLocale(await getLocale());
  const copy = getPublicCopy(locale);
  return <LegalLayout copy={copy} title={copy.legal.cookiesTitle} intro={copy.legal.cookiesIntro} sections={copy.legal.cookies} />;
}
