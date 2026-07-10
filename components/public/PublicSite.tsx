import Link from "next/link";
import { getLocale } from "next-intl/server";
import {
  Cookie,
  CreditCard,
  FileText,
  LayoutPanelLeft,
  LifeBuoy,
  LogIn,
  Scale,
  ShieldCheck,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
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
          <a href={`${home}#product`} className="transition hover:text-[var(--it-text)]">{copy.nav.features}</a>
          <a href={`${home}#pricing`} className="transition hover:text-[var(--it-text)]">{copy.nav.assessments}</a>
          <a href={`${home}#security`} className="transition hover:text-[var(--it-text)]">{copy.nav.faq}</a>
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
  const home = localePath("/", locale);

  // Brand block left, icon link columns right, hairline copyright bar —
  // a 21st.dev footer layout carried onto our tokens and real content.
  const columns: Array<{ title: string; links: Array<{ name: string; Icon: LucideIcon; href: string }> }> = [
    {
      title: copy.footer.explore,
      links: [
        { name: copy.nav.features, Icon: LayoutPanelLeft, href: `${home}#product` },
        { name: copy.nav.assessments, Icon: CreditCard, href: `${home}#pricing` },
        { name: copy.nav.faq, Icon: ShieldCheck, href: `${home}#security` },
      ],
    },
    {
      title: copy.footer.product,
      links: [
        { name: copy.nav.signup, Icon: UserPlus, href: localePath("/signup", locale) },
        { name: copy.nav.login, Icon: LogIn, href: localePath("/login", locale) },
        { name: copy.nav.contact, Icon: LifeBuoy, href: localePath("/contact", locale) },
      ],
    },
    {
      title: copy.footer.legal,
      links: [
        { name: copy.legal.privacyTitle, Icon: Scale, href: "/privacy" },
        { name: copy.legal.termsTitle, Icon: FileText, href: "/terms" },
        { name: copy.legal.cookiesTitle, Icon: Cookie, href: "/cookies" },
      ],
    },
  ];

  return (
    <footer className="border-t border-[var(--it-hairline)] bg-[var(--it-bg)]">
      <div className="mx-auto max-w-7xl px-5 pt-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <BrandMark />
            <p className="mt-4 max-w-sm text-sm leading-6 text-[var(--it-muted)]">{copy.footer.body}</p>
          </div>

          <div className="grid grid-cols-2 gap-10 md:grid-cols-3 lg:col-span-8 lg:justify-items-end">
            {columns.map(({ title, links }) => (
              <div key={title}>
                <h3 className="text-sm font-semibold text-[var(--it-text)]">{title}</h3>
                <ul className="mt-4 space-y-2.5">
                  {links.map(({ name, Icon, href }) => (
                    <li key={name}>
                      <Link
                        href={href}
                        className="group inline-flex items-center gap-1.5 text-sm text-[var(--it-muted)] transition-colors hover:text-[var(--it-text)]"
                      >
                        <Icon
                          className="h-4 w-4 text-[var(--it-faint)] transition-colors group-hover:text-[var(--it-muted)]"
                          strokeWidth={1.8}
                          aria-hidden="true"
                        />
                        {name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 border-t border-[var(--it-hairline)] pb-8 pt-6">
          <p className="text-xs text-[var(--it-faint)]">{copy.footer.rights}</p>
        </div>
      </div>
    </footer>
  );
}

export function SignalBoard({ copy }: { copy: PublicCopy }) {
  return (
    <div className="relative mx-auto w-full max-w-xl" aria-label={copy.home.boardAria}>
      <div className="rounded-lg border border-[#f3f4f6] bg-[#ffffff] p-4 shadow-[0_1px_3px_rgba(16,24,40,0.06),0_16px_40px_-20px_rgba(16,24,40,0.18)]">
        <div className="flex items-center justify-between border-b border-[#f3f4f6] pb-4">
          <div>
            <p className="text-sm font-semibold text-[var(--it-text)]">{copy.home.boardTitle}</p>
            <p className="mt-1 text-xs text-slate-500">{copy.home.boardSubtitle}</p>
          </div>
          <span className="rounded-full border border-[rgba(22,163,74,0.25)] bg-[rgba(22,163,74,0.07)] px-3 py-1 text-xs font-semibold text-[#15803d]">Live</span>
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
