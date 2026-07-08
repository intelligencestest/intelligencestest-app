import type { Metadata } from "next";
import { Geist, Geist_Mono, PT_Serif, Space_Grotesk, Space_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
// Verdant Sky theme (public marketing site only) — the CSS variables are
// declared globally here (idiomatic next/font pattern), but they only take
// effect where .theme-verdant-sky switches --font-sans/serif/mono to
// reference them (see app/globals.css). The dashboard stays on Geist.
const spaceGrotesk = Space_Grotesk({ variable: "--font-space-grotesk", subsets: ["latin"] });
const ptSerif = PT_Serif({ variable: "--font-pt-serif", subsets: ["latin"], weight: ["400", "700"] });
const spaceMono = Space_Mono({ variable: "--font-space-mono", subsets: ["latin"], weight: ["400", "700"] });

export const metadata: Metadata = {
  title: "Intelligences Test – Human Assessment Platform",
  description: "AI-powered human assessment platform for smarter hiring decisions.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} ${ptSerif.variable} ${spaceMono.variable} h-full`}>
      <body className="h-full bg-[#07080F] text-slate-200 antialiased">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
