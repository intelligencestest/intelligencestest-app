import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

// Brand hygiene only (browser tabs, bookmarks, shared previews) — the app is
// the product experience; SEO lives on the WordPress site. Spanish-first,
// resolved through the existing locale system.
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const es = locale !== "en";
  return {
    title: es
      ? "IntelligencesTest – Plataforma de Evaluación Humana"
      : "IntelligencesTest – Human Assessment Platform",
    description: es
      ? "Evaluaciones psicométricas y cognitivas para decisiones de contratación con evidencia."
      : "Psychometric and cognitive assessments for evidence-based hiring decisions.",
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
