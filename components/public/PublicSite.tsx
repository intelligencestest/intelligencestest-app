import Link from "next/link";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import type { PublicCopy } from "@/lib/public-site-copy";

function BrandMark() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-[#1D4ED8] shadow-lg shadow-[#1D4ED8]/20" aria-hidden="true">
        <div className="absolute h-4 w-4 rotate-45 rounded-[3px] border border-white/85" />
        <div className="absolute mt-2 h-4 w-4 rotate-45 rounded-[3px] border border-white/65" />
        <div className="absolute -mt-2 h-4 w-4 rotate-45 rounded-[3px] border border-white" />
      </div>
      <div>
        <p className="text-sm font-semibold leading-5 text-white">Intelligences Test</p>
        <p className="text-xs leading-4 text-slate-500">Assessment Platform</p>
      </div>
    </div>
  );
}

export function PublicHeader({ copy }: { copy: PublicCopy }) {
  return (
    <header className="sticky top-0 z-40 border-b border-[#1E2240] bg-[#07080F]/92 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 sm:px-6 lg:px-8">
        <Link href="/" aria-label="Intelligences Test home">
          <BrandMark />
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-400 lg:flex" aria-label={copy.nav.primaryAria}>
          <a href="/#features" className="transition hover:text-white">{copy.nav.features}</a>
          <a href="/#assessments" className="transition hover:text-white">{copy.nav.assessments}</a>
          <a href="/#faq" className="transition hover:text-white">{copy.nav.faq}</a>
          <Link href="/contact" className="transition hover:text-white">{copy.nav.contact}</Link>
        </nav>
        <div className="flex items-center gap-2">
          <LanguageSwitcher showLabel={false} />
          <Link href="/login" className="hidden rounded-lg border border-[#1E2240] px-3 py-2 text-sm font-semibold text-slate-200 transition hover:border-[#1D4ED8]/70 sm:inline-flex">
            {copy.nav.login}
          </Link>
          <Link href="/demo" className="rounded-lg bg-[#1D4ED8] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#1e40af]">
            {copy.nav.demo}
          </Link>
        </div>
      </div>
    </header>
  );
}

export function PublicFooter({ copy }: { copy: PublicCopy }) {
  return (
    <footer className="border-t border-[#1E2240] bg-[#07080F]">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-10 sm:px-6 md:grid-cols-[1fr_1fr] lg:grid-cols-[1.2fr_0.8fr_0.8fr] lg:px-8">
        <div>
          <BrandMark />
          <p className="mt-4 max-w-md text-sm leading-6 text-slate-400">{copy.footer.body}</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{copy.footer.product}</p>
          <ul className="mt-4 space-y-3 text-sm text-slate-400">
            <li><Link href="/demo" className="hover:text-white">{copy.nav.demo}</Link></li>
            <li><Link href="/contact" className="hover:text-white">{copy.nav.contact}</Link></li>
            <li><Link href="/signup" className="hover:text-white">{copy.nav.signup}</Link></li>
            <li><Link href="/login" className="hover:text-white">{copy.nav.login}</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{copy.footer.legal}</p>
          <ul className="mt-4 space-y-3 text-sm text-slate-400">
            <li><Link href="/privacy" className="hover:text-white">{copy.legal.privacyTitle}</Link></li>
            <li><Link href="/terms" className="hover:text-white">{copy.legal.termsTitle}</Link></li>
            <li><Link href="/cookies" className="hover:text-white">{copy.legal.cookiesTitle}</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-[#1E2240] px-5 py-5 text-center text-xs text-slate-600">
        {copy.footer.rights}
      </div>
    </footer>
  );
}

export function SignalBoard({ copy }: { copy: PublicCopy }) {
  return (
    <div className="relative mx-auto w-full max-w-xl" aria-label={copy.home.boardAria}>
      <div className="rounded-lg border border-[#1E2240] bg-[#0D1020] p-4 shadow-2xl shadow-black/30">
        <div className="flex items-center justify-between border-b border-[#1E2240] pb-4">
          <div>
            <p className="text-sm font-semibold text-white">{copy.home.boardTitle}</p>
            <p className="mt-1 text-xs text-slate-500">{copy.home.boardSubtitle}</p>
          </div>
          <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">Live</span>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {copy.home.boardStats.map((stat) => (
            <div key={stat.label} className="rounded-lg border border-[#1E2240] bg-[#07080F] p-3">
              <p className="text-xl font-semibold text-white">{stat.value}</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-3">
          {copy.home.boardRows.map((row) => (
            <div key={row.title} className="rounded-lg border border-[#1E2240] bg-[#07080F] p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-white">{row.title}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{row.body}</p>
                </div>
                <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${row.tone}`}>
                  {row.badge}
                </span>
              </div>
              <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-[#1E2240]">
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
    <main className="min-h-screen bg-[#07080F] text-slate-100">
      <PublicHeader copy={copy} />
      <section className="mx-auto max-w-4xl px-5 py-16 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#8CB1FF]">{copy.legal.eyebrow}</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">{title}</h1>
        <p className="mt-5 text-base leading-7 text-slate-400">{intro}</p>
        <div className="mt-10 space-y-5">
          {sections.map((section) => (
            <section key={section.title} className="rounded-lg border border-[#1E2240] bg-[#0D1020] p-6">
              <h2 className="text-xl font-semibold text-white">{section.title}</h2>
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
