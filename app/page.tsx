import Link from "next/link";
import { getLocale } from "next-intl/server";
import { PublicFooter, PublicHeader, SignalBoard } from "@/components/public/PublicSite";
import { toAppLocale } from "@/lib/i18n/locales";
import { getPublicCopy } from "@/lib/public-site-copy";

export default async function Home() {
  const locale = toAppLocale(await getLocale());
  const copy = getPublicCopy(locale);

  return (
    <main className="min-h-screen bg-[#07080F] text-slate-100">
      <PublicHeader copy={copy} />

      <section className="relative overflow-hidden border-b border-[#1E2240]">
        <div className="absolute inset-0 bg-[#07080F]" aria-hidden="true" />
        <div className="absolute inset-y-10 right-[-120px] hidden w-[640px] opacity-55 lg:block" aria-hidden="true">
          <SignalBoard copy={copy} />
        </div>
        <div className="absolute inset-x-0 bottom-0 h-32 bg-[#07080F]/80" aria-hidden="true" />
        <div className="relative mx-auto flex min-h-[78vh] max-w-7xl items-center px-5 py-20 sm:px-6 lg:px-8 lg:py-24">
          <div className="max-w-3xl">
            <p className="mb-5 inline-flex rounded-full border border-[#1E2240] bg-[#0D1020] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#8CB1FF]">
              {copy.home.eyebrow}
            </p>
            <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
              {copy.home.heroTitle}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              {copy.home.heroBody}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/demo"
                className="inline-flex items-center justify-center rounded-lg bg-[#1D4ED8] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1e40af] focus:outline-none focus:ring-2 focus:ring-[#8CB1FF]/70"
              >
                {copy.home.primaryCta}
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-lg border border-[#1E2240] bg-[#0D1020] px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-[#1D4ED8]/70 focus:outline-none focus:ring-2 focus:ring-[#8CB1FF]/60"
              >
                {copy.home.secondaryCta}
              </Link>
            </div>
            <dl className="mt-10 grid max-w-2xl grid-cols-3 gap-3">
              {copy.home.stats.map((stat) => (
                <div key={stat.label} className="rounded-lg border border-[#1E2240] bg-[#0D1020]/88 p-4">
                  <dt className="text-2xl font-semibold text-white">{stat.value}</dt>
                  <dd className="mt-1 text-xs leading-5 text-slate-400">{stat.label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section id="features" className="border-b border-[#1E2240] bg-[#0A0C16] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#8CB1FF]">{copy.home.featuresEyebrow}</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{copy.home.featuresTitle}</h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {copy.home.features.map((feature) => (
              <article key={feature.title} className="rounded-lg border border-[#1E2240] bg-[#0D1020] p-5">
                <div className="mb-5 flex h-9 w-9 items-center justify-center rounded-lg border border-[#1D4ED8]/35 bg-[#1D4ED8]/12 text-sm font-semibold text-[#8CB1FF]">
                  {feature.index}
                </div>
                <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-400">{feature.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="assessments" className="border-b border-[#1E2240] py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#8CB1FF]">{copy.home.assessmentsEyebrow}</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{copy.home.assessmentsTitle}</h2>
            <p className="mt-4 text-base leading-7 text-slate-400">{copy.home.assessmentsBody}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {copy.home.assessmentGroups.map((group) => (
              <div key={group.title} className="rounded-lg border border-[#1E2240] bg-[#0D1020] p-5">
                <p className="text-sm font-semibold text-white">{group.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">{group.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="border-b border-[#1E2240] bg-[#0A0C16] py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-5 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#8CB1FF]">{copy.home.faqEyebrow}</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{copy.home.faqTitle}</h2>
          <div className="mt-8 divide-y divide-[#1E2240] rounded-lg border border-[#1E2240] bg-[#0D1020]">
            {copy.home.faq.map((item) => (
              <details key={item.question} className="group p-5 open:bg-[#11162A]">
                <summary className="cursor-pointer list-none text-base font-semibold text-white focus:outline-none focus:ring-2 focus:ring-[#8CB1FF]/50">
                  {item.question}
                </summary>
                <p className="mt-3 text-sm leading-6 text-slate-400">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-5 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">{copy.home.finalTitle}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-400">{copy.home.finalBody}</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/demo" className="inline-flex items-center justify-center rounded-lg bg-[#1D4ED8] px-5 py-3 text-sm font-semibold text-white hover:bg-[#1e40af]">
              {copy.home.primaryCta}
            </Link>
            <Link href="/contact" className="inline-flex items-center justify-center rounded-lg border border-[#1E2240] bg-[#0D1020] px-5 py-3 text-sm font-semibold text-white hover:border-[#1D4ED8]/70">
              {copy.nav.contact}
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter copy={copy} />
    </main>
  );
}
