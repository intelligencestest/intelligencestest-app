import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { CheckCircle2, Mail } from "lucide-react";

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
              className="enterprise-table-row flex items-start gap-3 px-4 py-3 transition-colors hover:bg-gray-900/[0.025]"
            >
              <span
                className={`mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md ring-1 ${
                  item.kind === "completed"
                    ? "bg-[rgba(22,163,74,0.08)] text-[#15803d] ring-[rgba(22,163,74,0.26)]"
                    : "bg-[rgba(74,112,150,0.08)] text-[#3a5c7e] ring-[rgba(74,112,150,0.26)]"
                }`}
              >
                {item.kind === "completed" ? (
                  <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
                ) : (
                  <Mail className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
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
