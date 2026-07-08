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
        account: "Cuenta",
        billing: "Facturación",
        security: "Seguridad",
        notifications: "Notificaciones",
        currentSubscription: "Suscripción actual",
        currentPlan: "Plan actual",
        status: "Estado",
        provider: "Proveedor",
        trialEnds: "La prueba finaliza",
        trialEnded: "La prueba finalizó",
        daysLeft: (days: number) => (days === 1 ? "Queda 1 día" : `Quedan ${days} días`),
        paymentMode: "PayPal está disponible para Starter y Professional. Enterprise se gestiona con el equipo comercial.",
        usage: "Uso del plan",
        usageNote: "Sus proyectos, candidatos e informes existentes permanecen accesibles aunque se alcance un límite.",
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
        tailored: "A medida",
        trialPrice: "14 días gratis",
        starterPrice: "49 €/mes",
        professionalPrice: "149 €/mes",
        enterprisePrice: "Contactar con ventas",
        action: "Acción",
        current: "Actual",
        subscribe: "Suscribirse con PayPal",
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
        feature: "Función",
        included: "Incluido",
        notIncluded: "No incluido",
        featureRecruiters: "Reclutadores",
        featureCandidateInvitations: "Invitaciones de candidatos",
        featureProjects: "Proyectos",
        featureExecutiveReports: "Informes ejecutivos",
        featureAssessments: "Evaluaciones",
        featureTeamCollaboration: "Colaboración de equipo",
        featurePrioritySupport: "Soporte prioritario",
        billingHistory: "Historial de facturación",
        billingHistoryText:
          "Sus facturas y recibos de PayPal están disponibles directamente en su cuenta de PayPal.",
        paymentMethod: "Método de pago",
        paymentMethodText:
          "El método de pago de esta suscripción se gestiona de forma segura en PayPal, no lo almacenamos aquí.",
        manageInPayPal: "Gestionar en PayPal",
      }
    : {
        title: "Plan and billing",
        description: "Manage your trial, usage limits, and IntelligencesTest subscription.",
        account: "Account",
        billing: "Billing",
        security: "Security",
        notifications: "Notifications",
        currentSubscription: "Current subscription",
        currentPlan: "Current plan",
        status: "Status",
        provider: "Provider",
        trialEnds: "Trial ends",
        trialEnded: "Trial ended",
        daysLeft: (days: number) => (days === 1 ? "1 day left" : `${days} days left`),
        paymentMode: "PayPal is available for Starter and Professional. Enterprise is handled by the commercial team.",
        usage: "Plan usage",
        usageNote: "Existing projects, candidates, and reports remain accessible even when a limit is reached.",
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
        tailored: "Tailored",
        trialPrice: "14-day free trial",
        starterPrice: "€49/month",
        professionalPrice: "€149/month",
        enterprisePrice: "Contact Sales",
        action: "Action",
        current: "Current",
        subscribe: "Subscribe with PayPal",
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
        feature: "Feature",
        included: "Included",
        notIncluded: "Not included",
        featureRecruiters: "Recruiters",
        featureCandidateInvitations: "Candidate invitations",
        featureProjects: "Projects",
        featureExecutiveReports: "Executive reports",
        featureAssessments: "Assessments",
        featureTeamCollaboration: "Team collaboration",
        featurePrioritySupport: "Priority support",
        billingHistory: "Billing history",
        billingHistoryText: "Your PayPal invoices and receipts are available directly in your PayPal account.",
        paymentMethod: "Payment method",
        paymentMethodText:
          "The payment method for this subscription is managed securely by PayPal — we don't store it here.",
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

  return (
    <div className="mx-auto max-w-[1220px] space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-[-0.01em] text-white">{copy.title}</h1>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-[var(--it-muted)]">{copy.description}</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[192px_minmax(0,1fr)] lg:items-start">
        <SettingsNav />

        <section className="space-y-5">
          <div className="enterprise-card rounded-xl p-5">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b enterprise-divider pb-5">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--it-faint)]">
                  {copy.currentSubscription}
                </p>
                <h2 className="mt-2 text-xl font-semibold text-white">{loading ? copy.loading : planName}</h2>
              </div>
              {effectivePlanId && (
                <span className="enterprise-chip-info inline-flex items-center rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em]">
                  {effectivePlanId === "trial" ? copy.freeTrial : copy.currentPlan}
                </span>
              )}
            </div>

            {loading ? (
              <p className="mt-5 text-sm text-[var(--it-muted)]">{copy.loading}</p>
            ) : planData ? (
              <div className="mt-5 grid gap-3 md:grid-cols-3">
                <div className="enterprise-panel rounded-lg px-4 py-3.5">
                  <p className="text-[11px] uppercase tracking-wider text-[var(--it-faint)]">{copy.status}</p>
                  <p className="mt-1 text-lg font-semibold text-slate-100">{subscriptionLabel}</p>
                </div>
                <div className="enterprise-panel rounded-lg px-4 py-3.5">
                  <p className="text-[11px] uppercase tracking-wider text-[var(--it-faint)]">{copy.provider}</p>
                  <p className="mt-1 text-lg font-semibold text-slate-100">
                    {planData.billingProvider === "paypal" ? copy.paypal : copy.manual}
                  </p>
                </div>
                {planData.trialEndsAt ? (
                  <div className="enterprise-panel rounded-lg px-4 py-3.5">
                    <p className="text-[11px] uppercase tracking-wider text-[var(--it-faint)]">
                      {planData.isTrialExpired ? copy.trialEnded : copy.trialEnds}
                    </p>
                    <p
                      className={`mt-1 text-lg font-semibold ${
                        planData.isTrialExpired ? "text-[#d99792]" : "text-slate-100"
                      }`}
                    >
                      {new Date(planData.trialEndsAt).toLocaleDateString(es ? "es-ES" : "en-US", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                    {activeTrial && planData.trialDaysLeft !== null ? (
                      <p className="mt-0.5 text-sm text-[var(--it-muted)]">{copy.daysLeft(planData.trialDaysLeft)}</p>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="mt-5 text-sm text-[var(--it-muted)]">{copy.billingUnavailable}</p>
            )}
          </div>

          {planData ? (
            <div className="enterprise-card rounded-xl p-5">
              <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--it-faint)]">
                    {copy.usage}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-[var(--it-muted)]">{copy.usageNote}</p>
                </div>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {usageRows.map((row) => (
                  <div key={row.label} className="enterprise-panel rounded-lg px-3.5 py-3">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="text-[13px] text-[var(--it-muted)]">{row.label}</p>
                      <p className="text-sm font-semibold tabular-nums text-slate-100">
                        {row.used}
                        <span className="font-normal text-[var(--it-faint)]">/{row.limit ?? copy.unlimited}</span>
                      </p>
                    </div>
                    {row.limit !== null ? (
                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                        <span
                          className={`block h-full rounded-full ${usageTone(row.used, row.limit)}`}
                          style={{ width: `${usagePercent(row.used, row.limit)}%` }}
                        />
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="enterprise-card rounded-xl p-5">
            <div className="border-b enterprise-divider pb-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--it-faint)]">
                {copy.availablePlans}
              </p>
              <h2 className="mt-2 text-xl font-semibold text-white">{copy.availablePlansText}</h2>
              <p className="mt-1 text-sm leading-6 text-[var(--it-muted)]">{copy.paymentMode}</p>
            </div>

            <div className="mt-5 overflow-x-auto rounded-xl border border-[var(--it-border-soft)]">
              <table className="w-full min-w-[820px] border-collapse text-left">
                <thead className="bg-[var(--it-surface-muted)]">
                  <tr>
                    <th className="w-[26%] px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--it-faint)]">
                      {copy.feature}
                    </th>
                    {planColumns.map((plan) => {
                      const active = effectivePlanId === plan.id;
                      return (
                        <th
                          key={plan.id}
                          className={`border-l border-[var(--it-border-soft)] px-4 py-4 align-top ${
                            active ? "bg-[var(--it-primary-soft)]" : ""
                          }`}
                        >
                          <div className="flex min-h-[62px] flex-col justify-between gap-2">
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-sm font-semibold text-slate-100">{plan.name}</span>
                              {active ? (
                                <span className="enterprise-chip-info inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em]">
                                  {copy.current}
                                </span>
                              ) : null}
                            </div>
                            <span className="text-base font-semibold leading-5 text-white">{plan.price}</span>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--it-border-soft)]">
                  {pricingRows.map((row) => (
                    <tr key={row.label}>
                      <th scope="row" className="bg-[var(--it-surface)] px-4 py-3.5 text-sm font-medium text-[var(--it-muted)]">
                        {row.label}
                      </th>
                      {planColumns.map((plan) => {
                        const active = effectivePlanId === plan.id;
                        return (
                          <td
                            key={`${row.label}-${plan.id}`}
                            className={`border-l border-[var(--it-border-soft)] px-4 py-3.5 ${
                              active ? "bg-[var(--it-primary-soft)]/60" : "bg-[var(--it-bg)]"
                            }`}
                          >
                            <FeatureValue
                              value={row.values[plan.id]}
                              includedLabel={copy.included}
                              excludedLabel={copy.notIncluded}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  <tr className="bg-[var(--it-surface-muted)]/70">
                    <th className="px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--it-faint)]">
                      {copy.action}
                    </th>
                    {planColumns.map((plan) => {
                      const active = effectivePlanId === plan.id;
                      return (
                        <td key={`${plan.id}-action`} className="border-l border-[var(--it-border-soft)] px-4 py-4 align-top">
                          {active ? (
                            <span className="enterprise-button-secondary inline-flex h-10 w-full items-center justify-center rounded-lg px-3 text-sm font-semibold">
                              {copy.current}
                            </span>
                          ) : plan.id === "starter" || plan.id === "professional" ? (
                            <div className="min-w-0">
                              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--it-faint)]">
                                {copy.subscribe}
                              </p>
                              <PayPalSubscribeButton plan={plan.id} locale={locale} />
                            </div>
                          ) : plan.id === "enterprise" ? (
                            <Link
                              href={localePath("/contact", locale)}
                              className="enterprise-button inline-flex h-10 w-full cursor-pointer items-center justify-center rounded-lg px-3 text-sm font-semibold"
                            >
                              {copy.contactSales}
                            </Link>
                          ) : (
                            <span className="enterprise-button-secondary inline-flex h-10 w-full items-center justify-center rounded-lg px-3 text-sm font-semibold opacity-70">
                              {copy.trialPrice}
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {hasPayPalSubscription ? (
            <div className="grid gap-6 md:grid-cols-2">
              <div className="enterprise-card rounded-xl p-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--it-faint)]">
                  {copy.billingHistory}
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--it-muted)]">{copy.billingHistoryText}</p>
                <a
                  href={PAYPAL_MANAGE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="enterprise-button-secondary mt-4 inline-flex h-9 items-center justify-center rounded-lg px-4 text-[13px] font-semibold"
                >
                  {copy.manageInPayPal}
                </a>
              </div>
              <div className="enterprise-card rounded-xl p-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--it-faint)]">
                  {copy.paymentMethod}
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--it-muted)]">{copy.paymentMethodText}</p>
                <a
                  href={PAYPAL_MANAGE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="enterprise-button-secondary mt-4 inline-flex h-9 items-center justify-center rounded-lg px-4 text-[13px] font-semibold"
                >
                  {copy.manageInPayPal}
                </a>
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
