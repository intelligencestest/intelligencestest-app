import Link from "next/link";
import { getLocale } from "next-intl/server";
import { BrandLockup } from "@/components/brand/BrandLogo";
import { localePath, toAppLocale } from "@/lib/i18n/locales";
import type { PublicCopy } from "@/lib/public-site-copy";

function BrandMark() {
  return (
    <BrandLockup
      subtitle="Assessment Platform"
      markClassName="h-10 w-10 rounded-lg"
      titleClassName="leading-5"
      subtitleClassName="leading-4"
    />
  );
}

export async function PublicHeader({ copy }: { copy: PublicCopy }) {
  // Keep Spanish visitors under /es so their entry language carries into signup.
  const locale = toAppLocale(await getLocale());
  const home = localePath("/", locale);
  return (
    <header className="sticky top-0 z-40 border-b border-[#f3f4f6] bg-[#f8fafc]/92 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 sm:px-6 lg:px-8">
        <Link href={home} aria-label="Intelligences Test home">
          <BrandMark />
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-400 lg:flex" aria-label={copy.nav.primaryAria}>
          <a href={`${home}#features`} className="transition hover:text-[var(--it-text)]">{copy.nav.features}</a>
          <a href={`${home}#assessments`} className="transition hover:text-[var(--it-text)]">{copy.nav.assessments}</a>
          <a href={`${home}#faq`} className="transition hover:text-[var(--it-text)]">{copy.nav.faq}</a>
          <Link href={localePath("/contact", locale)} className="transition hover:text-[var(--it-text)]">{copy.nav.contact}</Link>
        </nav>
        <div className="flex items-center gap-2.5">
          <Link href={localePath("/login", locale)} className="hidden rounded-lg border border-[#f3f4f6] px-3.5 py-2 text-sm font-semibold text-slate-200 transition hover:border-[#d1d5db] hover:text-[var(--it-text)] sm:inline-flex">
            {copy.nav.login}
          </Link>
          <Link href={localePath("/signup", locale)} className="rounded-lg bg-[#4f46e5] px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#3730a3]">
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
    <footer className="border-t border-[#f3f4f6] bg-[#f8fafc]">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-10 sm:px-6 md:grid-cols-[1fr_1fr] lg:grid-cols-[1.2fr_0.8fr_0.8fr] lg:px-8">
        <div>
          <BrandMark />
          <p className="mt-4 max-w-md text-sm leading-6 text-slate-400">{copy.footer.body}</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-[var(--it-text)]">{copy.footer.product}</p>
          <ul className="mt-4 space-y-3 text-sm text-slate-400">
            <li><Link href={localePath("/signup", locale)} className="hover:text-[var(--it-text)]">{copy.nav.signup}</Link></li>
            <li><Link href={localePath("/login", locale)} className="hover:text-[var(--it-text)]">{copy.nav.login}</Link></li>
            <li><Link href={localePath("/contact", locale)} className="hover:text-[var(--it-text)]">{copy.nav.contact}</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-[var(--it-text)]">{copy.footer.legal}</p>
          <ul className="mt-4 space-y-3 text-sm text-slate-400">
            <li><Link href="/privacy" className="hover:text-[var(--it-text)]">{copy.legal.privacyTitle}</Link></li>
            <li><Link href="/terms" className="hover:text-[var(--it-text)]">{copy.legal.termsTitle}</Link></li>
            <li><Link href="/cookies" className="hover:text-[var(--it-text)]">{copy.legal.cookiesTitle}</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-[#f3f4f6] px-5 py-5 text-center text-xs text-slate-600">
        {copy.footer.rights}
      </div>
    </footer>
  );
}

export function SignalBoard({ copy }: { copy: PublicCopy }) {
  return (
    <div className="relative mx-auto w-full max-w-xl" aria-label={copy.home.boardAria}>
      <div className="rounded-lg border border-[#f3f4f6] bg-[#ffffff] p-4 shadow-xl shadow-black/30">
        <div className="flex items-center justify-between border-b border-[#f3f4f6] pb-4">
          <div>
            <p className="text-sm font-semibold text-[var(--it-text)]">{copy.home.boardTitle}</p>
            <p className="mt-1 text-xs text-slate-500">{copy.home.boardSubtitle}</p>
          </div>
          <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">Live</span>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {copy.home.boardStats.map((stat) => (
            <div key={stat.label} className="rounded-lg border border-[#f3f4f6] bg-[#f8fafc] p-3">
              <p className="text-xl font-semibold text-[var(--it-text)]">{stat.value}</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-3">
          {copy.home.boardRows.map((row) => (
            <div key={row.title} className="rounded-lg border border-[#f3f4f6] bg-[#f8fafc] p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-[var(--it-text)]">{row.title}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{row.body}</p>
                </div>
                <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${row.tone}`}>
                  {row.badge}
                </span>
              </div>
              <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-[#f3f4f6]">
                {row.bars.map((bar, index) => (
                  <div key={`${row.title}-${index}`} className={bar.className} style={{ flex: bar.flex }} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function LegalLayout({ copy, title, intro, sections }: { copy: PublicCopy; title: string; intro: string; sections: Array<{ title: string; body: string[] }> }) {
  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-100">
      <PublicHeader copy={copy} />
      <section className="mx-auto max-w-4xl px-5 py-16 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#4338ca]">{copy.legal.eyebrow}</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[var(--it-text)] sm:text-5xl">{title}</h1>
        <p className="mt-5 text-base leading-7 text-slate-400">{intro}</p>
        <div className="mt-10 space-y-5">
          {sections.map((section) => (
            <section key={section.title} className="rounded-lg border border-[#f3f4f6] bg-[#ffffff] p-6">
              <h2 className="text-xl font-semibold text-[var(--it-text)]">{section.title}</h2>
              <div className="mt-4 space-y-3 text-sm leading-7 text-slate-400">
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
