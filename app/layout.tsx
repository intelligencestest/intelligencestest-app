import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { appUrl, getAppUrl } from "@/lib/app-url";
import { localePath, toAppLocale, type AppLocale } from "@/lib/i18n/locales";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

// Brand hygiene only (browser tabs, bookmarks, shared previews) — the app is
// the product experience; SEO lives on the WordPress site. Spanish-first,
// resolved through the existing locale system.
const METADATA_BY_LOCALE: Record<AppLocale, { title: string; description: string; ogLocale: string }> = {
  es: {
    title: "IntelligencesTest - Sistema de Soporte a Decisiones de Contratación",
    description:
      "Plataforma de evaluación psicométrica que ayuda a los equipos de RR. HH. a tomar decisiones de contratación informadas con supervisión humana.",
    ogLocale: "es_ES",
  },
  en: {
    title: "IntelligencesTest - Hiring Decision Support System",
    description: "Psychometric assessment platform that helps HR teams make informed hiring decisions with human oversight.",
    ogLocale: "en_US",
  },
  fr: {
    title: "IntelligencesTest - Aide à la décision de recrutement",
    description:
      "IntelligencesTest aide les cabinets de recrutement à comparer les candidats avant de les présenter au client, avec supervision humaine.",
    ogLocale: "fr_FR",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = toAppLocale(await getLocale());
  const { title, description, ogLocale } = METADATA_BY_LOCALE[locale];
  const pathname = localePath("/", locale);

  return {
    metadataBase: new URL(getAppUrl()),
    applicationName: "IntelligencesTest",
    title,
    description,
    alternates: {
      canonical: pathname,
      languages: {
        es: "/es",
        en: "/",
        fr: "/fr",
      },
    },
    openGraph: {
      type: "website",
      locale: ogLocale,
      url: appUrl(pathname),
      siteName: "IntelligencesTest",
      title,
      description,
    },
    icons: {
      icon: "/brand/intelligences-test-logo.png",
      apple: "/brand/intelligences-test-logo.png",
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="h-full bg-[#f8fafc] text-slate-200 antialiased">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
