import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface PdfPreviewPageProps {
  searchParams: Promise<{
    locale?: string;
    mode?: string;
    direction?: string;
  }>;
}

function optionPath(locale: string, mode: string, direction: string) {
  const params = new URLSearchParams({ locale, mode, direction });
  return `/dev/pdf-preview?${params.toString()}`;
}

function pdfPath(locale: string, mode: string, direction: string, download = false) {
  const params = new URLSearchParams({ locale, mode, direction });
  if (download) params.set("download", "1");
  return `/api/dev/pdf-preview?${params.toString()}`;
}

export default async function DevPdfPreviewPage({ searchParams }: PdfPreviewPageProps) {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  const params = await searchParams;
  const locale = params.locale === "en" ? "en" : "es";
  const mode = params.mode === "dark" ? "dark" : "light";
  const direction = params.direction === "rtl" ? "rtl" : "ltr";
  const previewUrl = pdfPath(locale, mode, direction);
  const downloadUrl = pdfPath(locale, mode, direction, true);

  const linkClass = "rounded-lg border border-[#1E2240] px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-[#1D4ED8] hover:text-white";
  const activeClass = "rounded-lg border border-[#1D4ED8] bg-[#1D4ED8] px-3 py-2 text-sm font-semibold text-white";

  return (
    <main className="min-h-screen bg-[#07080F] px-5 py-6 text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <header className="flex flex-col gap-4 rounded-2xl border border-[#1E2240] bg-[#0D1020] p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8CB1FF]">Development only</p>
            <h1 className="mt-2 text-2xl font-semibold">React PDF Architecture Preview</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
              Mock enterprise report for validating layout, typography, charts, page breaks, multilingual copy, filtering rules, and download behavior.
              This route returns 404 in production and does not affect existing report pages.
            </p>
          </div>
          <a
            href={downloadUrl}
            className="inline-flex items-center justify-center rounded-lg bg-[#1D4ED8] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2563EB]"
          >
            Download PDF
          </a>
        </header>

        <section className="grid gap-4 rounded-2xl border border-[#1E2240] bg-[#0D1020] p-4 lg:grid-cols-3">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Language</p>
            <div className="flex gap-2">
              <Link href={optionPath("es", mode, direction)} className={locale === "es" ? activeClass : linkClass}>Spanish</Link>
              <Link href={optionPath("en", mode, direction)} className={locale === "en" ? activeClass : linkClass}>English</Link>
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Theme</p>
            <div className="flex gap-2">
              <Link href={optionPath(locale, "light", direction)} className={mode === "light" ? activeClass : linkClass}>Light PDF</Link>
              <Link href={optionPath(locale, "dark", direction)} className={mode === "dark" ? activeClass : linkClass}>Dark PDF</Link>
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Direction</p>
            <div className="flex gap-2">
              <Link href={optionPath(locale, mode, "ltr")} className={direction === "ltr" ? activeClass : linkClass}>LTR</Link>
              <Link href={optionPath(locale, mode, "rtl")} className={direction === "rtl" ? activeClass : linkClass}>RTL test</Link>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-[#1E2240] bg-[#0D1020] p-3">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3 px-2">
            <div>
              <p className="text-sm font-semibold">PDF preview</p>
              <p className="text-xs text-slate-500">
                The mock data includes incomplete and unsupported benchmark records that should be filtered out by the PDF architecture.
              </p>
            </div>
            <a href={previewUrl} target="_blank" rel="noreferrer" className={linkClass}>
              Open in new tab
            </a>
          </div>
          <iframe
            src={previewUrl}
            className="h-[78vh] w-full rounded-xl border border-[#1E2240] bg-white"
            title="React PDF development preview"
          />
        </section>
      </div>
    </main>
  );
}
