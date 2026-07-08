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
    <main className="min-h-screen bg-[#07080F] text-slate-100">
      <PublicHeader copy={copy} />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[#1E2240]">
        <div className="hero-glow absolute inset-0" aria-hidden="true" />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage: "linear-gradient(rgba(30,34,64,0.55) 1px, transparent 1px), linear-gradient(90deg, rgba(30,34,64,0.55) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
            maskImage: "radial-gradient(ellipse 70% 60% at 50% 0%, black 30%, transparent 75%)",
            WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 0%, black 30%, transparent 75%)",
          }}
          aria-hidden="true"
        />
        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 py-20 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-28">
          <div className="animate-fade-up">
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#1E2240] bg-[#0D1020]/80 px-3.5 py-1.5 text-xs font-medium tracking-[0.01em] text-[#9BB8FF]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#6B9FFF]" aria-hidden="true" />
              {copy.home.eyebrow}
            </p>
            <h1 className="headline-gradient max-w-2xl text-[2.6rem] font-semibold leading-[1.08] tracking-[-0.02em] sm:text-5xl lg:text-[3.4rem]">
              {copy.home.heroTitle}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-400">
              {copy.home.heroBody}
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href={localePath("/signup", locale)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1D4ED8] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_0_40px_rgba(29,78,216,0.4)] transition hover:bg-[#1e40af] focus:outline-none focus:ring-2 focus:ring-[#8CB1FF]/70"
              >
                {copy.home.primaryCta}
                <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
              </Link>
              <Link
                href={`${localePath("/", locale)}#assessments`}
                className="inline-flex items-center justify-center rounded-xl border border-[#1E2240] bg-[#0D1020]/60 px-6 py-3.5 text-sm font-semibold text-slate-200 transition hover:border-[#2d3a70] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#8CB1FF]/60"
              >
                {copy.home.secondaryCta}
              </Link>
            </div>
            <dl className="mt-12 flex max-w-xl divide-x divide-[#1E2240] border-t border-[#1E2240] pt-6">
              {copy.home.stats.map((stat, i) => (
                <div key={stat.label} className={i === 0 ? "pr-8" : "px-8"}>
                  <dt className="text-2xl font-semibold tracking-tight text-white">{stat.value}</dt>
                  <dd className="mt-1 text-[13px] leading-5 text-slate-400">{stat.label}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="relative hidden lg:block" aria-hidden="false">
            <div className="absolute -inset-10 rounded-[40px] bg-[radial-gradient(ellipse_at_center,rgba(29,78,216,0.16),transparent_65%)]" aria-hidden="true" />
            <div className="gradient-ring relative rounded-2xl p-1.5">
              <SignalBoard copy={copy} />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="scroll-mt-20 border-b border-[#1E2240] bg-[#0A0C16] py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-[13px] font-semibold tracking-[0.01em] text-[#8CB1FF]">{copy.home.featuresEyebrow}</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.015em] text-white sm:text-4xl">{copy.home.featuresTitle}</h2>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {copy.home.features.map((feature, i) => {
              const Icon = FEATURE_ICONS[i] ?? FEATURE_ICONS[0];
              return (
                <article
                  key={feature.title}
                  className="group relative overflow-hidden rounded-2xl border border-[#1E2240] bg-[#0D1020] p-6 transition-colors duration-200 hover:border-[#1D4ED8]/40"
                >
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#1D4ED8]/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" aria-hidden="true" />
                  <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-xl border border-[#1D4ED8]/30 bg-[#1D4ED8]/10 text-[#8CB1FF] ring-1 ring-inset ring-white/5">
                    <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} aria-hidden="true" />
                  </div>
                  <h3 className="text-[17px] font-semibold text-white">{feature.title}</h3>
                  <p className="mt-2.5 text-sm leading-6 text-slate-400">{feature.body}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Assessments */}
      <section id="assessments" className="scroll-mt-20 border-b border-[#1E2240] py-20 sm:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:px-8">
          <div className="lg:sticky lg:top-24">
            <p className="text-[13px] font-semibold tracking-[0.01em] text-[#8CB1FF]">{copy.home.assessmentsEyebrow}</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.015em] text-white sm:text-4xl">{copy.home.assessmentsTitle}</h2>
            <p className="mt-5 text-base leading-7 text-slate-400">{copy.home.assessmentsBody}</p>
            <Link
              href={localePath("/signup", locale)}
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#8CB1FF] transition hover:text-white"
            >
              {copy.home.primaryCta}
              <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {copy.home.assessmentGroups.map((group, i) => {
              const Icon = ASSESSMENT_ICONS[i] ?? ASSESSMENT_ICONS[0];
              return (
                <div
                  key={group.title}
                  className="rounded-2xl border border-[#1E2240] bg-[#0D1020] p-6 transition-colors duration-200 hover:border-[#2d3a70]"
                >
                  <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg border border-[#1D4ED8]/25 bg-[#1D4ED8]/[0.08] text-[#8CB1FF]">
                    <Icon className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
                  </div>
                  <p className="text-[15px] font-semibold text-white">{group.title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{group.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-20 border-b border-[#1E2240] bg-[#0A0C16] py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-5 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-[13px] font-semibold tracking-[0.01em] text-[#8CB1FF]">{copy.home.faqEyebrow}</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.015em] text-white sm:text-4xl">{copy.home.faqTitle}</h2>
          </div>
          <div className="mt-10 space-y-3">
            {copy.home.faq.map((item) => (
              <details key={item.question} className="group rounded-2xl border border-[#1E2240] bg-[#0D1020] px-6 py-5 open:border-[#2d3a70]">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-semibold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8CB1FF]/50 [&::-webkit-details-marker]:hidden">
                  {item.question}
                  <ChevronDown
                    className="h-4 w-4 flex-shrink-0 text-slate-500 transition-transform duration-200 group-open:rotate-180"
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                </summary>
                <p className="mt-3 pr-8 text-sm leading-7 text-slate-400">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-5xl px-5 sm:px-6 lg:px-8">
          <div className="gradient-ring relative overflow-hidden rounded-3xl px-6 py-16 text-center sm:px-16">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_50%_-10%,rgba(29,78,216,0.28),transparent_70%)]" aria-hidden="true" />
            <div className="relative">
              <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-[-0.015em] text-white sm:text-4xl">
                {copy.home.finalTitle}
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-400">{copy.home.finalBody}</p>
              <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  href={localePath("/signup", locale)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1D4ED8] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_0_40px_rgba(29,78,216,0.4)] transition hover:bg-[#1e40af]"
                >
                  {copy.home.primaryCta}
                  <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                </Link>
                <Link
                  href={localePath("/contact", locale)}
                  className="inline-flex items-center justify-center rounded-xl border border-[#1E2240] bg-[#07080F]/60 px-6 py-3.5 text-sm font-semibold text-white transition hover:border-[#2d3a70]"
                >
                  {copy.nav.contact}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter copy={copy} />
    </main>
  );
}
