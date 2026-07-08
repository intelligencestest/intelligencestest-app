import Link from "next/link";
import { getLocale } from "next-intl/server";
import { localePath, toAppLocale } from "@/lib/i18n/locales";
import type { PublicCopy } from "@/lib/public-site-copy";

function BrandMark() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex h-9 w-9 items-center justify-center rounded-md bg-[#1D4ED8]" aria-hidden="true">
        <div className="absolute h-3.5 w-3.5 rotate-45 rounded-[2px] border border-white/85" />
        <div className="absolute mt-1.5 h-3.5 w-3.5 rotate-45 rounded-[2px] border border-white/60" />
        <div className="absolute -mt-1.5 h-3.5 w-3.5 rotate-45 rounded-[2px] border border-white" />
      </div>
      <div>
        <p className="text-sm font-semibold leading-5 text-white">Intelligences Test</p>
        <p className="text-xs leading-4 text-zinc-500">Assessment Platform</p>
      </div>
    </div>
  );
}

export async function PublicHeader({ copy }: { copy: PublicCopy }) {
  // Keep Spanish visitors under /es so their entry language carries into signup.
  const locale = toAppLocale(await getLocale());
  const home = localePath("/", locale);
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-black/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 sm:px-6 lg:px-8">
        <Link href={home} aria-label="Intelligences Test home">
          <BrandMark />
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-medium text-zinc-400 lg:flex" aria-label={copy.nav.primaryAria}>
          <a href={`${home}#features`} className="transition-colors hover:text-white">{copy.nav.features}</a>
          <a href={`${home}#assessments`} className="transition-colors hover:text-white">{copy.nav.assessments}</a>
          <a href={`${home}#faq`} className="transition-colors hover:text-white">{copy.nav.faq}</a>
          <Link href={localePath("/contact", locale)} className="transition-colors hover:text-white">{copy.nav.contact}</Link>
        </nav>
        <div className="flex items-center gap-2.5">
          <Link href={localePath("/login", locale)} className="hidden rounded-md px-3.5 py-2 text-sm font-medium text-zinc-300 transition-colors hover:text-white sm:inline-flex">
            {copy.nav.login}
          </Link>
          <Link href={localePath("/signup", locale)} className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-zinc-200">
            {copy.nav.demo}
          </Link>
        </div>
      </div>
    </header>
  );
}

export async function PublicFooter({ copy }: { copy: PublicCopy }) {
  const locale = toAppLocale(await getLocale());
  return (
    <footer className="border-t border-white/10 bg-black">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-6 md:grid-cols-[1fr_1fr] lg:grid-cols-[1.2fr_0.8fr_0.8fr] lg:px-8">
        <div>
          <BrandMark />
          <p className="mt-4 max-w-md text-sm leading-6 text-zinc-500">{copy.footer.body}</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{copy.footer.product}</p>
          <ul className="mt-4 space-y-3 text-sm text-zinc-500">
            <li><Link href={localePath("/signup", locale)} className="transition-colors hover:text-white">{copy.nav.signup}</Link></li>
            <li><Link href={localePath("/login", locale)} className="transition-colors hover:text-white">{copy.nav.login}</Link></li>
            <li><Link href={localePath("/contact", locale)} className="transition-colors hover:text-white">{copy.nav.contact}</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{copy.footer.legal}</p>
          <ul className="mt-4 space-y-3 text-sm text-zinc-500">
            <li><Link href="/privacy" className="transition-colors hover:text-white">{copy.legal.privacyTitle}</Link></li>
            <li><Link href="/terms" className="transition-colors hover:text-white">{copy.legal.termsTitle}</Link></li>
            <li><Link href="/cookies" className="transition-colors hover:text-white">{copy.legal.cookiesTitle}</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 px-5 py-5 text-center text-xs text-zinc-600">
        {copy.footer.rights}
      </div>
    </footer>
  );
}

export function SignalBoard({ copy }: { copy: PublicCopy }) {
  return (
    <div className="relative mx-auto w-full max-w-xl" aria-label={copy.home.boardAria}>
      <div className="rounded-lg border border-white/10 bg-[#0A0A0A] p-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <p className="text-sm font-semibold text-white">{copy.home.boardTitle}</p>
            <p className="mt-1 text-xs text-zinc-500">{copy.home.boardSubtitle}</p>
          </div>
          <span className="rounded-full border border-white/15 px-3 py-1 text-xs font-medium text-zinc-400">Live</span>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {copy.home.boardStats.map((stat) => (
            <div key={stat.label} className="rounded-md border border-white/10 bg-black p-3">
              <p className="text-xl font-semibold text-white">{stat.value}</p>
              <p className="mt-1 text-xs leading-5 text-zinc-500">{stat.label}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-3">
          {copy.home.boardRows.map((row) => (
            <div key={row.title} className="rounded-md border border-white/10 bg-black p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-white">{row.title}</p>
                  <p className="mt-1 text-xs leading-5 text-zinc-500">{row.body}</p>
                </div>
                <span className="rounded-full border border-white/15 px-2.5 py-1 text-xs font-medium text-zinc-300">
                  {row.badge}
                </span>
              </div>
              <div className="mt-4 flex h-1.5 overflow-hidden rounded-full bg-white/10">
                {row.bars.map((bar, index) => (
                  <div key={`${row.title}-${index}`} className={bar.className} style={{ flex: bar.flex }} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Competency evidence — emphasis-form bar chart: one accent bar (the
            standout signal), the rest de-emphasized gray. Real product logic,
            not decoration. */}
        <div className="mt-4 rounded-md border border-white/10 bg-black p-4">
          <p className="mb-3.5 text-xs font-semibold uppercase tracking-[0.1em] text-zinc-500">{copy.home.competencyTitle}</p>
          <div className="space-y-2.5">
            {copy.home.competencyItems.map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <span className={`w-[108px] flex-shrink-0 truncate text-xs ${item.emphasis ? "font-medium text-white" : "text-zinc-400"}`}>
                  {item.label}
                </span>
                <span className="relative h-2 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                  <span
                    className={`absolute inset-y-0 left-0 rounded-full ${item.emphasis ? "bg-[#3B82F6]" : "bg-zinc-600"}`}
                    style={{ width: `${item.score}%` }}
                  />
                </span>
                <span className="w-6 flex-shrink-0 text-right text-xs font-semibold tabular-nums text-zinc-300">
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
    <main className="min-h-screen bg-black text-slate-100">
      <PublicHeader copy={copy} />
      <section className="mx-auto max-w-4xl px-5 py-16 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-500">{copy.legal.eyebrow}</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.02em] text-white sm:text-5xl">{title}</h1>
        <p className="mt-5 text-base leading-7 text-zinc-400">{intro}</p>
        <div className="mt-10 space-y-5">
          {sections.map((section) => (
            <section key={section.title} className="rounded-lg border border-white/10 bg-[#0A0A0A] p-6">
              <h2 className="text-xl font-semibold text-white">{section.title}</h2>
              <div className="mt-4 space-y-3 text-sm leading-7 text-zinc-400">
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
