import { getLocale } from "next-intl/server";
import { PublicFooter, PublicHeader } from "@/components/public/PublicSite";
import { toAppLocale } from "@/lib/i18n/locales";
import { getPublicCopy } from "@/lib/public-site-copy";
import ContactForm from "@/app/contact/ContactForm";

export default async function DemoPage() {
  const locale = toAppLocale(await getLocale());
  const copy = getPublicCopy(locale);

  return (
    <main className="min-h-screen bg-[#171614] text-slate-100">
      <PublicHeader copy={copy} />
      <section className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-6 lg:grid-cols-[0.82fr_1.18fr] lg:px-8 lg:py-20">
        <div>
          <p className="inline-flex rounded-full border border-[#2a2824] bg-[#1d1c19] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#a6b2cf]">
            {copy.contact.badge}
          </p>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white sm:text-5xl">{copy.contact.demoTitle}</h1>
          <p className="mt-5 text-base leading-7 text-slate-400">{copy.contact.demoBody}</p>
          <div className="mt-8 rounded-lg border border-[#2a2824] bg-[#1d1c19] p-5">
            <p className="text-sm font-semibold text-white">{copy.home.assessmentsTitle}</p>
            <p className="mt-2 text-sm leading-6 text-slate-400">{copy.contact.response}</p>
          </div>
        </div>
        <ContactForm copy={copy} kind="demo" locale={locale} />
      </section>
      <PublicFooter copy={copy} />
    </main>
  );
}
