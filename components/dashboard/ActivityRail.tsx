import Link from "next/link";
import { getTranslations } from "next-intl/server";

export interface ActivityItem {
  key: string;
  message: string;
  time: string;
  href: string;
  kind: "completed" | "invited";
}

/**
 * Ambient awareness rail. Currently inferred from result/candidate
 * timestamps; TODO(phase-2): feed from the activity_events table for the full
 * vocabulary (reviewed, hired, rejected, resent…) and actor attribution.
 */
export default async function ActivityRail({ items }: { items: ActivityItem[] }) {
  const t = await getTranslations("dashboard");

  return (
    <section id="activity" className="enterprise-card overflow-hidden rounded-xl">
      <div className="border-b enterprise-divider px-4 py-3.5">
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.04em] text-[var(--it-muted)]">{t("activity")}</h2>
      </div>
      {items.length === 0 ? (
        <div className="px-5 py-10 text-center text-[13px] text-[var(--it-muted)]">{t("activityEmpty")}</div>
      ) : (
        <div>
          {items.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="enterprise-table-row flex items-start gap-3 px-4 py-3 transition-colors hover:bg-white/[0.025]"
            >
              <span
                className={`mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md ring-1 ${
                  item.kind === "completed"
                    ? "bg-[rgba(63,143,107,0.08)] text-[#91c7ad] ring-[rgba(63,143,107,0.26)]"
                    : "bg-[rgba(82,122,163,0.08)] text-[#9bb7d2] ring-[rgba(82,122,163,0.26)]"
                }`}
              >
                {item.kind === "completed" ? (
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                ) : (
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21.75 7.5v9a2.25 2.25 0 0 1-2.25 2.25h-15A2.25 2.25 0 0 1 2.25 16.5v-9m19.5 0A2.25 2.25 0 0 0 19.5 5.25h-15A2.25 2.25 0 0 0 2.25 7.5m19.5 0-8.2 5.47a2.25 2.25 0 0 1-2.5 0L2.25 7.5" />
                  </svg>
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] leading-snug text-slate-300">{item.message}</span>
                <span className="mt-0.5 block text-xs text-[var(--it-faint)]">{item.time}</span>
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
