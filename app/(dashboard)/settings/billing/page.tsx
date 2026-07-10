"use client";

import Link from "next/link";
import { ArrowRight, Check, Minus } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { PayPalSubscribeButton } from "@/components/billing/PayPalSubscribeButton";
import { localePath, toAppLocale } from "@/lib/i18n/locales";

const PAYPAL_MANAGE_URL = "https://www.paypal.com/myaccount/autopay/";

type PlanId = "trial" | "starter" | "professional" | "enterprise";
type PaidPlanId = Exclude<PlanId, "trial">;

interface PlanData {
  plan: string;
  planId: PlanId | null;
  trialStatus: "active" | "expired" | "extended" | "converted";
  trialEndsAt: string | null;
  trialDaysLeft: number | null;
  isTrialExpired: boolean;
  subscriptionStatus: string;
  billingProvider: string;
  limits: { candidates: number | null; projects: number | null; recruiters: number | null };
  usage: { candidates: number; projects: number; recruiters: number };
  priceEur: number | null;
}

function usagePercent(used: number, limit: number | null) {
  if (limit === null || limit <= 0) return 0;
  return Math.min(100, Math.round((used / limit) * 100));
}

function usageTone(used: number, limit: number | null) {
  if (limit === null || limit <= 0) return "bg-[var(--it-info)]";
  const ratio = used / limit;
  if (ratio >= 1) return "bg-[var(--it-danger)]";
  if (ratio >= 0.8) return "bg-[var(--it-warning)]";
  return "bg-[var(--it-info)]";
}

function FeatureValue({
  value,
  includedLabel,
  excludedLabel,
}: {
  value: string | boolean;
  includedLabel: string;
  excludedLabel: string;
}) {
  if (typeof value === "boolean") {
    return value ? (
      <span className="inline-flex items-center justify-center rounded-full border border-[var(--it-success)]/25 bg-[rgba(22,163,74,0.1)] p-1 text-[#15803d]">
        <Check className="h-3.5 w-3.5" aria-label={includedLabel} />
      </span>
    ) : (
      <span className="inline-flex items-center justify-center rounded-full border border-[var(--it-border)] bg-gray-900/[0.025] p-1 text-[var(--it-faint)]">
        <Minus className="h-3.5 w-3.5" aria-label={excludedLabel} />
      </span>
    );
  }

  return <span className="text-sm font-semibold tabular-nums text-[var(--it-text)]">{value}</span>;
}

