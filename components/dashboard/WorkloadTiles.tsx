import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { shortDuration } from "@/lib/dashboard/format";

export interface WorkloadData {
  review: { count: number; oldestWaitMs: number | null };
  invites: { expiring: number; expired: number };
  reviewed: { count: number };
  interview: { count: number; agingCount: number };
}

/**
 * Tier-1 workload tiles: each answers "how much work is waiting, and where is
 * it oldest?" and opens the matching queue. Health/trend metrics live in the
 * demoted ProcessHealthStrip instead.
 */
export default async function WorkloadTiles({ data }: { data: WorkloadData }) {
  const t = await getTranslations("dashboard");

  const tiles = [
    {
      key: "review",
      label: t("tileReviewTitle"),
      value: data.review.count,
      sub:
        data.review.count > 0 && data.review.oldestWaitMs !== null
          ? t("tileReviewOldest", { time: shortDuration(data.review.oldestWaitMs) })
          : t("tileReviewEmpty"),
      href: "/inbox",
      urgent: data.review.count > 0,
    },
    {
      key: "invites",
      label: t("tileInvitesTitle"),
      value: data.invites.expiring + data.invites.expired,
      sub:
        data.invites.expiring + data.invites.expired > 0
          ? t("tileInvitesSub", { expiring: data.invites.expiring, expired: data.invites.expired })
          : t("tileInvitesEmpty"),
      href: "/candidates?stage=invited",
      urgent: data.invites.expiring + data.invites.expired > 0,
    },
    {
      key: "reviewed",
      label: t("tileReviewedTitle"),
      value: data.reviewed.count,
      sub: data.reviewed.count > 0 ? t("tileReviewedSub") : t("tileReviewedEmpty"),
      href: "/candidates?stage=reviewed",
      urgent: false,
    },
    {
      key: "interview",
      label: t("tileInterviewTitle"),
      value: data.interview.count,
      sub:
        data.interview.agingCount > 0
          ? t("tileInterviewSub", { count: data.interview.agingCount })
          : t("tileInterviewEmpty"),
      href: "/candidates?stage=interview",
      urgent: data.interview.agingCount > 0,
    },
  ];

  return (
    <section className="enterprise-card grid grid-cols-1 overflow-hidden rounded-xl sm:grid-cols-2 xl:grid-cols-4">
      {tiles.map((tile) => (
        <Link
          key={tile.key}
          href={tile.href}
          className="enterprise-card-hover flex min-h-[122px] flex-col border-b border-[var(--it-border-soft)] p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--it-primary)] sm:odd:border-r xl:border-b-0 xl:border-r xl:last:border-r-0"
        >
          <p className="text-[12px] font-medium uppercase text-[var(--it-faint)]">{tile.label}</p>
          <div className="mt-2 flex items-baseline gap-2">
            {/* Cleared queues recede; only live work reads bright. */}
            <span
              className={`text-4xl font-semibold tabular-nums ${
                tile.value > 0 ? "text-white" : "text-[var(--it-faint)]"
              }`}
            >
              {tile.value}
            </span>
          </div>
          <p className={`mt-auto pt-2 text-[13px] leading-5 ${tile.urgent ? "text-[#d2b174]" : "text-[var(--it-muted)]"}`}>
            {tile.sub}
          </p>
        </Link>
      ))}
    </section>
  );
}
