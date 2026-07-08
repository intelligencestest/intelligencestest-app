import Link from "next/link";
import { getLocale } from "next-intl/server";
import { ArrowRight, BarChart3, Brain, ChevronDown, Compass, FolderKanban, Languages, Mail, Wrench } from "lucide-react";
import { PublicFooter, PublicHeader, SignalBoard } from "@/components/public/PublicSite";
import { localePath, toAppLocale } from "@/lib/i18n/locales";
import { getPublicCopy } from "@/lib/public-site-copy";

const FEATURE_ICONS = [FolderKanban, Mail, BarChart3, Languages] as const;
const ASSESSMENT_ICONS = [Brain, Compass, BarChart3, Wrench] as const;

export default async function Home() {
  const locale = toAppLocale(await getLocale());
  const copy = getPublicCopy(locale);

  return (
    <main className="min-h-screen bg-black text-zinc-100">
      <PublicHeader copy={copy} />

      {/* Hero — no glow, no gradient text, no grid overlay. Restraint is the point. */}
      <section className="border-b border-white/10">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 py-24 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-32">
          <div className="animate-fade-up">
            <p className="mb-7 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
              <span className="h-1.5 w-1.5 rounded-full bg-[#3B82F6]" aria-hidden="true" />
              {copy.home.eyebrow}
            </p>
            <h1 className="max-w-2xl text-[2.75rem] font-semibold leading-[1.05] tracking-[-0.035em] text-white sm:text-6xl lg:text-[4.2rem]">
              {copy.home.heroTitle}
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-zinc-400">
              {copy.home.heroBody}
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href={localePath("/signup", locale)}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-6 py-3.5 text-sm font-semibold text-black transition-colors hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-white/40"
              >
                {copy.home.primaryCta}
                <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
              </Link>
              <Link
                href={`${localePath("/", locale)}#assessments`}
                className="inline-flex items-center justify-center rounded-md border border-white/15 px-6 py-3.5 text-sm font-semibold text-zinc-200 transition-colors hover:border-white/30 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/20"
              >
                {copy.home.secondaryCta}
              </Link>
            </div>
            <dl className="mt-14 flex max-w-xl divide-x divide-white/10 border-t border-white/10 pt-7">
              {copy.home.stats.map((stat, i) => (
                <div key={stat.label} className={i === 0 ? "pr-8" : "px-8"}>
                  <dt className="text-2xl font-semibold tracking-[-0.02em] text-white">{stat.value}</dt>
                  <dd className="mt-1 text-[13px] leading-5 text-zinc-500">{stat.label}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="hidden lg:block">
            <SignalBoard copy={copy} />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="scroll-mt-20 border-b border-white/10 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">{copy.home.featuresEyebrow}</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-white sm:text-4xl">{copy.home.featuresTitle}</h2>
          </div>
          <div className="mt-14 grid gap-px overflow-hidden rounded-lg border border-white/10 bg-white/10 md:grid-cols-2 lg:grid-cols-4">
            {copy.home.features.map((feature, i) => {
              const Icon = FEATURE_ICONS[i] ?? FEATURE_ICONS[0];
              return (
                <article
                  key={feature.title}
                  className="bg-black p-6 transition-colors duration-200 hover:bg-[#0A0A0A]"
                >
                  <div className="mb-6 flex h-9 w-9 items-center justify-center rounded-md border border-white/15 text-zinc-300">
                    <Icon className="h-[17px] w-[17px]" strokeWidth={1.6} aria-hidden="true" />
                  </div>
                  <h3 className="text-[15px] font-semibold text-white">{feature.title}</h3>
                  <p className="mt-2.5 text-sm leading-6 text-zinc-500">{feature.body}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Assessments */}
      <section id="assessments" className="scroll-mt-20 border-b border-white/10 py-24 sm:py-32">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:px-8">
          <div className="lg:sticky lg:top-24">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">{copy.home.assessmentsEyebrow}</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-white sm:text-4xl">{copy.home.assessmentsTitle}</h2>
            <p className="mt-5 text-base leading-7 text-zinc-400">{copy.home.assessmentsBody}</p>
            <Link
              href={localePath("/signup", locale)}
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-white transition-colors hover:text-zinc-300"
            >
              {copy.home.primaryCta}
              <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            </Link>
          </div>
          <div className="grid gap-px overflow-hidden rounded-lg border border-white/10 bg-white/10 sm:grid-cols-2">
            {copy.home.assessmentGroups.map((group, i) => {
              const Icon = ASSESSMENT_ICONS[i] ?? ASSESSMENT_ICONS[0];
              return (
                <div key={group.title} className="bg-black p-6 transition-colors duration-200 hover:bg-[#0A0A0A]">
                  <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-md border border-white/15 text-zinc-300">
                    <Icon className="h-4 w-4" strokeWidth={1.6} aria-hidden="true" />
                  </div>
                  <p className="text-[15px] font-semibold text-white">{group.title}</p>
                  <p className="mt-2 text-sm leading-6 text-zinc-500">{group.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-20 border-b border-white/10 py-24 sm:py-32">
        <div className="mx-auto max-w-3xl px-5 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">{copy.home.faqEyebrow}</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-white sm:text-4xl">{copy.home.faqTitle}</h2>
          </div>
          <div className="mt-10 divide-y divide-white/10 rounded-lg border border-white/10">
            {copy.home.faq.map((item) => (
              <details key={item.question} className="group px-6 py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-semibold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 [&::-webkit-details-marker]:hidden">
                  {item.question}
                  <ChevronDown
                    className="h-4 w-4 flex-shrink-0 text-zinc-500 transition-transform duration-200 group-open:rotate-180"
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                </summary>
                <p className="mt-3 pr-8 text-sm leading-7 text-zinc-400">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA — plain bordered panel, no radial glow ring */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-5xl px-5 sm:px-6 lg:px-8">
          <div className="rounded-lg border border-white/10 bg-[#0A0A0A] px-6 py-16 text-center sm:px-16">
            <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-[-0.02em] text-white sm:text-4xl">
              {copy.home.finalTitle}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-zinc-400">{copy.home.finalBody}</p>
            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href={localePath("/signup", locale)}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-6 py-3.5 text-sm font-semibold text-black transition-colors hover:bg-zinc-200"
              >
                {copy.home.primaryCta}
                <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
              </Link>
              <Link
                href={localePath("/contact", locale)}
                className="inline-flex items-center justify-center rounded-md border border-white/15 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:border-white/30"
              >
                {copy.nav.contact}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter copy={copy} />
    </main>
  );
}
