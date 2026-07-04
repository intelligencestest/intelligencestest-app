import Link from "next/link";
import type { ReactNode } from "react";

/** Console-internal UI primitives. English-only by design (internal tool). */

export type ChipTone = "good" | "warn" | "bad" | "info" | "neutral";

const CHIP_TONES: Record<ChipTone, string> = {
  good: "border-emerald-500/25 bg-emerald-500/10 text-emerald-200",
  warn: "border-[#fab219]/25 bg-[#fab219]/10 text-[#fab219]",
  bad: "border-[#d03b3b]/25 bg-[#d03b3b]/10 text-[#f28b8b]",
  info: "border-[#3987e5]/25 bg-[#3987e5]/10 text-[#6da7ec]",
  neutral: "border-[#1E2240] bg-[#0D1020] text-slate-300",
};

export function Chip({ tone = "neutral", children }: { tone?: ChipTone; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${CHIP_TONES[tone]}`}>
      {children}
    </span>
  );
}

export function statusTone(status: string): ChipTone {
  if (status === "active" || status === "hired" || status === "completed") return "good";
  if (status === "disabled" || status === "rejected") return "bad";
  if (status === "expired" || status === "archived") return "warn";
  return "neutral";
}

export function StatCard({ label, value, sub, href }: { label: string; value: string; sub?: string; href?: string }) {
  const body = (
    <>
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1.5 text-2xl font-semibold tracking-tight tabular-nums text-white">{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
    </>
  );
  const cls = "rounded-xl border border-[#1E2240] bg-[#0D1020] p-4";
  return href ? (
    <Link href={href} className={`${cls} block transition-colors hover:border-[#2d3a70] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b5cf6]`}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

export function Section({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="overflow-hidden rounded-xl border border-[#1E2240] bg-[#0D1020]">
      <div className="flex items-center justify-between gap-3 border-b border-[#1E2240] px-5 py-3">
        <h2 className="text-sm font-semibold text-white">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function EmptyRow({ children }: { children: ReactNode }) {
  return <div className="px-5 py-8 text-center text-sm text-slate-500">{children}</div>;
}

/** Server-rendered pagination links (?page=N preserved with other params). */
export function Pagination({
  page,
  pageSize,
  total,
  makeHref,
}: {
  page: number;
  pageSize: number;
  total: number;
  makeHref: (page: number) => string;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages <= 1) return null;
  const linkCls =
    "rounded-lg border border-[#1E2240] px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-[#2d3a70] hover:text-white";
  return (
    <div className="flex items-center justify-between border-t border-[#1E2240] px-5 py-3 text-xs text-slate-500">
      <span className="tabular-nums">
        Page {page} of {pages} · {total} total
      </span>
      <div className="flex gap-2">
        {page > 1 && (
          <Link href={makeHref(page - 1)} className={linkCls}>
            ← Prev
          </Link>
        )}
        {page < pages && (
          <Link href={makeHref(page + 1)} className={linkCls}>
            Next →
          </Link>
        )}
      </div>
    </div>
  );
}

export function MigrationNotice({ what }: { what: string }) {
  return (
    <div className="rounded-xl border border-[#fab219]/25 bg-[#fab219]/10 px-4 py-3 text-sm text-[#fab219]">
      {what} unavailable — apply <code className="font-mono">supabase/migrations/021_internal_admin_console.sql</code> and reload.
    </div>
  );
}
