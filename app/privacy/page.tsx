import { getLocale } from "next-intl/server";
import { LegalLayout } from "@/components/public/PublicSite";
import { toAppLocale } from "@/lib/i18n/locales";
import { getPublicCopy } from "@/lib/public-site-copy";

export default async function PrivacyPage() {
  const locale = toAppLocale(await getLocale());
  const copy = getPublicCopy(locale);
  return <LegalLayout copy={copy} title={copy.legal.privacyTitle} intro={copy.legal.privacyIntro} sections={copy.legal.privacy} />;
}
