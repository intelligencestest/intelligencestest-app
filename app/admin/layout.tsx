import Link from "next/link";
import { getInternalAdmin } from "@/lib/internal-admin";
import CommandPalette from "@/components/admin/CommandPalette";

const NAV = [
  { href: "/admin", label: "Home" },
  { href: "/admin/companies", label: "Companies" },
  { href: "/admin/audit", label: "Audit log" },
];

/**
 * Operations console shell. Deliberately distinct from the product app:
 * violet INTERNAL chrome so an operator always knows which side they're on.
 * Pages must still guard their own data (layout and page render in parallel).
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const adminCtx = await getInternalAdmin();

  if (!adminCtx) {
    return (
      <main className="min-h-screen border-t-2 border-[#8b5cf6] bg-[var(--it-bg)] px-5 py-16 text-slate-100">
        <div className="mx-auto max-w-xl rounded-xl border border-[var(--it-hairline)] bg-[var(--it-surface)] p-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4338ca]">IntelligencesTest · Internal</p>
          <h1 className="mt-3 text-2xl font-semibold text-[var(--it-text)]">Operator access required</h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Sign in with an internal_admins account (or a break-glass email from INTERNAL_ADMIN_EMAILS).
          </p>
          <Link href="/login" className="mt-6 inline-flex rounded-lg bg-[#8b5cf6] px-4 py-3 text-sm font-semibold text-[var(--it-text)] hover:bg-[#7c4deb]">
            Go to login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen flex-col border-t-2 border-[#8b5cf6] bg-[var(--it-bg)] text-slate-100">
      <header className="sticky top-0 z-40 flex h-12 items-center gap-4 border-b border-[var(--it-hairline)] bg-[var(--it-surface)]/95 px-4 backdrop-blur-sm">
        <Link href="/admin" className="flex items-center gap-2 text-sm font-semibold text-[var(--it-text)]">
          <span className="rounded bg-[#8b5cf6]/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[#4338ca]">
            Internal
          </span>
          Ops Console
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-400 transition-colors hover:bg-gray-900/[0.05] hover:text-slate-200"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <CommandPalette />
          <span className="hidden items-center gap-2 text-xs text-slate-500 sm:flex">
            <span className="rounded-full border border-[#8b5cf6]/30 bg-[#8b5cf6]/10 px-2 py-0.5 font-semibold text-[#4338ca]">
              {adminCtx.role}
              {adminCtx.breakGlass ? " · break-glass" : ""}
            </span>
            <span className="max-w-40 truncate">{adminCtx.user.email}</span>
          </span>
          <Link href="/dashboard" className="text-xs font-medium text-slate-500 transition-colors hover:text-slate-300">
            Product app →
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
