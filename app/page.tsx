import Link from "next/link";
import { getLocale } from "next-intl/server";
import { ArrowRight, BarChart3, Brain, ChevronDown, Compass, FolderKanban, Languages, Mail, Wrench } from "lucide-react";
import { MarketingHero } from "@/components/public/MarketingHero";
import { PublicFooter, PublicHeader } from "@/components/public/PublicSite";
import { localePath, toAppLocale } from "@/lib/i18n/locales";
import { getPublicCopy } from "@/lib/public-site-copy";

const FEATURE_ICONS = [FolderKanban, Mail, BarChart3, Languages] as const;
const ASSESSMENT_ICONS = [Brain, Compass, BarChart3, Wrench] as const;

export default async function Home() {
  const locale = toAppLocale(await getLocale());
  const copy = getPublicCopy(locale);

  return (
    <main className="theme-verdant-sky min-h-screen bg-background text-foreground">
      <PublicHeader copy={copy} />

      <MarketingHero copy={copy} locale={locale} />

      {/* How it works — real product flow, not filler. Ties the abstract
          pitch above to what actually happens after signup. */}
      <section className="border-t border-border bg-secondary/40 py-24 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{copy.home.howItWorksEyebrow}</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl">{copy.home.howItWorksTitle}</h2>
          </div>
          <div className="relative mt-14 grid gap-10 sm:grid-cols-3">
            <div className="absolute top-5 left-0 right-0 hidden h-px bg-border sm:block" aria-hidden="true" />
            {copy.home.howItWorksSteps.map((step, i) => (
              <div key={step.title} className="relative">
                <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-sm font-semibold text-primary">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <h3 className="mt-5 text-[15px] font-semibold text-foreground">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="scroll-mt-24 border-t border-border py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{copy.home.featuresEyebrow}</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl">{copy.home.featuresTitle}</h2>
          </div>
          <div className="mt-14 grid gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-2 lg:grid-cols-4">
            {copy.home.features.map((feature, i) => {
              const Icon = FEATURE_ICONS[i] ?? FEATURE_ICONS[0];
              return (
                <article
                  key={feature.title}
                  className="bg-background p-6 transition-colors duration-200 hover:bg-secondary/40"
                >
                  <div className="mb-6 flex h-9 w-9 items-center justify-center rounded-md border border-primary/25 bg-primary/[0.08] text-primary">
                    <Icon className="h-[17px] w-[17px]" strokeWidth={1.6} aria-hidden="true" />
                  </div>
                  <h3 className="text-[15px] font-semibold text-foreground">{feature.title}</h3>
                  <p className="mt-2.5 text-sm leading-6 text-muted-foreground">{feature.body}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Assessments */}
      <section id="assessments" className="scroll-mt-24 border-t border-border bg-secondary/40 py-24 sm:py-32">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:px-8">
          <div className="lg:sticky lg:top-24">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{copy.home.assessmentsEyebrow}</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl">{copy.home.assessmentsTitle}</h2>
            <p className="mt-5 text-base leading-7 text-muted-foreground">{copy.home.assessmentsBody}</p>
            <Link
              href={localePath("/signup", locale)}
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-foreground transition-colors hover:text-primary"
            >
              {copy.home.primaryCta}
              <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            </Link>
          </div>
          <div className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2">
            {copy.home.assessmentGroups.map((group, i) => {
              const Icon = ASSESSMENT_ICONS[i] ?? ASSESSMENT_ICONS[0];
              return (
                <div key={group.title} className="bg-background p-6 transition-colors duration-200 hover:bg-secondary/40">
                  <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-md border border-primary/25 bg-primary/[0.08] text-primary">
                    <Icon className="h-4 w-4" strokeWidth={1.6} aria-hidden="true" />
                  </div>
                  <p className="text-[15px] font-semibold text-foreground">{group.title}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{group.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-24 border-t border-border py-24 sm:py-32">
        <div className="mx-auto max-w-3xl px-5 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{copy.home.faqEyebrow}</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl">{copy.home.faqTitle}</h2>
          </div>
          <div className="mt-10 divide-y divide-border rounded-lg border border-border">
            {copy.home.faq.map((item) => (
              <details key={item.question} className="group px-6 py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-semibold text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 [&::-webkit-details-marker]:hidden">
                  {item.question}
                  <ChevronDown
                    className="h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                </summary>
                <p className="mt-3 pr-8 text-sm leading-7 text-muted-foreground">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden border-t border-border py-24 sm:py-32">
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[820px] -translate-x-1/2 -z-10 rounded-full opacity-[0.10] blur-[140px]"
          style={{ background: "radial-gradient(circle, var(--color-primary), transparent 70%)" }}
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-5xl px-5 sm:px-6 lg:px-8">
          <div className="rounded-lg border border-border bg-card px-6 py-16 text-center sm:px-16">
            <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl">
              {copy.home.finalTitle}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-muted-foreground">{copy.home.finalBody}</p>
            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href={localePath("/signup", locale)}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {copy.home.primaryCta}
                <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
              </Link>
              <Link
                href={localePath("/contact", locale)}
                className="inline-flex items-center justify-center rounded-md border border-border px-6 py-3.5 text-sm font-semibold text-foreground transition-colors hover:border-primary/40"
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
