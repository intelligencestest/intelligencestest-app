import Link from "next/link";
import { Check } from "lucide-react";
import { getLocale } from "next-intl/server";
import { PublicFooter, PublicHeader } from "@/components/public/PublicSite";
import { localePath, toAppLocale } from "@/lib/i18n/locales";
import { getPublicCopy } from "@/lib/public-site-copy";

export default async function PricingPage() {
  const locale = toAppLocale(await getLocale());
  const copy = getPublicCopy(locale);
  const p = copy.pricing;

  return (
    <main className="min-h-screen bg-[#07080F] text-slate-100">
      <PublicHeader copy={copy} />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[#1E2240]">
        <div className="hero-glow absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto max-w-3xl px-5 py-16 text-center sm:px-6 lg:px-8 lg:py-20">
          <p className="animate-fade-up mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-[#1E2240] bg-[#0D1020]/80 px-3.5 py-1.5 text-xs font-medium text-[#9BB8FF]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#6B9FFF]" aria-hidden="true" />
            {p.eyebrow}
          </p>
          <h1 className="headline-gradient animate-fade-up text-[2.4rem] font-semibold leading-[1.1] tracking-tight sm:text-5xl">
            {p.title}
          </h1>
          <p className="animate-fade-up mt-5 text-lg leading-8 text-slate-400">{p.body}</p>
        </div>
      </section>

      {/* Plan comparison grid */}
      <section className="border-b border-[#1E2240] bg-[#0A0C16] py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:items-stretch">
            {p.plans.map((plan) => (
              <article
                key={plan.id}
                className={`group relative flex flex-col overflow-hidden rounded-2xl border p-6 transition-colors duration-200 ${
                  plan.highlighted
                    ? "border-[#1D4ED8]/50 bg-[#0D1020]"
                    : "border-[#1E2240] bg-[#0D1020] hover:border-[#2d3a70]"
                }`}
              >
                <div
                  className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#1D4ED8]/50 to-transparent transition-opacity duration-300 ${
                    plan.highlighted ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  }`}
                  aria-hidden="true"
                />
                {plan.highlighted && (
                  <span className="mb-4 inline-flex w-fit items-center rounded-full border border-[#1D4ED8]/40 bg-[#1D4ED8]/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9BB8FF]">
                    {p.highlightLabel}
                  </span>
                )}
                <h3 className="text-[15px] font-semibold text-white">{plan.name}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-semibold tabular-nums tracking-tight text-white">{plan.price}</span>
                  {plan.priceSuffix && <span className="text-sm text-slate-500">{plan.priceSuffix}</span>}
                </div>
                <p className="mt-2.5 text-sm leading-6 text-slate-400">{plan.description}</p>

                <ul className="mt-6 space-y-2.5 border-t border-[#1E2240] pt-6 text-sm text-slate-300">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#8CB1FF]" strokeWidth={2} aria-hidden="true" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto pt-6">
                  <Link
                    href={localePath(plan.ctaHref, locale)}
                    className={`inline-flex h-11 w-full items-center justify-center rounded-xl px-4 text-sm font-semibold transition ${
                      plan.highlighted
                        ? "bg-[#1D4ED8] text-white shadow-[0_0_24px_rgba(29,78,216,0.35)] hover:bg-[#1e40af]"
                        : "border border-[#1E2240] text-slate-200 hover:border-[#2d3a70] hover:text-white"
                    }`}
                  >
                    {plan.ctaLabel}
                  </Link>
                </div>
              </article>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-slate-500">{p.billedNote}</p>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-b border-[#1E2240] py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-5 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-[13px] font-semibold text-[#8CB1FF]">{p.faqEyebrow}</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{p.faqTitle}</h2>
          </div>
          <div className="mt-10 space-y-3">
            {p.faq.map((item) => (
              <details key={item.question} className="group rounded-2xl border border-[#1E2240] bg-[#0D1020] px-6 py-5 open:border-[#2d3a70]">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-semibold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8CB1FF]/50 [&::-webkit-details-marker]:hidden">
                  {item.question}
                  <svg
                    className="h-4 w-4 flex-shrink-0 text-slate-500 transition-transform duration-200 group-open:rotate-180"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
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
              <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                {p.finalTitle}
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-400">{p.finalBody}</p>
              <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  href={localePath("/contact", locale)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1D4ED8] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_0_40px_rgba(29,78,216,0.4)] transition hover:bg-[#1e40af]"
                >
                  {copy.nav.contact}
                </Link>
                <Link
                  href={localePath("/signup", locale)}
                  className="inline-flex items-center justify-center rounded-xl border border-[#1E2240] bg-[#07080F]/60 px-6 py-3.5 text-sm font-semibold text-white transition hover:border-[#2d3a70]"
                >
                  {copy.home.primaryCta}
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
