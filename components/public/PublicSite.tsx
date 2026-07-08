"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { localePath, toAppLocale } from "@/lib/i18n/locales";
import type { PublicCopy } from "@/lib/public-site-copy";

function BrandMark() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-primary" aria-hidden="true">
        <div className="absolute h-3 w-3 rotate-45 rounded-[2px] border border-primary-foreground/85" />
        <div className="absolute mt-1.5 h-3 w-3 rotate-45 rounded-[2px] border border-primary-foreground/60" />
        <div className="absolute -mt-1.5 h-3 w-3 rotate-45 rounded-[2px] border border-primary-foreground" />
      </div>
      <span className="text-[15px] font-semibold text-foreground">Intelligences Test</span>
    </div>
  );
}

export function PublicHeader({ copy }: { copy: PublicCopy }) {
  const locale = toAppLocale(useLocale());
  const home = localePath("/", locale);

  const anchorLinks = [
    { href: `${home}#features`, label: copy.nav.features },
    { href: `${home}#assessments`, label: copy.nav.assessments },
    { href: `${home}#faq`, label: copy.nav.faq },
  ];

  return (
    <div className="theme-verdant-sky sticky top-0 z-40">
      <div className="mx-auto max-w-5xl px-4 pt-4">
        <nav className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-2 shadow-lg shadow-black/20" aria-label={copy.nav.primaryAria}>
          <Link href={home} aria-label="Intelligences Test home">
            <BrandMark />
          </Link>
          <div className="hidden items-center gap-6 md:flex">
            {anchorLinks.map((link) => (
              <a key={link.href} href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                {link.label}
              </a>
            ))}
            <Link href={localePath("/contact", locale)} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              {copy.nav.contact}
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Separator orientation="vertical" className="hidden h-6 md:block" />
            <Button asChild variant="ghost" className="hidden h-8 px-3 text-sm font-normal text-muted-foreground hover:text-foreground md:inline-flex">
              <Link href={localePath("/login", locale)}>{copy.nav.login}</Link>
            </Button>
            <Button asChild className="hidden h-8 rounded-full px-4 text-sm font-medium md:inline-flex">
              <Link href={localePath("/signup", locale)}>{copy.nav.demo}</Link>
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 md:hidden">
                  <Menu className="h-4 w-4" />
                  <span className="sr-only">{copy.nav.primaryAria}</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="theme-verdant-sky w-[260px]">
                <nav className="mt-10 flex flex-col gap-5">
                  {anchorLinks.map((link) => (
                    <a key={link.href} href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                      {link.label}
                    </a>
                  ))}
                  <Link href={localePath("/contact", locale)} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {copy.nav.contact}
                  </Link>
                  <Separator />
                  <Link href={localePath("/login", locale)} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {copy.nav.login}
                  </Link>
                  <Button asChild className="rounded-full">
                    <Link href={localePath("/signup", locale)}>{copy.nav.demo}</Link>
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </div>
    </div>
  );
}

export function PublicFooter({ copy }: { copy: PublicCopy }) {
  const locale = toAppLocale(useLocale());
  return (
    <footer className="theme-verdant-sky border-t border-border bg-background">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-6 md:grid-cols-[1fr_1fr] lg:grid-cols-[1.2fr_0.8fr_0.8fr] lg:px-8">
        <div>
          <BrandMark />
          <p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground">{copy.footer.body}</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{copy.footer.product}</p>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li><Link href={localePath("/signup", locale)} className="transition-colors hover:text-foreground">{copy.nav.signup}</Link></li>
            <li><Link href={localePath("/login", locale)} className="transition-colors hover:text-foreground">{copy.nav.login}</Link></li>
            <li><Link href={localePath("/contact", locale)} className="transition-colors hover:text-foreground">{copy.nav.contact}</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{copy.footer.legal}</p>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li><Link href="/privacy" className="transition-colors hover:text-foreground">{copy.legal.privacyTitle}</Link></li>
            <li><Link href="/terms" className="transition-colors hover:text-foreground">{copy.legal.termsTitle}</Link></li>
            <li><Link href="/cookies" className="transition-colors hover:text-foreground">{copy.legal.cookiesTitle}</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border px-5 py-5 text-center text-xs text-muted-foreground/70">
        {copy.footer.rights}
      </div>
    </footer>
  );
}

export function SignalBoard({ copy }: { copy: PublicCopy }) {
  return (
    <div className="relative mx-auto w-full max-w-xl" aria-label={copy.home.boardAria}>
      <div className="rounded-lg border border-border bg-card p-4 shadow-2xl shadow-black/30">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <p className="text-sm font-semibold text-foreground">{copy.home.boardTitle}</p>
            <p className="mt-1 text-xs text-muted-foreground">{copy.home.boardSubtitle}</p>
          </div>
          <span className="rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground">Live</span>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {copy.home.boardStats.map((stat) => (
            <div key={stat.label} className="rounded-md border border-border bg-background p-3">
              <p className="text-xl font-semibold text-foreground">{stat.value}</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-3">
          {copy.home.boardRows.map((row) => (
            <div key={row.title} className="rounded-md border border-border bg-background p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-foreground">{row.title}</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{row.body}</p>
                </div>
                <span className="rounded-full border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground">
                  {row.badge}
                </span>
              </div>
              <div className="mt-4 flex h-1.5 overflow-hidden rounded-full bg-muted">
                {row.bars.map((bar, index) => (
                  <div key={`${row.title}-${index}`} className={bar.className} style={{ flex: bar.flex }} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Competency evidence — emphasis-form bar chart: one accent bar (the
            standout signal), the rest de-emphasized. Real product logic,
            not decoration. */}
        <div className="mt-4 rounded-md border border-border bg-background p-4">
          <p className="mb-3.5 text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">{copy.home.competencyTitle}</p>
          <div className="space-y-2.5">
            {copy.home.competencyItems.map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <span className={`w-[108px] flex-shrink-0 truncate text-xs ${item.emphasis ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                  {item.label}
                </span>
                <span className="relative h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <span
                    className={`absolute inset-y-0 left-0 rounded-full ${item.emphasis ? "bg-primary" : "bg-muted-foreground/40"}`}
                    style={{ width: `${item.score}%` }}
                  />
                </span>
                <span className="w-6 flex-shrink-0 text-right text-xs font-semibold tabular-nums text-muted-foreground">
                  {item.score}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function LegalLayout({ copy, title, intro, sections }: { copy: PublicCopy; title: string; intro: string; sections: Array<{ title: string; body: string[] }> }) {
  return (
    <main className="theme-verdant-sky min-h-screen bg-background text-foreground">
      <PublicHeader copy={copy} />
      <section className="mx-auto max-w-4xl px-5 py-16 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">{copy.legal.eyebrow}</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.02em] text-foreground sm:text-5xl">{title}</h1>
        <p className="mt-5 text-base leading-7 text-muted-foreground">{intro}</p>
        <div className="mt-10 space-y-5">
          {sections.map((section) => (
            <section key={section.title} className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-xl font-semibold text-foreground">{section.title}</h2>
              <div className="mt-4 space-y-3 text-sm leading-7 text-muted-foreground">
                {section.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </div>
            </section>
          ))}
        </div>
      </section>
      <PublicFooter copy={copy} />
    </main>
  );
}
