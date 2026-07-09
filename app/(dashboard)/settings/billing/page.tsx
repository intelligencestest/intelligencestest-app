"use client";

import Link from "next/link";
import { Check, Minus } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { PayPalSubscribeButton } from "@/components/billing/PayPalSubscribeButton";
import { SettingsNav } from "@/components/settings/SettingsNav";
import { localePath, toAppLocale } from "@/lib/i18n/locales";

const PAYPAL_MANAGE_URL = "https://www.paypal.com/myaccount/autopay/";

type PlanId = "trial" | "starter" | "professional" | "enterprise";

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
      <span className="inline-flex items-center justify-center rounded-full border border-[var(--it-success)]/25 bg-[rgba(63,143,107,0.1)] p-1 text-[#91c7ad]">
        <Check className="h-3.5 w-3.5" aria-label={includedLabel} />
      </span>
    ) : (
      <span className="inline-flex items-center justify-center rounded-full border border-[var(--it-border)] bg-white/[0.025] p-1 text-[var(--it-faint)]">
        <Minus className="h-3.5 w-3.5" aria-label={excludedLabel} />
      </span>
    );
  }

  return <span className="text-sm font-semibold tabular-nums text-slate-100">{value}</span>;
}

export default function BillingSettingsPage() {
  const locale = toAppLocale(useLocale());
  const billingT = useTranslations("billing");
  const es = locale === "es";
  const [planData, setPlanData] = useState<PlanData | null>(null);
  const [loading, setLoading] = useState(true);

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
  const planColumns = [
    {
      id: "trial" as const,
      name: copy.freeTrial,
      price: copy.trialPrice,
    },
    {
      id: "starter" as const,
      name: copy.starter,
      price: copy.starterPrice,
    },
    {
      id: "professional" as const,
      name: copy.professional,
      price: copy.professionalPrice,
    },
    {
      id: "enterprise" as const,
      name: copy.enterprise,
      price: copy.enterprisePrice,
    },
  ];
  const pricingRows: Array<{ label: string; values: Record<PlanId, string | boolean> }> = [
    {
      label: copy.featureRecruiters,
      values: { trial: "1", starter: "1", professional: "5", enterprise: copy.unlimitedShort },
    },
    {
      label: copy.featureCandidateInvitations,
      values: { trial: "10", starter: "50", professional: "250", enterprise: copy.unlimitedShort },
    },
    {
      label: copy.featureProjects,
      values: { trial: "2", starter: "2", professional: "10", enterprise: copy.unlimitedShort },
    },
    {
      label: copy.featureExecutiveReports,
      values: { trial: true, starter: true, professional: true, enterprise: true },
    },
    {
      label: copy.featureAssessments,
      values: { trial: true, starter: true, professional: true, enterprise: true },
    },
    {
      label: copy.featureTeamCollaboration,
      values: { trial: false, starter: false, professional: true, enterprise: true },
    },
    {
      label: copy.featurePrioritySupport,
      values: { trial: false, starter: false, professional: true, enterprise: true },
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
        <h1 className="text-[28px] font-semibold leading-[34px] tracking-[-0.01em] text-white">{copy.title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--it-muted)]">{copy.description}</p>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[216px_minmax(0,1fr)] lg:items-start">
        <SettingsNav />

        <section>
          {/* Account summary — one typographic block, no cards */}
          <div className="border-b border-[var(--it-hairline)] pb-8">
            <h2 className="text-2xl font-semibold text-white">{loading ? copy.loading : planName}</h2>

            {!loading && planData ? (
              <p className="mt-1.5 text-[13px] text-[var(--it-muted)]">
                {metaParts.map((part, i) => (
                  <span key={part.text}>
                    {i > 0 && <span className="mx-1.5 text-[var(--it-faint)]">·</span>}
                    <span className={part.tone === "danger" ? "text-[#d99792]" : undefined}>{part.text}</span>
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
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
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

          {/* Plans — cards, not a table */}
          <div className="mt-10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--it-faint)]">
              {copy.availablePlans}
            </p>
            <p className="mt-1.5 max-w-2xl text-sm leading-6 text-[var(--it-muted)]">{copy.paymentMode}</p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {planColumns.map((plan) => {
                const active = effectivePlanId === plan.id;
                return (
                  <div
                    key={plan.id}
                    className={`flex h-full flex-col rounded-lg border p-6 ${
                      active ? "border-[var(--it-primary)]/50 bg-[var(--it-primary-soft)]" : "border-[var(--it-hairline)]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[13px] font-semibold text-slate-100">{plan.name}</p>
                      {active ? (
                        <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--it-primary-hover)]">
                          {copy.current}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-3 text-2xl font-semibold leading-tight text-white">{plan.price}</p>

                    <ul className="mt-6 space-y-2.5 text-[13px] text-[var(--it-muted)]">
                      {pricingRows.map((row) => (
                        <li key={row.label} className="flex items-center justify-between gap-3">
                          <span>{row.label}</span>
                          <FeatureValue
                            value={row.values[plan.id]}
                            includedLabel={copy.included}
                            excludedLabel={copy.notIncluded}
                          />
                        </li>
                      ))}
                    </ul>

                    <div className="mt-6 min-h-[40px]">
                      {active ? (
                        <p className="text-[13px] font-medium text-[var(--it-muted)]">{copy.current}</p>
                      ) : plan.id === "starter" || plan.id === "professional" ? (
                        <PayPalSubscribeButton plan={plan.id} locale={locale} />
                      ) : plan.id === "enterprise" ? (
                        <Link
                          href={localePath("/contact", locale)}
                          className="enterprise-button inline-flex h-10 w-full cursor-pointer items-center justify-center rounded-lg px-3 text-sm font-semibold"
                        >
                          {copy.contactSales}
                        </Link>
                      ) : null}
                    </div>
                  </div>
                );
              })}
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
    </div>
  );
}
