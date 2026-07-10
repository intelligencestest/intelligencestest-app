"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Homepage pricing: selectable plan cards + a feature-comparison matrix +
 * one contextual CTA. Adapted from a 21st.dev pricing-table pattern into the
 * light enterprise language (design-language.md) and the product's real
 * billing facts: EUR, monthly only — no yearly tier exists in checkout, so
 * none is advertised here. Plan/feature data mirrors Settings → Billing.
 */
export type PlanLevel = "starter" | "professional" | "enterprise";

export interface PricingPlan {
  level: PlanLevel;
  name: string;
  /** Formatted price, e.g. "€49" or "A medida". */
  price: string;
  /** "/month" suffix; empty for Enterprise. */
  period: string;
  tag?: string;
  /** CTA label when this plan is selected, e.g. "Start with Starter". */
  ctaLabel: string;
}

export interface PricingFeatureRow {
  name: string;
  /** Per-plan cell: a literal value ("5", "250"), true (included), or false. */
  values: Record<PlanLevel, string | boolean>;
}

export interface PricingTableProps {
  plans: PricingPlan[];
  features: PricingFeatureRow[];
  matrixLabel: string;
  /** Server components can't pass functions across the client boundary, so
      CTA destinations arrive as plain, locale-resolved hrefs. */
  signupHref: string;
  contactHref: string;
  defaultPlan?: PlanLevel;
  className?: string;
}

export function PricingTable({
  plans,
  features,
  matrixLabel,
  signupHref,
  contactHref,
  defaultPlan = "professional",
  className,
}: PricingTableProps) {
  const [selected, setSelected] = React.useState<PlanLevel>(defaultPlan);
  const selectedPlan = plans.find((p) => p.level === selected) ?? plans[0];

  return (
    <div className={className}>
      {/* Plan selector */}
      <div className="grid gap-3 sm:grid-cols-3">
        {plans.map((plan) => {
          const active = plan.level === selected;
          return (
            <button
              key={plan.level}
              type="button"
              onClick={() => setSelected(plan.level)}
              aria-pressed={active}
              className={cn(
                "cursor-pointer rounded-xl border bg-white p-5 text-left transition-colors",
                active
                  ? "border-[var(--it-primary)]/50 ring-1 ring-[var(--it-primary)]/50 shadow-[0_1px_3px_rgba(16,24,40,0.05),0_12px_32px_-16px_rgba(79,70,229,0.25)]"
                  : "border-[var(--it-hairline)] shadow-[0_1px_2px_rgba(16,24,40,0.04)] hover:border-[var(--it-border)]"
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-[var(--it-text)]">{plan.name}</span>
                {plan.tag ? (
                  <span className="rounded-full border border-[var(--it-primary)]/30 bg-[var(--it-primary-soft)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--it-link)]">
                    {plan.tag}
                  </span>
                ) : null}
              </div>
              <p className="mt-3 flex items-baseline gap-1">
                <span className="text-2xl font-semibold tabular-nums tracking-tight text-[var(--it-text)]">
                  {plan.price}
                </span>
                {plan.period ? <span className="text-sm text-[var(--it-muted)]">{plan.period}</span> : null}
              </p>
            </button>
          );
        })}
      </div>

      {/* Feature matrix */}
      <div className="mt-6 overflow-hidden rounded-xl border border-[var(--it-hairline)] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-[var(--it-hairline)]">
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--it-faint)]">
                  {matrixLabel}
                </th>
                {plans.map((plan) => (
                  <th
                    key={plan.level}
                    className={cn(
                      "w-28 px-3 py-3.5 text-center text-[11px] font-semibold uppercase tracking-[0.08em]",
                      plan.level === selected ? "text-[var(--it-link)]" : "text-[var(--it-faint)]"
                    )}
                  >
                    {plan.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {features.map((row) => (
                <tr key={row.name} className="border-b border-[var(--it-border-soft)] last:border-0">
                  <td className="px-5 py-3.5 text-[var(--it-muted)]">{row.name}</td>
                  {plans.map((plan) => {
                    const value = row.values[plan.level];
                    const active = plan.level === selected;
                    return (
                      <td
                        key={plan.level}
                        className={cn("px-3 py-3.5 text-center", active && "bg-[var(--it-primary-soft)]/40")}
                      >
                        {value === true ? (
                          <Check
                            className={cn("mx-auto h-4 w-4", active ? "text-[#15803d]" : "text-[#16a34a]/70")}
                            strokeWidth={2.5}
                            aria-hidden="true"
                          />
                        ) : value === false ? (
                          <span className="text-[var(--it-faint)]">—</span>
                        ) : (
                          <span
                            className={cn(
                              "tabular-nums",
                              active ? "font-semibold text-[var(--it-text)]" : "text-[var(--it-muted)]"
                            )}
                          >
                            {value}
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* One contextual CTA */}
      <div className="mt-8 flex justify-center">
        <Link
          href={selectedPlan.level === "enterprise" ? contactHref : signupHref}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--it-primary)] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--it-primary-hover)]"
        >
          {selectedPlan.ctaLabel}
          <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
