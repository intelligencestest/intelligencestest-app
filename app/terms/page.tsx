import { getLocale } from "next-intl/server";
import { LegalLayout } from "@/components/public/PublicSite";
import { toAppLocale } from "@/lib/i18n/locales";
import { getPublicCopy } from "@/lib/public-site-copy";

export default async function TermsPage() {
  const locale = toAppLocale(await getLocale());
  const copy = getPublicCopy(locale);
  return <LegalLayout copy={copy} title={copy.legal.termsTitle} intro={copy.legal.termsIntro} sections={copy.legal.terms} />;
}