export default function BillingSettingsPage() {
  const locale = toAppLocale(useLocale());
  const billingT = useTranslations("billing");
  const es = locale === "es";
  const [planData, setPlanData] = useState<PlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<PaidPlanId>("professional");

  const copy = es
    ? {
        title: "Plan y facturación",
        description: "Gestione su prueba, límites de uso y suscripción de IntelligencesTest.",
        trialEnds: "La prueba finaliza",
        trialEnded: "La prueba finalizó",
        daysLeft: (days: number) => (days === 1 ? "Queda 1 día" : `Quedan ${days} días`),
        paymentMode: "PayPal está disponible para Starter y Professional. Enterprise se gestiona con el equipo comercial.",
        candidates: "Candidatos este mes",
        projects: "Proyectos activos",
        recruiters: "Reclutadores",
        unlimited: "sin límite",
        unlimitedShort: "Sin límite",
        availablePlans: "Planes disponibles",
        availablePlansText: "Elija el plan que corresponde a su volumen actual.",
        matrixLabel: "Qué incluye",
        freeTrial: "Prueba gratuita",
        starter: "Starter",
        professional: "Professional",
        enterprise: "Enterprise",
        trialPrice: "14 días gratis",
        starterPrice: "49 €/mes",
        professionalPrice: "149 €/mes",
        enterprisePrice: "Contactar con ventas",
        current: "Actual",
        contactSales: "Contactar con ventas",
        loading: "Cargando facturación...",
        billingUnavailable: "No se pudo cargar la información actual del plan.",
        manual: "Manual",
        paypal: "PayPal",
        legacy: (plan: string) => `Plan anterior (${plan})`,
        subscriptionLabels: {
          manual: "Manual",
          pending_payment: "Pago pendiente",
          active: "Activo",
          past_due: "Pago pendiente",
          cancelled: "Cancelado",
        },
        included: "Incluido",
        notIncluded: "No incluido",
        featureRecruiters: "Reclutadores",
        featureCandidateInvitations: "Invitaciones de candidatos",
        featureProjects: "Proyectos",
        featureExecutiveReports: "Informes ejecutivos",
        featureAssessments: "Evaluaciones",
        featureTeamCollaboration: "Colaboración de equipo",
        featurePrioritySupport: "Soporte prioritario",
        billingHistoryText:
          "Sus facturas y recibos de PayPal están disponibles directamente en su cuenta de PayPal.",
        manageInPayPal: "Gestionar en PayPal",
      }
    : {
        title: "Plan and billing",
        description: "Manage your trial, usage limits, and IntelligencesTest subscription.",
        trialEnds: "Trial ends",
        trialEnded: "Trial ended",
        daysLeft: (days: number) => (days === 1 ? "1 day left" : `${days} days left`),
        paymentMode: "PayPal is available for Starter and Professional. Enterprise is handled by the commercial team.",
        candidates: "Candidates this month",
        projects: "Active projects",
        recruiters: "Recruiters",
        unlimited: "unlimited",
        unlimitedShort: "Unlimited",
        availablePlans: "Available plans",
        availablePlansText: "Choose the plan that matches your current hiring volume.",
        matrixLabel: "What's included",
        freeTrial: "Free trial",
        starter: "Starter",
        professional: "Professional",
        enterprise: "Enterprise",
        trialPrice: "14-day free trial",
        starterPrice: "€49/month",
        professionalPrice: "€149/month",
        enterprisePrice: "Contact Sales",
        current: "Current",
        contactSales: "Contact sales",
        loading: "Loading billing...",
        billingUnavailable: "We could not load your current plan information.",
        manual: "Manual",
        paypal: "PayPal",
        legacy: (plan: string) => `Legacy plan (${plan})`,
        subscriptionLabels: {
          manual: "Manual",
          pending_payment: "Pending payment",
          active: "Active",
          past_due: "Past due",
          cancelled: "Cancelled",
        },
        included: "Included",
        notIncluded: "Not included",
        featureRecruiters: "Recruiters",
        featureCandidateInvitations: "Candidate invitations",
        featureProjects: "Projects",
        featureExecutiveReports: "Executive reports",
        featureAssessments: "Assessments",
        featureTeamCollaboration: "Team collaboration",
        featurePrioritySupport: "Priority support",
        billingHistoryText: "Your PayPal invoices and receipts are available directly in your PayPal account.",
        manageInPayPal: "Manage in PayPal",
      };

  useEffect(() => {
    let mounted = true;

    async function loadPlan() {
      try {
        const response = await fetch("/api/settings/plan", { cache: "no-store" });
        if (!response.ok) return;
        const data = (await response.json()) as PlanData;
        if (mounted) setPlanData(data);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadPlan();
    return () => {
      mounted = false;
    };
  }, []);

  const activeTrial = Boolean(
    planData?.trialStatus === "active" &&
      planData.trialEndsAt &&
      !planData.isTrialExpired &&
      planData.subscriptionStatus !== "active"
  );
  const effectivePlanId: PlanId | null = activeTrial ? "trial" : planData?.planId ?? null;
  const planName =
    effectivePlanId === "trial"
      ? copy.freeTrial
      : effectivePlanId === "starter"
        ? billingT("starterPlanLabel")
        : effectivePlanId === "professional"
          ? billingT("professionalPlanLabel")
          : effectivePlanId === "enterprise"
            ? copy.enterprise
            : planData
              ? copy.legacy(planData.plan)
              : "";
  const subscriptionKey = planData?.subscriptionStatus as keyof typeof copy.subscriptionLabels | undefined;
  const subscriptionLabel =
    subscriptionKey && copy.subscriptionLabels[subscriptionKey]
      ? copy.subscriptionLabels[subscriptionKey]
      : planData?.subscriptionStatus.replace(/_/g, " ") ?? "";
  const usageRows = planData
    ? [
        { label: copy.candidates, used: planData.usage.candidates, limit: planData.limits.candidates },
        { label: copy.projects, used: planData.usage.projects, limit: planData.limits.projects },
        { label: copy.recruiters, used: planData.usage.recruiters, limit: planData.limits.recruiters },
      ]
    : [];
  const planColumns: Array<{ id: PaidPlanId; name: string; price: string; tag?: string }> = [
    {
      id: "starter" as const,
      name: copy.starter,
      price: copy.starterPrice,
    },
    {
      id: "professional" as const,
      name: copy.professional,
      price: copy.professionalPrice,
      tag: es ? "La mayoría de equipos" : "Most teams",
    },
    {
      id: "enterprise" as const,
      name: copy.enterprise,
      price: copy.enterprisePrice,
    },
  ];
  const pricingRows: Array<{ label: string; values: Record<PaidPlanId, string | boolean> }> = [
    {
      label: copy.featureRecruiters,
      values: { starter: "1", professional: "5", enterprise: copy.unlimitedShort },
    },
    {
      label: copy.featureCandidateInvitations,
      values: { starter: "50", professional: "250", enterprise: copy.unlimitedShort },
    },
    {
      label: copy.featureProjects,
      values: { starter: "2", professional: "10", enterprise: copy.unlimitedShort },
    },
    {
      label: copy.featureExecutiveReports,
      values: { starter: true, professional: true, enterprise: true },
    },
    {
      label: copy.featureAssessments,
      values: { starter: true, professional: true, enterprise: true },
    },
    {
      label: copy.featureTeamCollaboration,
      values: { starter: false, professional: true, enterprise: true },
    },
    {
      label: copy.featurePrioritySupport,
      values: { starter: false, professional: true, enterprise: true },
    },
  ];
  const hasPayPalSubscription = planData?.billingProvider === "paypal" && planData.subscriptionStatus === "active";

  const metaParts: Array<{ text: string; tone?: "danger" }> = [];
  if (planData) {
    metaParts.push({ text: subscriptionLabel });
    metaParts.push({ text: planData.billingProvider === "paypal" ? copy.paypal : copy.manual });
    if (planData.trialEndsAt) {
      const trialDateLabel = new Date(planData.trialEndsAt).toLocaleDateString(es ? "es-ES" : "en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
      if (activeTrial && planData.trialDaysLeft !== null) {
        metaParts.push({ text: copy.daysLeft(planData.trialDaysLeft) });
      } else {
        metaParts.push({
          text: `${planData.isTrialExpired ? copy.trialEnded : copy.trialEnds} ${trialDateLabel}`,
          tone: planData.isTrialExpired ? "danger" : undefined,
        });
      }
    }
  }

  return (
    <div className="mx-auto max-w-[1200px]">
      <div>
        <h1 className="text-[30px] font-semibold leading-[38px] tracking-[-0.01em] text-[var(--it-text)]">{copy.title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--it-muted)]">{copy.description}</p>
      </div>

      <section className="mt-8">
          {/* Account summary — one typographic block, no cards */}
          <div className="border-b border-[var(--it-hairline)] pb-8">
            <h2 className="text-2xl font-semibold text-[var(--it-text)]">{loading ? copy.loading : planName}</h2>

            {!loading && planData ? (
              <p className="mt-1.5 text-[13px] text-[var(--it-muted)]">
                {metaParts.map((part, i) => (
                  <span key={part.text}>
                    {i > 0 && <span className="mx-1.5 text-[var(--it-faint)]">·</span>}
                    <span className={part.tone === "danger" ? "text-[#b91c1c]" : undefined}>{part.text}</span>
                  </span>
                ))}
              </p>
            ) : !loading ? (
              <p className="mt-1.5 text-[13px] text-[var(--it-muted)]">{copy.billingUnavailable}</p>
            ) : null}

            {planData ? (
              <div className="mt-6 max-w-xl space-y-3">
                {usageRows.map((row) => (
                  <div key={row.label} className="flex items-center gap-4">
                    <span className="w-40 shrink-0 text-[13px] text-[var(--it-muted)]">{row.label}</span>
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-gray-900/[0.06]">
                      {row.limit !== null ? (
                        <span
                          className={`block h-full rounded-full ${usageTone(row.used, row.limit)}`}
                          style={{ width: `${usagePercent(row.used, row.limit)}%` }}
                        />
                      ) : null}
                    </div>
                    <span className="w-20 shrink-0 text-right text-[13px] tabular-nums text-slate-300">
                      {row.used}/{row.limit ?? copy.unlimited}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          {/* Plans — same selector + matrix pattern as the app homepage pricing section. */}
          <div className="mt-10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--it-faint)]">
              {copy.availablePlans}
            </p>
            <p className="mt-1.5 max-w-2xl text-sm leading-6 text-[var(--it-muted)]">{copy.paymentMode}</p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {planColumns.map((plan) => {
                const selected = selectedPlan === plan.id;
                const current = effectivePlanId === plan.id;
                return (
                  <button
                    key={plan.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`cursor-pointer rounded-xl border bg-white p-5 text-left transition-colors ${
                      selected
                        ? "border-[var(--it-primary)]/50 shadow-[0_1px_3px_rgba(16,24,40,0.05),0_12px_32px_-16px_rgba(79,70,229,0.25)] ring-1 ring-[var(--it-primary)]/50"
                        : "border-[var(--it-hairline)] shadow-[0_1px_2px_rgba(16,24,40,0.04)] hover:border-[var(--it-border)]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-[var(--it-text)]">{plan.name}</span>
                      {current ? (
                        <span className="rounded-full border border-[var(--it-primary)]/30 bg-[var(--it-primary-soft)] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--it-link)]">
                          {copy.current}
                        </span>
                      ) : plan.tag ? (
                        <span className="rounded-full border border-[var(--it-primary)]/30 bg-[var(--it-primary-soft)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--it-link)]">
                          {plan.tag}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-3 text-2xl font-semibold tabular-nums tracking-tight text-[var(--it-text)]">
                      {plan.price}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 overflow-hidden rounded-xl border border-[var(--it-hairline)] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-[var(--it-hairline)]">
                      <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--it-faint)]">
                        {copy.matrixLabel}
                      </th>
                      {planColumns.map((plan) => (
                        <th
                          key={plan.id}
                          className={`w-32 px-3 py-3.5 text-center text-[11px] font-semibold uppercase tracking-[0.08em] ${
                            plan.id === selectedPlan ? "text-[var(--it-link)]" : "text-[var(--it-faint)]"
                          }`}
                        >
                          {plan.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pricingRows.map((row) => (
                      <tr key={row.label} className="border-b border-[var(--it-border-soft)] last:border-0">
                        <td className="px-5 py-3.5 text-[var(--it-muted)]">{row.label}</td>
                        {planColumns.map((plan) => {
                          const value = row.values[plan.id];
                          const selected = plan.id === selectedPlan;
                          return (
                            <td
                              key={plan.id}
                              className={`px-3 py-3.5 text-center ${selected ? "bg-[var(--it-primary-soft)]/40" : ""}`}
                            >
                              <FeatureValue
                                value={value}
                                includedLabel={copy.included}
                                excludedLabel={copy.notIncluded}
                              />
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-8 flex justify-center">
              {effectivePlanId === selectedPlan ? (
                <div className="inline-flex min-h-12 items-center justify-center rounded-lg border border-[var(--it-hairline)] bg-white px-6 text-sm font-semibold text-[var(--it-muted)] shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                  {copy.current}
                </div>
              ) : selectedPlan === "starter" || selectedPlan === "professional" ? (
                <div className="w-full max-w-sm">
                  <PayPalSubscribeButton plan={selectedPlan} locale={locale} />
                </div>
              ) : (
                <Link
                  href={localePath("/contact", locale)}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[var(--it-primary)] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--it-primary-hover)]"
                >
                  {copy.contactSales}
                  <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                </Link>
              )}
            </div>
          </div>

          {hasPayPalSubscription ? (
            <p className="mt-10 text-sm leading-6 text-[var(--it-muted)]">
              {copy.billingHistoryText}{" "}
              <a
                href={PAYPAL_MANAGE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[var(--it-primary-hover)] underline-offset-4 hover:underline"
              >
                {copy.manageInPayPal}
              </a>
            </p>
          ) : null}
      </section>
    </div>
  );
}
