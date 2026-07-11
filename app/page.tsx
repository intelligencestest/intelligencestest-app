import { getLocale } from "next-intl/server";
import { DecisionOSHome } from "@/components/public/DecisionOSHome";
import { localePath, toAppLocale } from "@/lib/i18n/locales";
import { getPublicCopy } from "@/lib/public-site-copy";

export default async function Home() {
  const locale = toAppLocale(await getLocale());
  const publicCopy = getPublicCopy(locale);

  return (
    <DecisionOSHome
      locale={locale}
      homeHref={localePath("/", locale)}
      loginHref={localePath("/login", locale)}
      demoHref={localePath("/contact", locale)}
      sampleHref="#candidate-brief"
      publicCopy={publicCopy}
    />
  );
}
