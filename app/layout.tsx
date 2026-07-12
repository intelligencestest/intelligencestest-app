import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { appUrl, getAppUrl } from "@/lib/app-url";
import { localePath, toAppLocale } from "@/lib/i18n/locales";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

// Brand hygiene only (browser tabs, bookmarks, shared previews) — the app is
// the product experience; SEO lives on the WordPress site. Spanish-first,
// resolved through the existing locale system.
export async function generateMetadata(): Promise<Metadata> {
  const locale = toAppLocale(await getLocale());
  const es = locale === "es";
  const title = es
    ? "IntelligencesTest - Sistema de Soporte a Decisiones de Contratación"
    : "IntelligencesTest - Hiring Decision Support System";
  const description = es
    ? "Plataforma de evaluación psicométrica que ayuda a los equipos de RR. HH. a tomar decisiones de contratación informadas con supervisión humana."
    : "Psychometric assessment platform that helps HR teams make informed hiring decisions with human oversight.";
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
      },
    },
    openGraph: {
      type: "website",
      locale: es ? "es_ES" : "en_US",
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
