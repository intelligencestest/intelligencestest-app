import { getLocale } from "next-intl/server";
import { DecisionOSHome } from "@/components/public/DecisionOSHome";
import { appUrl } from "@/lib/app-url";
import { localePath, toAppLocale, type AppLocale } from "@/lib/i18n/locales";
import { publicContentUrl } from "@/lib/public-links";
import { getPublicCopy } from "@/lib/public-site-copy";

const productDefinition = {
  es: "Plataforma de evaluación psicométrica que ayuda a los equipos de RR. HH. a tomar decisiones de contratación informadas con supervisión humana, no selección automática.",
  en: "Psychometric assessment platform that helps HR teams make informed hiring decisions with human oversight, not automated selection.",
  fr: "Plateforme d'évaluation psychométrique qui aide les cabinets de recrutement à comparer les candidats avant l'entretien avec supervision humaine, sans sélection automatique.",
} as const;

const inLanguageByLocale: Record<AppLocale, string> = {
  es: "es-ES",
  en: "en-US",
  fr: "fr-FR",
};

const offerDescriptionByLocale: Record<AppLocale, string> = {
  es: "Prueba gratuita y demo para equipos de RR. HH.",
  en: "Free trial and demo for HR teams.",
  fr: "Testez gratuitement votre prochaine short-list — jusqu'à 10 candidats.",
};

function softwareApplicationSchema(locale: AppLocale) {
  const appPath = localePath("/", locale);

  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "IntelligencesTest",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: appUrl(appPath),
    inLanguage: inLanguageByLocale[locale],
    description: productDefinition[locale],
    publisher: {
      "@type": "Organization",
      name: "IntelligencesTest",
      url: "https://intelligencestest.com/",
    },
    isBasedOn: [
      publicContentUrl("methodology", locale),
      publicContentUrl("scientificFoundations", locale),
    ],
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      price: "0",
      priceCurrency: "USD",
      description: offerDescriptionByLocale[locale],
      url: appUrl(localePath("/signup", locale)),
    },
  };
}

export default async function Home() {
  const locale = toAppLocale(await getLocale());
  const publicCopy = getPublicCopy(locale);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema(locale)) }}
      />
      <DecisionOSHome
        locale={locale}
        homeHref={localePath("/", locale)}
        loginHref={localePath("/login", locale)}
        demoHref={localePath("/contact", locale)}
        sampleHref="#candidate-brief"
        publicCopy={publicCopy}
      />
    </>
  );
}
